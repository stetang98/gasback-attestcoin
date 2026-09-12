param(
    [string]$Voice = 'Microsoft Zira Desktop',
    [double]$TargetSeconds = 110
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$taskDir = $PSScriptRoot
$source = Get-Content -LiteralPath (Join-Path $taskDir 'narration-en.json') -Raw | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice($Voice)
$synth.Volume = 100
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(48000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$audioPath = Join-Path $taskDir 'GasBack-English-DRAFT-evidence-pending.wav'
$ratePercent = 100.0
$renderedSeconds = 0.0
$sampleRate = 48000
$samplesPerByte = 2
$joinPauseSamples = [int]($sampleRate * 0.3)
$renderAttempts = New-Object 'System.Collections.Generic.List[object]'

try {
    for ($attempt = 1; $attempt -le 5; $attempt++) {
        $renderedRatePercent = $ratePercent
        $clips = New-Object 'System.Collections.Generic.List[object]'
        $timeline = New-Object 'System.Collections.Generic.List[object]'
        $totalSamples = 0
        foreach ($segment in $source.segments) {
            $memory = New-Object System.IO.MemoryStream
            try {
                $synth.SetOutputToAudioStream($memory, $format)
                $escaped = [System.Security.SecurityElement]::Escape($segment.text)
                $rateText = $ratePercent.ToString('0.0', [System.Globalization.CultureInfo]::InvariantCulture)
                $ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><prosody rate="' + $rateText + '%">' + $escaped + '</prosody></speak>'
                $synth.SpeakSsml($ssml)
                $synth.SetOutputToNull()
                $pcm = $memory.ToArray()
                $sampleCount = [int]($pcm.Length / $samplesPerByte)
                $timeline.Add([PSCustomObject]@{id=$segment.id; startSeconds=[Math]::Round($totalSamples / $sampleRate, 3); endSeconds=[Math]::Round(($totalSamples + $sampleCount) / $sampleRate, 3); evidenceGate=$segment.evidenceGate})
                $clips.Add($pcm)
                $totalSamples += $sampleCount
                if ($clips.Count -lt $source.segments.Count) { $totalSamples += $joinPauseSamples }
            } finally { $memory.Dispose() }
        }
        $renderedSeconds = $totalSamples / $sampleRate
        $renderAttempts.Add([PSCustomObject]@{ratePercent=$renderedRatePercent; seconds=[Math]::Round($renderedSeconds, 3)})
        if ($renderedSeconds -le $TargetSeconds -and $renderedSeconds -ge ($TargetSeconds - 2)) { break }
        $ratePercent = [Math]::Round($ratePercent * $renderedSeconds / ($TargetSeconds - 0.5), 1)
    }
    if ($renderedSeconds -gt $TargetSeconds) { throw 'Narration exceeds target; increase the synthesis rate or target duration. No speech was truncated.' }
    $targetSamples = [int][Math]::Round($TargetSeconds * $sampleRate)
    $payloadBytes = $targetSamples * $samplesPerByte
    $stream = [System.IO.File]::Create($audioPath)
    $writer = New-Object System.IO.BinaryWriter($stream)
    try {
        $writer.Write([System.Text.Encoding]::ASCII.GetBytes('RIFF'))
        $writer.Write([int](36 + $payloadBytes))
        $writer.Write([System.Text.Encoding]::ASCII.GetBytes('WAVEfmt '))
        $writer.Write([int]16)
        $writer.Write([int16]1)
        $writer.Write([int16]1)
        $writer.Write([int]$sampleRate)
        $writer.Write([int]($sampleRate * $samplesPerByte))
        $writer.Write([int16]$samplesPerByte)
        $writer.Write([int16]16)
        $writer.Write([System.Text.Encoding]::ASCII.GetBytes('data'))
        $writer.Write([int]$payloadBytes)
        for ($clipIndex = 0; $clipIndex -lt $clips.Count; $clipIndex++) {
            $writer.Write([byte[]]$clips[$clipIndex])
            if ($clipIndex -lt ($clips.Count - 1)) { $writer.Write([byte[]]::new($joinPauseSamples * $samplesPerByte)) }
        }
        $writer.Write([byte[]]::new(($targetSamples - $totalSamples) * $samplesPerByte))
    } finally { $writer.Dispose(); $stream.Dispose() }

    $spoken = ($source.segments | ForEach-Object { $_.text }) -join "`r`n`r`n"
    [System.IO.File]::WriteAllText((Join-Path $taskDir 'narration-en.txt'), $spoken, [System.Text.UTF8Encoding]::new($false))
    $metadata = [PSCustomObject]@{
        status='PRODUCTION DRAFT - evidence gates pending; not published'
        voice=$Voice
        engine='Windows System.Speech / installed SAPI voice; local synthesis'
        synthesizedAtUtc=[DateTime]::UtcNow.ToString('o')
        synthesisRatePercent=$renderedRatePercent
        sampleRateHz=$sampleRate
        channels=1
        bitsPerSample=16
        durationSeconds=$TargetSeconds
        speechAndInterSegmentPauseSeconds=[Math]::Round($renderedSeconds, 3)
        finalPaddingSeconds=[Math]::Round($TargetSeconds - $renderedSeconds, 3)
        interSegmentPauseSeconds=0.3
        wordCount=([regex]::Matches($spoken, '\b[\w]+(?:[\x27-][\w]+)*\b')).Count
        audioFile=[System.IO.Path]::GetFileName($audioPath)
        sha256=(Get-FileHash -Algorithm SHA256 -LiteralPath $audioPath).Hash
        listeningCheck='Not performed; format and signal checks are separate from human listening.'
        renderAttempts=$renderAttempts
        segments=$timeline
    }
    $metadata | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $taskDir 'narration-metadata.json') -Encoding UTF8
    $metadata | Select-Object voice,synthesisRatePercent,durationSeconds,speechAndInterSegmentPauseSeconds,finalPaddingSeconds,wordCount,audioFile,sha256 | ConvertTo-Json -Compress
} finally { $synth.Dispose() }
