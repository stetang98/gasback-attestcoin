# GasBack 参赛交接

真实两链流程已完成：`integration/evidence/run.json` 于 `2026-09-12T06:51:34.633Z` 达到 `completed-live-testnet-rebate`，加强后的公开 RPC 复核记录为 `public-reverification-reviewed.json`（`07:04:13.308Z`），复审通过。网站、PDF、视频的最终公开版本同步与 DoraHacks 接收确认另行验收；当前尚不能称为已提交成功。

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
- 正式网页为 `https://gasback-ctc-2026.stetang.chatgpt.site`；公开 v1 已通过无 Cookie 的 HTTP 200 检查，本地完整流程回放已核验，待将新 PDF 与视频同步发布为 v2。
- 公开仓库 https://github.com/stetang98/gasback-attestcoin 已包含 `17da7ec` 的完整 integration 证据；本轮 README、PDF 与投稿文档另待同步。
- 英文 README、DoraHacks 文案、约 110 秒演示脚本与六页 PDF 已按真实流程更新。[仓库 PDF](https://github.com/stetang98/gasback-attestcoin/blob/main/docs/submission/GasBack-deck.pdf) 的新版同步、演示视频和 DoraHacks 接收结果仍须验收。计划直链 `/GasBack-deck.pdf` 与 `/demo.mp4` 尚未验证公开，不可当成已上线。
- 视频在 ChatCut V2 中拆成 7 个可编辑段落，旧旁白已静音；等待本人选择音色后生成新旁白。新版最终视频尚未公开，不能把旧版或本地预览说成最终发布。
- 用户已登录 DoraHacks，并进入实际 BUIDL 创建流程；登录完成不等于参赛提交已被接收。

## 用户需要提供的最少信息

用户已提供基础身份资料；本文不公开联系邮箱或社交账号。官方比赛说明要求每位真实参赛成员提供：

1. 姓、名，以及比赛联系邮箱。
2. 简短真实个人简介、在 GasBack 项目中的实际角色。
3. 常住国家与国籍。
4. 由本人确认主办方要求的参赛资格：无犯罪记录/无未决刑事案件、不属于受制裁个人或受制裁国家居民、当地法律允许参加，以及对提交材料拥有必要权利。

实际创建流程为 **Profile -> Details -> Team -> Contact**，2026-09-12 登录后观察到以下必填要求：

- Profile 的 Logo 带星号：PNG/JPEG，大小低于 2 MB；480 x 480 是建议尺寸，并非硬性尺寸要求。
- Profile 的 social links 至少填写一条链接。
- Contact 的主要联系方式 **Telegram 必填**；已向用户询问所需 Telegram 信息。备用联系方式可选择 Discord、WhatsApp 或 WeChat，实际联系方式仅填表，不公开写入项目文档。

公开比赛说明把 Telegram 标为 optional，但当前真实表单把它设为必填，提交时须按实际表单完成。X、LinkedIn、简历在公开比赛说明中为可选；仍需满足 Profile 至少一条社交链接的要求。不要编造 Telegram 账号来通过表单。

资格限制须先解释清楚，再由用户依据真实情况确认；不能把用户尚不了解限制时的表示直接当作知情确认。官方资格段落没有给出受制裁国家名单或采用的制裁体系，也没有把中国单独列为禁止参赛国家，不能仅因居住中国就判断不合规。AI 助手不能充当人类队员，也不能替用户证明个人资格。

不要提供身份证扫描件、钱包助记词或私钥来填写普通参赛信息；当前已读取的表单要求没有这些字段。

GitHub 公开源码上传、测试币到账、真实支付和 DoraHacks 登录已完成。当前尚需本人 Telegram 及对已解释资格条件的事实声明；不需要为了回放重复支付或重新索取助记词。当前没有依据要求另交独立外部报名表；若后续实际流程明确提出，再按页面处理。

## 提交前最后验收

1. 已完成先发 ticket、后源失败、再 Creditcoin 支付；核对投稿链接指向本项目这次真实交易。
2. 原始 proof、两链回执、到账余额、状态变更与重复领取拒绝证据已保存，核对公开仓库同步结果。
3. 完成约 110 秒视频并检查完整播放；保留等待时长、CLI 执行与网页只读回放的说明。
4. 检查 GitHub、网页、PDF、视频均能公开打开，且未包含密钥或个人隐私。
5. 在 DoraHacks 填写真实成员资料，提交并看到接收确认；再次打开实际 BUIDL 页面检查内容。

官方截止时间为 **2026 年 9 月 13 日 23:59 ET，即北京时间 9 月 14 日 11:59**；用户要求的内部完成目标为 9 月 12 日。获奖结果预计 9 月 20 日公布。开发完成、提交成功和获奖是三个不同状态，需分别有证据。

官方来源：[比赛规则](https://dorahacks.io/hackathon/buidl-ctc-2026-fall/detail)、[主办方官网](https://buidl.creditcoin.org/)。
