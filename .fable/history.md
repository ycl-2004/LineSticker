# AI LINE Sticker Maker

## Goal

建立可部署到 GitHub Pages 的手機優先 AI LINE Sticker Maker MVP。所有圖片處理必須在使用者瀏覽器完成，並支援 8、16、24、40 張貼圖的自動網格裁切、透明 Trim、等比例 Resize、PNG 與 ZIP 下載。

## Acceptance criteria

- [x] 支援 8 / 16 / 24 / 40 張，預設 24 張且核心不寫死 24。
- [x] 支援 PNG、JPG、JPEG、WEBP 上傳與圖片資訊顯示。
- [x] 依設定網格從左至右、由上至下裁切，使用安全邊界。
- [x] 透明來源依 alpha 執行 Trim；不透明白底來源在預設近白去背後執行透明 Trim。
- [x] 輸出 PNG，保持比例，最大 370 × 320 px，檢查 1 MB。
- [x] 支援單張 PNG 下載、全部 ZIP 下載與重新開始。
- [x] 手機優先介面可在 320px 以上寬度操作，不需橫向捲動。
- [x] 顯示隱私聲明、Developer: Cutefish 與單一雲端資料夾入口。
- [x] README 包含 GitHub Pages 部署與測試說明。
- [x] AI Prompt 會依目前數量與尺寸更新，文字可編輯且可一鍵複製，不在頁面展開完整內容。
- [x] 不透明白底圖片預設開啟近白背景移除；透明來源保留 alpha Trim，且可手動關閉近白背景移除。

## Requirements (append-only)

1. 建立純 HTML、CSS、JavaScript 的獨立專案。
2. 專案位置為 `Line Sticker`。
3. 第一階段部署 GitHub Pages，未來可部署 Netlify。
4. 支援 8 / 16 / 24 / 40 張，預設 24 張。
5. 所有圖片處理 client-side，不使用後端、資料庫、登入或圖片上傳 API。
6. 提供裁切、Trim、Resize、規格檢查、預覽、單張下載與 ZIP 下載。
7. 對透明圖片保留 alpha，不將白色背景誤判為透明。
8. 新增 `Developer: Cutefish`。
9. 新增單一可替換的雲端資料夾連結入口。
10. 建立 README、測試案例與已知限制說明。
11. 選擇貼圖數量時，顯示以 256 × 256 px 單格換算的建議整張圖片尺寸。
12. 新增可依目前貼圖數量與尺寸產生專業 AI 生圖提示詞的區塊，支援複製使用。
13. 使用實際 v1 / v2 AI 生成大圖驗證裁切對齊、跨格內容與網格誤判問題。
14. 以提供的手機截圖作為 UI 視覺驗收基準，檢查 390px 寬度的單欄流程與固定底部 CTA。
15. 在裁切前提供可拖曳網格位置與手動近白背景移除選項，並保持預設不誤刪白色內容。
16. 支援在裁切預覽中逐條調整垂直／水平格線與外圍邊界，而不是只能整體移動網格。
17. 最新決定：不透明白底圖片預設開啟近白背景移除；透明來源仍保留 alpha Trim，且使用者可以手動關閉近白背景移除。

註：第 17 項是後續明確決定，覆蓋第 15 項「預設不誤刪白色內容」與第 7 項對不透明白底的預設行為；透明來源仍不以白色像素判斷透明。

## Decision log

- 2026-08-10：採用原生 HTML/CSS/JavaScript，不使用 Python、Node backend 或框架。
- 2026-08-10：使用可變 `STICKER_CONFIGS` 設定表，避免將 24 張寫死在核心流程。
- 2026-08-10：使用本地 JSZip 檔案，讓 GitHub Pages 免於依賴 CDN。
- 2026-08-10：雲端資料夾入口以 `CLOUD_FOLDER_URL` 單一設定值管理，不讀取雲端內容。
- 2026-08-10：新增建議來源尺寸：8 張 1024×512、16 張 1024×1024、24 張 1024×1536、40 張 1280×2048；每格均為 256×256 px。
- 2026-08-10：AI prompt generator 採英文預設、中文可切換；背景提供透明 alpha（建議）與純白兩種描述，不改變裁切器的白底安全規則。
- 2026-08-10：診斷確認整張圖片比例檢查不能可靠辨識內部欄列；同為 1024×1536 的 4×6 與 5×6 圖片可能通過相同檢查，因此不將比例檢查宣稱為自動網格辨識。
- 2026-08-10：依手機 UI 參考圖新增裁切前網格預覽、手機固定底部開始裁切 CTA、可拖曳 X/Y 網格位移與重設按鈕。
- 2026-08-10：白底去背採手動 opt-in，使用從邊緣連通的近白色 flood fill；預設維持關閉，避免把白色衣服、文字或裝飾誤刪。
- 2026-08-10：依使用者回饋改為每條 X/Y 格線獨立拖曳，限制相鄰格至少 32 px，裁切直接使用手動邊界。
- 2026-08-10：依使用者最新決定，將不透明圖片的近白背景移除改為預設開啟；仍保留 checkbox 讓使用者在白色內容可能被誤移除時關閉。
- 2026-08-10：使用者要求「完全更新 UI」並再次以同一張手機截圖為視覺驗收基準，並強調要以正式產品水準交付，不當作 demo 呈現。移除 STEP 1/2/3 編號徽章與「STEP N」kicker（原設計偏教學/示範感），改為統一的小型圖示 + 標題列（`.section-icon` + `<h2>`），套用在上傳卡、數量卡、裁切預覽、桌機版開始裁切卡。
- 2026-08-10：上傳卡文案與結構對齊參考圖：拖曳區內主標題改為「上傳貼圖大圖」（原本外層才有這個標題，區內是「選擇 AI 生成圖片」），並在拖曳區內新增「建議比例 4:6」膠囊（`#upload-ratio-pill`，隨 `setStickerCount` 同步更新，與 `#selected-ratio` 邏輯一致）。隱私提示文字對齊參考圖，移除「隱私保護」粗體前綴，只保留一句話。
- 2026-08-10：圖片資訊卡重新設計為縮圖＋檔名＋綠色勾選圓標＋新增的移除（垃圾桶）按鈕同一列，下方一行顯示「尺寸 · 檔案大小」，透明背景／目前網格移到次要小字列。新增 `#remove-image-button` 與 `removeSourceImage()`，重用既有 `resetSourceState()`，讓使用者可以只移除已上傳圖片而不用整頁重置。
- 2026-08-10：修正既有小 bug：上傳完成後「目前網格」欄位過去要等使用者手動切換張數才會更新，現在在 `handleFileUpload` 內直接以目前選定張數的 `getGridConfig` 結果寫入 `#source-grid`。
- 2026-08-10：手機底部固定 CTA 按鈕文字/圖示由靠左改為置中，對齊參考圖的置中版型。
- 2026-08-10：修正 320px 極限寬度下 `<h1>` 標題文字與漢堡選單重疊的既有問題（原本用 `white-space:nowrap` 但沒有 `overflow:hidden`／`text-overflow:ellipsis`，且 `clamp` 下限在極窄寬度仍會溢出）；同時在 `html, body` 加上 `overflow-x: hidden` 作為防線。

## Evidence

- 初始盤點確認工作目錄沒有既有程式檔案、package 設定或 Git repository。
- `node --check app.js` 通過，JSZip 3.10.1 本地檔案為 97,630 bytes。
- ego-browser 實測 24 張：完成 24/24、編號 01–24、24 個唯一結果、輸出 198×198、全部符合規格、透明角落 alpha=0。
- ego-browser 實測 8、16、40 張：完成數量、首尾編號、唯一數量、最大尺寸與規格狀態全部正確。
- ego-browser 實測 390×844：無橫向溢出，主要按鈕 52px、數量按鈕 54px。
- ego-browser 實測四組建議來源尺寸：1024×512、1024×1024、1024×1536、1280×2048，單格均為 256×256。
- 比例錯誤案例會顯示警告並阻止裁切。
- Performance Resource 檢查只有本機 `style.css`、`vendor/jszip.min.js`、`app.js`，沒有外部資源請求。
- 本地 JSZip 產生 40 個 `sticker_01.png`～`sticker_40.png`，`unzip -t` 回報全部 OK。
- ego-browser 實測 AI Prompt：24 張預設顯示 24 句；切換 8 / 16 / 24 / 40 時文字行數與規格同步，40 張未補滿時複製停用。
- ego-browser 補滿 40 句後實測 prompt 包含 1280×2048、5 欄 × 8 行與第 40 句，完整 prompt 不出現在頁面可見文字中。
- ego-browser 真實座標點擊複製按鈕成功顯示 `AI Prompt 已複製`；390px 手機視窗無橫向溢出。
- 實際 fixture `v1_img.png`（1024×1536、4×6、PNG、無 alpha）在 ego-browser 完成 24/24；每張輸出 254×254，證明目前 1px cell margin 與白底不 Trim 規則均有生效，但原圖若有內容跨越 row/column seam，裁切後仍會帶入鄰格碎片。
- 實際 fixture `v2_img.png`（1024×1536、視覺上為 5×6 / 約 30 格、PNG、無 alpha）在選擇 24 張時比例警告保持隱藏並完成 24/24；這是已確認的網格驗證缺口，不是 PNG 或 ZIP 輸出錯誤。
- ego-browser 390×844 UI 實測：無水平溢出；上傳 v1 後裁切預覽出現、縮圖出現、底部 CTA 啟用、數量按鈕約 76px 高。
- ego-browser 實測拖曳網格：位移標籤由 `X +0 px / Y +0 px` 更新至 `X +32 px / Y +24 px`。
- ego-browser 實測白底移除：v1 勾選後完成 24/24，第一張輸出 254×244，左上角 alpha 為 0；關閉時第一張輸出角落 alpha 為 255。
- ego-browser 實測重新開始：圖片資訊、預覽、位移與去背選項清除；選擇網格仍保留為預設 4 × 6。
- 最終邊界修正後重新實測：網格拖曳至 `X +32 px / Y +32 px` 成功；非去背輸出角落 alpha 仍為 255，去背輸出角落 alpha 為 0。
- 最終版本重新跑 8 / 16 / 24 / 40 fixture：全部完成正確數量、首尾編號正確、0 個規格警告、390px 無水平溢出。
- ego-browser 實測逐條格線：拖曳一條垂直線後欄寬變為 `283 / 225 / 254 / 254 px`；拖曳一條水平線後列高變為 `283 / 225 / 254 px`，證明不是整體網格同步移動。
- 逐條格線版本重新跑 8 / 16 / 24 / 40 fixture：全部完成正確數量、首尾編號正確、0 個規格警告、390px 無水平溢出。
- ego-browser 實測預設去背景：v1 上傳後 checkbox 為 checked；完成 24/24，第一張輸出 `231 × 220`，左上角 alpha=`0`。手動關閉後完成 24/24，第一張輸出 `254 × 254`，左上角 alpha=`255`。
- 本次 UI 重做改用 ego-browser（透過 CDP `Emulation.setDeviceMetricsOverride` + `Page.captureScreenshot`）在 320 / 360 / 390 / 414px 與桌機 1200px 實測：390px 畫面與使用者提供的參考截圖逐區塊比對（header、上傳卡、數量卡、摘要列、裁切預覽、底部 CTA）視覺一致；上傳測試圖（1024×1536、4×6）後完成 24/24 裁切，`結果區塊` 正常渲染；`#remove-image-button` 點擊後正確清空摘要卡、停用裁切按鈕；320px 寬度下逐元素掃描確認除既有的 scrollbar 量測誤差（documentElement.scrollWidth 336 vs clientWidth 320，實際內容元素 `getBoundingClientRect().right` 皆未超出視窗，`body.scrollWidth` 為 320）外無真實橫向溢出；修正前 320px 下 `<h1>` 標題與漢堡選單視覺重疊，修正後改為省略號截斷。
- `node --check app.js` 通過。

---

# LINE Sticker Cutter — UI Redesign

## Goal

将现有贴图裁切器重设计为专业、直接、以完成任务为中心的网页工具；去除 Apple 式圆润卡片与材质语汇，同时保留裁切功能、AI 提示词复制与云端资料夹入口。

## Acceptance criteria

- [x] 所有主要界面采用直角边界、细分隔线、紧凑信息密度与明确状态，未保留大圆角、胶囊、玻璃或浮影设计。
- [x] 页面保留上传、贴图数量、建议尺寸、AI Prompt 编辑/复制、格线调整、裁切、下载与重置功能。
- [x] 保留云端资料夹入口，但将其降级为简洁的辅助操作。
- [x] 删除页面内的教学卡与不服务当下裁切任务的长篇解释文案。
- [x] 在手机及桌面视口完成视觉与功能验证。

## Requirements (append-only)

1. 使用者要求对已提供截图中的整个视觉做全方位重新设计。
2. 不采用 Apple 风格；删除圆角及相关柔和、悬浮、材质化表达。
3. 设计目标是干净、好用、专业，避免过多解释性文案。
4. 删除不必要的 AI 生图/教学相关说明，但保留 AI Prompt 的编辑与复制功能。
5. 保留云端资料夹／研习资源入口，但改为简洁的辅助入口。

## Decision log

- 2026-08-10：参考 Apple 官方 HIG，以其对层次与材质的定义确认需避开 Liquid Glass、浮层及圆润控制项；只保留清晰的可用性原则。
- 2026-08-10：采用 `vercel` design-md 作为技术工具型视觉参考：黑白精确、低圆角、紧凑排版、边框定义区域；仅借鉴设计语言，不模仿品牌。
- 2026-08-10：初始误解为移除 AI Prompt 和云端资料夹，用户随后明确要求两者保留，故将其列为不可删除的辅助能力。

## Evidence

- Apple 官方 HIG 已检索：https://developer.apple.com/design/human-interface-guidelines
- `getdesign.md/vercel/design-md` 已查看，用于确定技术工具视觉方向。
- `node --check app.js` 通过；旧的 mobile CTA / 建议比例胶囊引用已移除；全局唯一 `border-radius` 规则为 `0`。
- 390 × 844 浏览器截图确认：手机无横向溢出，直角视觉、固定导出栏、AI Prompt 和云端资料夹入口均在 DOM 中存在。
- 1280 × 900 浏览器截图确认：上传与规格区为紧凑双栏，格线预览全宽，未出现原来的教程卡、资源卡或 Apple 式圆角卡片。
- 通过浏览器在页面内生成 1024 × 1536 的 4 × 6 PNG 并上传：文件摘要与格线预览出现，裁切按钮启用；实际执行后结果区显示 24 个贴图卡、`已完成 24 / 24 張`、无错误、无横向溢出。
- AI Prompt 的 DOM、编辑器、复制按钮和原有复制逻辑均保留。最后一次浏览器点击复制的二次验证因 ego-browser 沙箱 bootstrap 连接失败而未执行；此项为已保留、未二次点击验证。

---

# LINE Sticker Cutter — Warm Workspace Refresh

## Goal

修复裁切完成后「下载全部 PNG」仍处于禁用状态的问题，并把贴图裁切器重设计为干净、可爱、温暖且低卡片密度的工作台。

## Acceptance criteria

- [x] 裁切完成后可点击下载全部，导出一个包含所有 PNG 的 ZIP；按钮状态及文案明确。
- [x] 移除大面积「每一块都是一张卡」的感觉，改以留白、柔和分隔线和阶段式版面组织。
- [x] 保留上传、数量选择、提示词、格线调整、单张预览与下载、全部导出、重置、云端资料夹等能力。
- [x] 新视觉在手机及桌面可用、无横向溢出，并具备键盘可见焦点与 reduced-motion 支持。

## Requirements (append-only)

1. 排查并修复截图中「下载全部 PNG」看似无法使用的问题。
2. 设计应更可爱、温暖，不要维持当前过度平衡的标准工具感。
3. 减少框框与卡片，整体更干净。
4. 加入轻巧小按钮，以及自然的滑动／展开式窗口交互，而非处处用厚重卡片。

## Decision log

- 2026-08-10：从 `notion` design-md 采用温暖极简、柔和表面与强调留白的方向；从 `zapier` 借用亲和但克制的微交互语气。不复制品牌资产或布局。
- 2026-08-10：诊断确认根因：`cropStickers()` 开始时将 `downloadAllButton.disabled` 设为 `true`，但成功或失败完成后没有复原，导致结果区按钮永久禁用。
- 2026-08-10：将「全部 PNG」改为准确描述 ZIP 行为的文案，并保留用户可再次下载的能力。

## Evidence

- `node --check app.js` 通过。
- 在真实 Chromium 页面以浏览器内生成的 1024 × 1536（4 × 6）PNG 进行端到端测试：上传成功、裁切完成 24 / 24 张、生成 24 个结果图、无错误。
- 裁切结束后「下載 ZIP（24 張 PNG）」为启用状态；点击后先显示「正在準備 ZIP…」，3 秒后恢复为启用状态，无错误提示，证明 ZIP 建立及下载触发流程可再次使用。
- Chromium 390 × 844 手机模拟：`body.scrollWidth = window.innerWidth = 390`，没有横向溢出；导出条为 `position: fixed`；AI Prompt 是原生可展开 `<details>` 窗口。
- 视觉截图检查：暖米色背景、桃／薄荷／奶油黄的小面积状态色、圆润轻量按钮、连续分区与展开式 Prompt 均已呈现；上传、规格和 Prompt 区不再被厚重外框逐块包围。

---

# LINE Sticker Cutter — Layout Balance Polish

## Goal

修正暖色工作台首屏的失衡与底部空白，让标题、来源入口和云端资料夹形成更明确、更紧凑的视觉重点。

## Acceptance criteria

- [x] 手机首屏不再出现标题被挤成多行、右侧却明显留白的失衡状态。
- [x] 来源区的 SOURCE 与「上傳貼圖大圖」在一行中有清晰层级，不显零散。
- [x] 云端资料夹和本机隐私说明能消化固定导出栏前的空间，成为有用且好看的辅助停靠区。
- [x] 不改变上传、裁切、提示词、导出等既有行为，并通过视觉与窄屏检查。

## Requirements (append-only)

1. 改善截图中首页标题左拥挤、右侧空白的视觉失衡。
2. 让 SOURCE／上传来源入口更好看，尽可能形成一行并建立重点。
3. 利用云端资料夹附近的空白，做出更有设计感且有用途的内容。

## Decision log

- 2026-08-10：标题与格式说明改为上下层级：标题获得全宽，格式与下一步提示改为紧凑的引导条，避免在手机上竞争同一行宽度。
- 2026-08-10：云端资料夹升级为「作品停靠区」，以完成后的归档动作和本机处理说明填补安全空间，但不制造新的主卡片。

## Evidence

- `node --check app.js` 通过；本次没有修改裁切或导出逻辑。
- Chromium 390 × 844：`body.scrollWidth = window.innerWidth = 390`，无横向溢出；固定导出栏保持 `position: fixed`。
- 首屏标题实测宽 354px、高 78px（两行）；原截图中由右侧格式提示挤出的三行标题已消除。
- 来源标题实测高 29px，`SOURCE · 01` 与「上傳貼圖大圖」维持单行；标题至上传区间距为 37px。
- 云端资料夹停靠区实测高 77px，包含归档引导、云端入口与本机处理隐私状态，用于填补固定导出栏前的安全空间。
+# LINE Sticker Cutter — A + C Mobile Workspace

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
+
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

---

<!-- Archived from .fable/task.md on 2026-08-13 before starting adaptive cleanup work. -->

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

---

# LINE Sticker Cutter — Customer-ready audit (analysis phase)

## Goal

在不先改动现有功能的前提下，审查当前 LINE Sticker Cutter 是否适合直接面向用户交付，并整理视觉、交互、功能、性能、可访问性与交付包的优化优先级。

## Acceptance criteria

- [x] 读取当前项目规则、README、HTML、CSS、JavaScript 与测试案例。
- [x] 在桌面、390px 手机与 320px 极窄视口检查实际布局与横向溢出。
- [x] 使用真实 v1 大图跑通上传、网格预览、裁切与 24 张结果生成。
- [x] 使用真实 v2 大图确认当前“只检查外框比例”的已知限制仍存在。
- [x] 运行 `node --check app.js` 与 `git diff --check`。
- [ ] 根据用户确认实施优化并重新验证。

## Requirements (append-only)

1. 先完整分析当前 app 可优化的视觉、使用流程与功能点。
2. 以面向用户、可以直接交付为目标提出改造建议。
3. 识别并规划需要移除的多余解释、开发文档与非客户交付内容。
4. 本阶段先给建议，不提前改动产品代码。

## Decision log

- 2026-08-12：本阶段范围限定为审查与建议；不删除 `.fable`、`template`、测试或其他文件，不覆盖工作区已有修改。
- 2026-08-12：以实际 DOM、截图、真实 v1/v2 上传结果和静态检查为证据，不把 README 的描述直接当成运行事实。
- 2026-08-12：初步发布门槛为：首屏能让新用户完成下一步、结果页能快速下载、客户包不暴露私有云端入口与内部开发资料。

## Evidence

- 当前项目是纯静态 `index.html`、`style.css`、`app.js`，无构建步骤；工作区另有 `template/`、`tests/` 与 `.fable/` 内部资料。
- 390px 与 320px 视口实测 `scrollWidth === clientWidth`，未发现横向溢出；桌面 1512px 视口也未发现横向溢出。
- v1 实测显示 `1,024 × 1,536 px`、`4 × 6`、24 个结果、`已完成 24 / 24 張`，首张结果 `231 × 220 px` 且显示符合基本规格。
- v1 上传后手机 `scrollY=0`，裁切预览占据首屏，数量／输出配置在其后；当前没有上传完成后自动引导到配置区的行为。
- v2 实测同为 `1,024 × 1,536 px` 时不出现比例警告，印证代码只能校验整张图片宽高比，不能识别内部真实列行。
- 当前 UI 与代码仍包含面向开发者或所有者的 Google Docs “我的云端资料夹”入口；该链接并非应用内部真正的用户云端存储。

# LINE Sticker Cutter — README Refresh and Publish

## Goal

让 README 准确反映当前应用的真实功能、使用流程、限制与部署方式，并将文档及 Google 文件链接修正发布到 GitHub。

## Acceptance criteria

- [x] README 中的功能、网格规格、导出模式、操作流程与当前代码一致。
- [x] README 不再包含过时、重复或与实际 UI 不符的说明。
- [x] Google 文件链接在应用与 README 中一致，旧占位链接完全移除。
- [x] 相关静态检查通过，并仅提交本任务范围内的文件。
- [ ] 变更成功推送到 GitHub，或明确记录身份验证阻塞。

## Requirements (append-only)

1. 将 README 更新为与当前应用一致。
2. 更新后把变更推送到 GitHub。
3. 保留并发布先前指定的 Google 文件链接修正。

## Decision log

- 2026-08-12：以 `index.html`、`app.js` 与现有测试案例为事实来源；README 只记录已实现且可观察的功能。
- 2026-08-12：发布范围限定为 `README.md`、`app.js`、`index.html`；不纳入无关的 `.DS_Store` 与未跟踪 `.gitignore`。
- 2026-08-12：`gh auth status` 显示 `ycl-2004` token 无效；改用现有 SSH key 进行 Git 发布。
- 2026-08-12：按 GitHub 发布流程创建 `agent/readme-cloud-link` 分支并提交 `ed4dae8`；Codex 非交互环境的 SSH agent 没有加载 `id_ed25519`，push 需由用户在本机输入 SSH key passphrase 后完成。

## Evidence

- `README.md` 已以 `app.js`／`index.html` 为事实来源重写；修正最明显的过时说明：批量下载现在是本机生成 ZIP，而非逐张触发下载。
- 一致性检查确认 Google 文件 URL 同时存在于 README、`app.js` 与 `index.html`，旧 `example.com` 占位链接为 0 处。
- `node --check app.js`、`git diff --check` 通过；README 的 4 个本地 Markdown 链接全部存在。
- 默认贴图文字实际为 40 句且没有空值；README 已据此修正旧的「40 张预设不足」说法。
- `git status` 确认提交只包含 `README.md`、`app.js`、`index.html`；`.fable`、`.DS_Store`、`.gitignore` 未纳入提交。
- 用户终端的 `ssh -T git@github.com` 已返回 `Hi ycl-2004!`，说明 SSH key 与 GitHub 账号绑定成功。
- 已创建 commit `ed4dae8 Refresh README and cloud document link`；push 因非交互环境没有 SSH agent identity 而失败，待用户本机执行 `git push -u origin agent/readme-cloud-link`。

---

# LINE Sticker Cutter — Customer-ready flow implementation

## Goal

在新分支 `feat/customer-ready-flow` 上，将客户确认的用户流程与结果呈现优化落地；保留现有裁切算法与 Google Docs 入口。

## Acceptance criteria

- [x] 新分支已建立。
- [x] 上传后流程按「张数与排列 → 确认裁切范围 → 开始裁切」组织。
- [x] ZIP 下载按钮移动到结果标题旁边。
- [x] 底部 CTA 会依未上传、已上传、比例错误、处理中与已完成状态动态更新。
- [x] 网格、图片比例与输出文案已统一并压缩过长说明。
- [x] 移动端小按钮与图标按钮扩大到可触控尺寸。
- [x] 结果卡片增加文件名、像素尺寸与合规状态。
- [x] 现有裁切、去背、Trim、Resize 与 ZIP 算法未重写。
- [x] Google Docs 入口与原 URL 保留在页面底部。
- [x] 完成全部视口与下载回归验证。

## Requirements (append-only)

1. 重新整理上传后的用户路径。
2. 把 ZIP 下载移到结果标题旁边。
3. 动态更新底部 CTA。
4. 统一比例、网格和输出文案。
5. 压缩过多解释文字。
6. 放大移动端小按钮。
7. 结果卡片增加文件名和合规状态。
8. 保留现有裁切算法，不做大规模重构。
9. 保留私人 Google Docs 入口，不删除、不移动。

## Decision log

- 2026-08-12：客户更正此前建议，Google Docs 入口是需要保留的产品入口；本次不删除、不移动、不更换链接。
- 2026-08-12：采用 CSS workflow order 调整上传后的显示顺序，避免改动既有 DOM 事件绑定与裁切算法。
- 2026-08-12：合规状态沿用既有尺寸与文件大小校验，只更新用户可读标签为「可用於 LINE」或「非 LINE 上架檔」。

## Evidence

- `node --check app.js` 与 `git diff --check` 已通过。
- 390px 真实 v1 图片验证：上传后 `張數與排列` 位于 `確認裁切範圍` 之前；CTA 显示「確認網格並裁切 24 張」且可用。
- 390px 真实 v1 图片验证：裁切完成 `24 / 24`，结果标题旁显示「下載 ZIP（24 張 PNG）」；首张显示 `sticker_01.png`、`231 × 220 px`、`✓ 可用於 LINE`。
- 真实 DOM 验证 Google Docs href 仍为原 `docs.google.com/document/...` 链接；390px 横向溢出检查通过。
- 320px、390px、768px、1024px 与 1440px 视口均通过横向溢出检查；移动端重置按钮为 `84 × 44`，图标按钮为 `44 × 44`。
- 最终浏览器回归：真实 v1 图片完成 `24` 张裁切；ZIP 位于 `.results-header-actions`；重置后结果隐藏、CTA 恢复为「先上傳圖片」，Google Docs URL 未改变。

---
