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
