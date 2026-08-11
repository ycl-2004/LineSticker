# LINE Sticker Cutter — GitHub Release

## Goal

将当前 LINE Sticker Cutter 发布到 `ycl-2004/LineSticker`，并启用、验证 GitHub Pages 静态部署。

## Acceptance criteria

- [x] 仅 `Line Sticker` 目录的当前项目文件被纳入首次提交。
- [x] 提交已推送到 `https://github.com/ycl-2004/LineSticker` 的默认分支。
- [ ] GitHub Pages 已配置为从默认分支根目录部署，或明确记录阻塞原因。
- [ ] 部署网址可访问并返回项目页面。

## Requirements (append-only)

1. 将项目 commit 并 push 到 `https://github.com/ycl-2004/LineSticker`。
2. 确保项目部署在 GitHub Pages。

## Decision log

- 2026-08-10：用户明确授权提交、推送与 Pages 配置；首次提交范围限定为本项目目录。
- 2026-08-10：远程 `git ls-remote` 可访问且未返回 refs，视为可推送的空仓库；`gh auth status` 显示 CLI token 无效，Pages API 配置可能需要重新认证或浏览器会话。
- 2026-08-10：`main` 已成功推送；浏览器 GitHub 会话同样为未登录，无法访问仓库 Pages 设置。公开预期网址目前为 GitHub Pages 404，故部署尚未启用。

## Evidence

- `node --check app.js` 通过，且 `git diff --cached --check` 无空白错误。
- 初始提交：`fc9473d Publish LINE Sticker Cutter`；推送结果：`main -> main`，已设为追踪 `origin/main`。
- 已访问 `https://ycl-2004.github.io/LineSticker/`，实际返回 GitHub Pages 404「There isn't a GitHub Pages site here.」
- 阻塞：GitHub CLI token 无效，浏览器会话也未登录，无法进入 `https://github.com/ycl-2004/LineSticker/settings/pages` 配置 Pages。

---

# LINE Sticker Cutter — A + C Mobile Workspace

## Goal

在不破坏既有贴图裁切逻辑与关键 DOM ID 的前提下，将页面改为「上传前 Compact Editorial、上传后 Preview First」的紧凑移动工作台。

## Acceptance criteria

- [x] 上传前保留黄／薄荷／桃色、serif 红色标题与工作台品牌感，同时缩短 header、hero、上传区与底部 CTA。
- [x] 上传后自动隐藏 hero，上传区切换为紧凑的「更換圖片」操作，并让裁切预览排在数量选择之前。
- [x] AI Prompt 默认收起；所有关键静态图标使用统一的 SVG icon slot，而非混用 Unicode glyph。
- [x] 现有上传、数量选择、格线拖曳、Prompt 复制、裁切、下载、移除图片与重置功能仍可用。
- [x] 「下载全部 PNG」逐张触发已裁切的 PNG 下载，不再建立 ZIP。
- [x] 在 320px、390px 和桌面宽度完成无横向溢出与核心流程验证。

## Requirements (append-only)

1. 以方向 A（上传前 Compact Editorial）加方向 C（上传后 Preview First）的组合重做当前 UI。
2. 保留当前视觉语言，而非替换成另一套品牌。
3. 可参考现有模板／原型的思路，但要直接替换当前 `index.html` 与 `style.css` 并成功衔接现有功能。
4. 手机端不再提供 ZIP 作为「全部下载」的默认结果；改为一次触发所有 PNG 的下载。

## Decision log

- 2026-08-10：主参考选择 `sanity` design-md 的编辑式结构化工作区，只借鉴紧凑层级与内容优先，不复制外部品牌。
- 2026-08-10：预览区在 DOM 中移动至上传区之后，以便图片上传后自然成为下一步的视觉主角；现有 `#crop-preview-section` 与 canvas ID 保持不变。
- 2026-08-10：以 `body.has-source-image` 表达上传状态，避免仅依赖 CSS `:has()`，并由既有上传／移除／重置流程同步。
- 2026-08-10：浏览器安全模型不允许静态网页无提示地把图片写入 iOS/Android 相册或任意资料夹；「一键下载全部 PNG」会逐张触发浏览器下载，保存位置仍由手机浏览器／系统设定决定。

## Evidence

- `node --check app.js` 与 `git diff --check` 通过。
- ego-browser 390px：初始态无横向溢出、Prompt 默认关闭；上传后 `has-source-image` 生效、hero 为 `display:none`、上传按钮为「更換圖片」、预览在数量区之前且裁切按钮启用。
- ego-browser 390px：8 张真实裁切完成（8 / 8、8 个结果、无错误）；「下载全部 PNG（8 张）」同步触发 `sticker_01.png` 至 `sticker_08.png` 共 8 次，操作后按钮恢复可用。
- ego-browser 390px：移除图片后 hero、初始上传文字与禁用裁切状态均恢复，预览与结果隐藏。
- ego-browser 320px 初始态与 1280px 上传态均无横向溢出；桌面上传态预览宽 1036px，数量区位于其后且裁切按钮可用。

---

# LINE Sticker Cutter — Resolution Controls

## Goal

让使用者能控制生成大图与导出 PNG 的解析度，同时清楚区分真实来源品质、浏览器插值与 LINE 上架规格。

## Acceptance criteria

- [x] 可选择每格 256／512／1024px 的生成大图品质，建议尺寸与 AI Prompt 同步更新。
- [x] 可选择 LINE 合规、保留原尺寸或 2× HD 主档导出；非 LINE 输出不能被标示成合规。
- [x] 上传低解析来源时明确提示「放大不会补回真实细节」，但仍保留可用导出路径。
- [x] 现有裁切、近白去背、预览、下载与 8／16／24／40 张流程保持可用。

## Requirements (append-only)

1. 让用户可调整生成与导出的解析度／清晰度，改善贴图小、糊的问题。

## Decision log

- 2026-08-10：LINE Creators Market 的单张 PNG 上限为 370×320、1MB，并会自动缩放；因此 LINE 模式不可通过提高导出尺寸改善真实细节。
- 2026-08-10：浏览器 Canvas `drawImage()` 和 image smoothing 只做重采样，不能从 256px 来源重建细节；真正提升品质需先以 512px 或 1024px 每格生成／上传来源大图。
- 2026-08-10：默认提供 LINE 合规导出与非 LINE 2× HD 主档两个清楚标示的用途，避免大档被误上传到 LINE。

## Evidence

- 诊断：当前 `resizeSticker()` 以 `Math.min(1, ...)` 限制缩放，所以 256px 来源裁切出的约 254px 内容不会被放大；Prompt 当前每格也只要求 256px。
- 参考：[LINE Creators Market sticker guidelines](https://creator.line.me/en/guideline/sticker/)；[MDN Canvas image smoothing](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled)。
- `node --check app.js` 与 `git diff --check` 通过。
- ego-browser 390px：标准模式 Prompt 含 `1024 × 512 px` 与 `256 × 256 px`；高清模式含 `2048 × 1024 px` 与 `512 × 512 px`；无横向溢出。
- ego-browser 390px：8 张来源在 LINE 模式完成 8／8，首张为 198×198、状态「✓ 符合基本規格」；2× HD 完成 8／8，首张为 396×396、状态「2× HD 主檔（非 LINE）」且批量档名为 `sticker_01_hd.png`～`sticker_08_hd.png`。
- ego-browser 320px：8／16／24／40 的高清建议尺寸分别为 2048×1024、2048×2048、2048×3072、2560×4096；Prompt 默认收起且无横向溢出。
- ego-browser 上传每格约 200px 的测试来源：明确显示「低于所选 512 px／格；匯出放大不會補回真實細節」。

---

# LINE Sticker Cutter — 8 张 2×4 与裁切边界

## Goal

将 8 张贴图的正式网格改为 2 栏 × 4 行，并让比例校验、裁切预览与说明一致，避免使用者把外框与可调格线混淆。

## Acceptance criteria

- [x] 8 张配置、建议来源尺寸与 Prompt 均使用 2 × 4；高清来源建议为 1024 × 2048 px。
- [x] 2:4 来源可裁切，4:2 来源会显示明确的比例不符原因。
- [x] 预览以红色粗实线表示图片外框、青色虚线与橘色点表示内部可调格线，并提供图例。
- [x] 说明清楚区分「建议来源尺寸」与「上传外框比例检查」。

## Requirements (append-only)

1. 将 8 张网格从 4 × 2 改为 2 × 4，并修正比例不符造成无法裁切的问题。
2. 更清楚区分裁切预览的最终外框与可拖曳格线。
3. 说明建议尺寸与上传格式／比例检查的判断方式。

## Decision log

- 2026-08-10：建议来源尺寸只由已选贴图数量与「生成大图品质」决定；不会从上传图片推断内部栏列。
- 2026-08-10：比例检查只比较整张图片的外框宽高比（容差 15%），可阻止 2:1 的 4 × 2 图片被当作 1:2 的 2 × 4 图片，但不能确认图片内部真实格数。
- 2026-08-10：外框保留可调整能力，以红色实线标示；内部格线用青色虚线与橘色拖曳点标示。

## Evidence

- `node --check app.js`、`git diff --check` 通过。
- ego-browser 390px：选择 8 后显示 `2 × 4`，高清建议为 `1024 × 2048 px`／`512 × 512 px`；生成 Prompt 含 `2 欄 × 4 行` 与 `1024 × 2048 px`。
- ego-browser 390px：真实 512 × 1024 测试图通过比例检查、裁切按钮可用，并完成 `8 / 8` 张，显示 8 张结果与「下載全部 PNG（8 張）」。
- ego-browser 390px：反向 1024 × 512 测试图显示预期 `1:2.00`、实际 `2.00:1` 的说明；公开校验结果为 2 × 4 `true`、4 × 2 `false`。
- canvas 像素检查：外框为 RGB `198, 87, 91` 的红色实线；内部格线为 RGB `23, 89, 91` 的青色虚线；拖曳点为 RGB `232, 111, 81`。手机视窗无横向溢出。

---

# LINE Sticker Cutter — 强化裁切格线辨识

## Goal

让大图裁切预览在复杂或白色背景上也能立即辨认「最终裁切外框」与「内部可调整格线」。

## Acceptance criteria

- [x] 外框具有明显的红色边缘带、双层实线与「最終裁切外框」标签。
- [x] 内部格线具白色衬底、粗青色虚线与高对比橘色拖曳点。
- [x] 不改变既有格线拖曳、重设与裁切结果计算。

## Requirements (append-only)

1. 根据实际预览截图，让裁切线明显到能快速判断外框与内部格线。

## Decision log

- 2026-08-10：裁切范围用红色、实线、边缘带与文字标签四重提示；可调内部线保留青色虚线与橘色把手，避免仅依赖颜色区分。

## Evidence

- `node --check app.js`、`git diff --check` 通过。
- ego-browser 1280px：4 × 6 测试图的预览标签显示「最終裁切外框」，网格为 4 × 6，且无横向溢出。
- canvas 像素检查：外框红色主线为 RGB `184, 65, 70`、可见浅红边缘带；内部虚线为 RGB `12, 86, 90` 且带白色衬底；拖曳点为 RGB `255, 184, 102`。本次只改变绘制样式，既有指针拖曳／裁切计算函数未改动。

---

# LINE Sticker Cutter — 恢复 ZIP 整包下载

## Goal

将「下载全部」恢复为一次生成一个包含所有 PNG 的 ZIP 档案，而非浏览器逐张触发下载。

## Acceptance criteria

- [x] 主下载按钮明确显示 ZIP，并在单次点击后下载一个包含所有 PNG 的 `.zip` 档案。
- [x] ZIP 在浏览器本地以无压缩（STORE）方式产生，不上传任何图片，也不需要第三方 CDN。
- [x] 单张 PNG 下载保留，README 与测试说明同步为 ZIP 行为。

## Requirements (append-only)

1. 恢复全部输出为一个 ZIP，而不是一次下载所有 PNG。

## Decision log

- 2026-08-10：采用内建、无压缩 ZIP 写入器，避免恢复已删除的第三方压缩库或增加网络依赖；PNG 本身已经压缩，STORE 不会牺牲成品品质。

## Evidence

- `node --check app.js`、`git diff --check` 通过。
- ego-browser 390px：透明 2 × 4 测试图完成 `8 / 8` 张，主按钮显示「下載 ZIP（8 張 PNG）」。
- 实际点击 ZIP 后取得 `application/zip`、44,208 bytes；local-file 签名为 `0x04034b50`、中央目录结束签名为 `0x06054b50`，中央目录有 8 项：`sticker_01.png` 至 `sticker_08.png`。
