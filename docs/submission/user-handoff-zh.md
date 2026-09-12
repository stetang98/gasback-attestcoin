# GasBack 参赛交接

真实两链流程已完成并通过复审，GitHub Pages 已部署，7 个公开文件匿名 HTTP 200 且哈希与本地一致；新站 UI 验证真实 proof、native 和支付成功。DoraHacks 已显示 BUIDL Submitted!，项目 [GasBack 48594](https://dorahacks.io/buidl/48594) 已提交 BUIDL CTC 2026 Fall，DeFi 赛道，当前 Under Review (not publicly visible yet)。项目页明确提示暂未公开可见；这是提交接收确认，不是审核通过或获奖。本人资格为已自述、未经独立核验；未来领奖资格及支付仍待澄清，不是尚未提交的阻塞。

## 项目是什么

GasBack 为协议方提供固定额度的失败交易补贴。赞助方先授权一张绑定交易发送人、目标合约、nonce、完整输入哈希、最低 gas limit、源链区块范围及领取期限的票据。用户交易失败后，Creditcoin 合约通过 Attestcoin 验证真实回执，再按票据向固定收款人支付一次测试币补贴。

参赛主赛道是 DeFi。项目使用测试资产；不是保险，也不承诺返还全部 gas 费。演示会明确说明失败是故意构造的，不把失败证明夸大为平台责任或经济损失证明。

## 已有材料与当前边界

- Solidity 合约、42 项策略/安全测试场景及独立源码审查已经形成；本地 verifier harness 不等于真实密码学验证。
- 最新复审关闭了独立复核脚本的 P2 证据关联问题；42 项合约、10 项网页、16 项复核脚本测试及真实 RPC/native/余额/重复领取重验均通过。审查范围内无剩余 Critical/Important 问题；这不等于对整个项目或 native 预编译做过专业安全审计。
- Sepolia 源合约地址 `0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea` 已有成功部署回执。
- [Creditcoin 票据](https://creditcoin-testnet.blockscout.com/tx/0x261916243b9d6b4ab526e38a98337eac7f50e371561153939b35c668ed647ac1) 在源交易广播前确认；独立区块时间分别为票据 06:41:45 UTC、源失败 06:42:00 UTC。两链 RPC 时间记录支持本次先授权后执行，源 UTC 时间不在 Attestcoin 交易编码内。
- [真实 Sepolia 失败交易](https://sepolia.etherscan.io/tx/0xaa0c0551306e1e1fb0e2dd603439356ff472e48aadc3b0c8d88013d2760f3d9a) 位于区块 11,687,232，status 0、零日志、gasUsed 22,440；本次失败为明确披露的故意 revert。
- [真实 Creditcoin claim](https://creditcoin-testnet.blockscout.com/tx/0xd4dd04ac3686498d4baf090119dfbb7848c1ffba96724743669cb9f1de744035) 位于区块 5,473,655，status 1；固定补贴转账为 **1 test CTC**，vault 由 10 降到 9。收款人也是领取 gas 的支付人，所以钱包**净增 0.9999184485 test CTC**，另付 gas **0.0000815515 test CTC**；独立区块前后余额校正通过。
- 真实 native proof 验证通过；修改已证明的 status 字节会触发 Merkle proof 拒绝。错误链、未出票、重复领取分别以 `WrongSourceChain`、`TicketNotIssued`、`TicketAlreadyClaimed` 拒绝。这四项均为只读调用，没有第二笔被挖出的 claim。真实成功回执和其他输入条件仍以本地测试覆盖，不能把改字节测试说成另发了一笔成功源交易。
- 从失败确认到首次观察到 attestation 就绪为 **8 分 54.575 秒**；native 验证完成为 **8 分 57.415 秒**；claim 提交到确认 **5.061 秒**。轮询间隔 15 秒，这是本次观测耗时，不是协议精确发布时间或后续速度承诺。
- 目标合约源码已在 [Blockscout 完整验证](https://creditcoin-testnet.blockscout.com/address/0xB2A5c2772689C05d02E101E8137Aabd3B72C57Ea?tab=contract)，不等于专业安全审计。
- 本次部署、出票、源动作与领取由 **CLI** 执行；网页是**只读证据回放与验证**，不是通过回放按钮重新发起支付。历史 feasibility probe 与本项目真实 run 分开记录。
- [正式网站](https://stetang98.github.io/gasback-attestcoin/) 已上线；[视频页](https://stetang98.github.io/gasback-attestcoin/demo.html)、[MP4](https://stetang98.github.io/gasback-attestcoin/demo.mp4)、[字幕](https://stetang98.github.io/gasback-attestcoin/demo.srt)、[PDF](https://stetang98.github.io/gasback-attestcoin/GasBack-deck.pdf) 和三份证据 JSON 共 7 个文件匿名 HTTP 200，哈希均与本地一致。新站 UI 显示 REBATE PAID、1.0 test CTC，并阻止重复回放领取；实际 proof/native/payment 验证通过。
- [公开仓库](https://github.com/stetang98/gasback-attestcoin) 已提供完成的链上证据和复审后的源码；英文 README、DoraHacks 文案及六页 PDF 均依据真实流程。
- 当前 Peter V3 视频已发布：12,121,489 bytes，SHA-256 `d20a94b87b962702367f379bfb23bd2fcd8240f0ec42b6bd8c6b982556041c1c`。PDF 为 12,205 bytes，SHA-256 `c5e06b0efea9bfbd4af766ee25e72c8e52a289310855c32ec67bd15326717aee`。两者公网字节均与本地一致；Peter 旁白保留 7 段同步音轨与 24 张字幕卡，旧音轨静音。
- 新站当前 Peter V3 视频已播放到结尾：currentTime=duration=110.08、ended=true、paused=true、readyState=4、error=null，currentSrc 为 demo.mp4?v=peter-v3。完整人工听感尚未记录。
- DoraHacks Profile、Details、Team、Contact 已恢复为新网址并逐步保存成功，最终字段已填好。随后实际显示 BUIDL Submitted! 和 Under Review (not publicly visible yet)；项目地址 https://dorahacks.io/buidl/48594 ，赛道 DeFi，评审开始前仍可编辑。

## 用户需要提供的最少信息

用户已提供基础身份资料；本文不公开联系邮箱或社交账号。官方比赛说明要求每位真实参赛成员提供：

1. 姓、名，以及比赛联系邮箱。
2. 简短真实个人简介、在 GasBack 项目中的实际角色。
3. 常住国家与国籍。
4. 主办方要求的参赛资格包括无犯罪记录/无未决刑事案件、不属于受制裁个人或受制裁国家居民、当地法律允许参加，以及对提交材料拥有必要权利；本人已自述符合此前列明的要求，未作独立核验。

实际创建流程为 **Profile -> Details -> Team -> Contact -> Submission**，2026-09-12 登录后观察到以下必填要求：

- Profile 的 Logo 带星号：PNG/JPEG，大小低于 2 MB；480 x 480 是建议尺寸，并非硬性尺寸要求。
- Profile 的 social links 至少填写一条链接。
- Contact 的主要联系方式 **Telegram 必填**；本人提供的 Telegram 主联系和 WeChat 备用联系已填写，点击 Continue 后出现 `Saved successfully` 并进入 Submission。不再重复索取联系方式，具体账号不公开写入项目文档。

公开比赛说明把 Telegram 标为 optional，但当前真实表单把它设为必填，提交时须按实际表单完成。X、LinkedIn、简历在公开比赛说明中为可选；仍需满足 Profile 至少一条社交链接的要求。不要编造 Telegram 账号来通过表单。

本人曾明确自述符合前述参赛资格，同时询问限制，之后已获得解释。这记录为本人自述，不能写成从未声明，也不能写成已独立核验或已在解释后再次确认。已沿用既有参赛授权与本人自述完成免费项目提交，不因未来奖金条款未明而要求重复声明。平台 Terms of Use Agreement 第 4 条涉及中国公民及受 OFAC 制裁国家公民参与 BUIDL 相关金融交易，未直接禁止本次免费技术项目提交；独立的 grant donation 限制针对作出捐赠，Hackathon Prize Safe 则描述可选第三方奖金资金处理。未来领奖资格、实际支付方式与该金融条款的适用范围仍待澄清，不据此保证可领奖或发起金融交易。AI 助手不能充当人类队员，也不能替用户证明个人资格。

不要提供身份证扫描件、钱包助记词或私钥来填写普通参赛信息；当前已读取的表单要求没有这些字段。

GitHub 公开源码、测试币到账、真实测试网支付、GitHub Pages 发布和 DoraHacks 提交接收均已完成。本人资格自述与未来领奖支付问题分别记录；后者不作为免费技术项目提交禁令。资格询问信仅保存为私有草稿，尚未发送。

## 后续事项

1. 当前 Peter V3 公网视频已播放到 110.08 秒末尾，无媒体错误；匿名文件、哈希与新站真实 proof/native/payment 验证也已通过。完整人工听感尚未记录。
2. 项目已提交、审核中，项目页暂未公开可见；记录后续真实评审结果，不把提交成功写成审核通过或获奖。评审开始前可修改项目。
3. 若后续涉及领奖，在任何奖金金融交易前分别澄清领取资格、条款适用范围及实际合法支付方式。当前询问信未发送，未发起金融交易。

先出票、源失败、真实测试币支付、证据复核、V3 公开发布、匿名文件/哈希验证和 DoraHacks 提交接收均已完成。视频已播放至末尾，完整人工听感尚未记录；项目已提交、审核中且暂未公开可见，不代表审核通过或获奖。

官方截止时间为 **2026 年 9 月 13 日 23:59 ET，即北京时间 9 月 14 日 11:59**；用户要求的内部完成目标为 9 月 12 日。获奖结果预计 9 月 20 日公布。开发完成、提交成功和获奖是三个不同状态，需分别有证据。

官方来源：[比赛规则](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail)、[主办方官网](https://buidl.creditcoin.org/)。
