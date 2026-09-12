/* Application-specific vanilla adaptation of React Bits DarkVeil by David Haz.
 * Original shader license: MIT + Commons Clause. Keep react-bits-darkveil/LICENSE.md.
 * For integration into this application, not standalone component redistribution.
 */
import { Renderer, Program, Mesh, Triangle, Vec2 } from 'ogl';
import { vertex, fragment } from './darkveil-shaders.js';

export const OFFICIAL_DEFAULTS = Object.freeze({
  hueShift: 0, noiseIntensity: 0, scanlineIntensity: 0, speed: 0.5,
  scanlineFrequency: 0, warpAmount: 0, resolutionScale: 1, lightMode: false,
});

// A local starting point for the requested green glow. Expense It values are unknown.
export const GREEN_PRESET = Object.freeze({ ...OFFICIAL_DEFAULTS, hueShift: 110, speed: 0.45 });

export function mountDarkVeil(canvas, options = {}) {
  if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError('Expected a canvas element');
  const parent = canvas.parentElement;
  const settings = { ...OFFICIAL_DEFAULTS, pixelRatio: 1, respectReducedMotion: true, ...options };
  const renderer = new Renderer({ canvas, dpr: settings.pixelRatio, alpha: false, antialias: false });
  const gl = renderer.gl;
  if (!gl) throw new Error('WebGL is unavailable');
  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex, fragment,
    uniforms: {
      uTime: { value: 0 }, uResolution: { value: new Vec2(1, 1) },
      uHueShift: { value: settings.hueShift }, uNoise: { value: settings.noiseIntensity },
      uScan: { value: settings.scanlineIntensity }, uScanFreq: { value: settings.scanlineFrequency },
      uWarp: { value: settings.warpAmount }, uLightMode: { value: settings.lightMode ? 1 : 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry, program });
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0, disposed = false, paused = false, elapsed = 0, last = performance.now();
  function draw() {
    if (disposed) return;
    program.uniforms.uTime.value = elapsed;
    program.uniforms.uHueShift.value = settings.hueShift;
    program.uniforms.uNoise.value = settings.noiseIntensity;
    program.uniforms.uScan.value = settings.scanlineIntensity;
    program.uniforms.uScanFreq.value = settings.scanlineFrequency;
    program.uniforms.uWarp.value = settings.warpAmount;
    program.uniforms.uLightMode.value = settings.lightMode ? 1 : 0;
    renderer.render({ scene: mesh });
  }
  function resize() {
    const width = Math.max(1, parent.clientWidth), height = Math.max(1, parent.clientHeight);
    renderer.setSize(Math.max(1, width * settings.resolutionScale), Math.max(1, height * settings.resolutionScale));
    // Framebuffer dimensions keep the same composition at different pixel densities.
    program.uniforms.uResolution.value.set(gl.drawingBufferWidth, gl.drawingBufferHeight);
    canvas.style.width = '100%'; canvas.style.height = '100%';
    draw();
  }
  function loop(now) {
    const delta = Math.min((now - last) / 1000, 0.1); last = now;
    if (!paused && !document.hidden && !(settings.respectReducedMotion && media.matches)) {
      elapsed += delta * settings.speed; draw();
    }
    frame = requestAnimationFrame(loop);
  }
  const observer = new ResizeObserver(resize); observer.observe(parent);
  resize(); frame = requestAnimationFrame(loop);
  return {
    settings,
    update(next = {}) { Object.assign(settings, next); resize(); },
    pause(value = true) { paused = value; },
    renderAt(seconds) { elapsed = seconds; draw(); },
    destroy() {
      if (disposed) return;
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      geometry.remove(); program.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
