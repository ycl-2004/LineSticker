(function () {
  "use strict";

  const STICKER_CONFIGS = Object.freeze({
    8: Object.freeze({ columns: 4, rows: 2, imageWidth: 1024, imageHeight: 512, cellSize: 256 }),
    16: Object.freeze({ columns: 4, rows: 4, imageWidth: 1024, imageHeight: 1024, cellSize: 256 }),
    24: Object.freeze({ columns: 4, rows: 6, imageWidth: 1024, imageHeight: 1536, cellSize: 256 }),
    40: Object.freeze({ columns: 5, rows: 8, imageWidth: 1280, imageHeight: 2048, cellSize: 256 })
  });

  const DEFAULT_STICKER_PHRASES = Object.freeze([
    "安安👋",
    "揪咪😉",
    "可以！",
    "OK啦～",
    "水喔！",
    "收！",
    "好欸！",
    "等等我～",
    "快到了！",
    "好想睡🥱",
    "餓爆！",
    "開工！",
    "收工！",
    "撐一下！",
    "太扯了！",
    "有喔～",
    "先醬～",
    "掰掰👋",
    "明天見！",
    "放假去～",
    "出發！",
    "回家！",
    "爽啦！",
    "繼續衝！",
    "辛苦了！",
    "沒問題！",
    "謝謝你♡",
    "收到收到！",
    "抱抱你～",
    "好期待！",
    "我來了！",
    "等等喔～",
    "加油加油！",
    "太棒了！",
    "笑死🤣",
    "早安呀！",
    "晚安囉～",
    "下次見！",
    "讚讚讚！",
    "請多指教！"
  ]);

  const DEFAULT_STICKER_COUNT = 24;
  const MAX_STICKER_WIDTH = 370;
  const MAX_STICKER_HEIGHT = 320;
  const MAX_STICKER_BYTES = 1024 * 1024;
  const CELL_SAFE_MARGIN = 1;
  const TRIM_SAFETY_MARGIN = 10;
  const ALPHA_THRESHOLD = 8;
  const RATIO_TOLERANCE = 0.15;
  const LOW_RESOLUTION_CELL_SIZE = 96;
  const MIN_GRID_CELL_SIZE = 32;
  const GRID_LINE_HIT_DISTANCE = 18;
  const WHITE_BACKGROUND_THRESHOLD = 245;
  const CLOUD_FOLDER_URL = "https://example.com/your-cloud-folder";

  const state = {
    selectedCount: DEFAULT_STICKER_COUNT,
    sourceFile: null,
    sourceImage: null,
    sourceCanvas: null,
    sourceHasTransparency: false,
    sourceObjectUrl: null,
    gridLinesX: null,
    gridLinesY: null,
    activeGridLineLabel: "",
    removeLightBackground: true,
    phraseLines: createPhraseLines(),
    stickers: [],
    zipBlob: null,
    isProcessing: false
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    elements.cloudFolderLink.href = CLOUD_FOLDER_URL;
    bindEvents();
    setStickerCount(DEFAULT_STICKER_COUNT, false);
    renderPhraseEditor();
    updateCropButton();
  }

  function cacheElements() {
    const ids = [
      "cloud-folder-link",
      "upload-zone",
      "image-input",
      "file-status",
      "image-summary",
      "remove-image-button",
      "source-dimensions",
      "source-file-size",
      "source-thumbnail",
      "source-file-name",
      "source-transparency",
      "source-grid",
      "background-note",
      "remove-light-background",
      "selected-count",
      "selected-grid",
      "selected-ratio",
      "recommended-image-size",
      "recommended-cell-size",
      "crop-preview-section",
      "crop-preview-canvas",
      "preview-grid-badge",
      "grid-offset-label",
      "reset-grid-button",
      "prompt-spec",
      "sticker-phrases",
      "prompt-count",
      "copy-prompt-button",
      "prompt-status",
      "generated-prompt",
      "ratio-warning",
      "crop-button",
      "progress-panel",
      "progress-text",
      "progress-count",
      "progress-bar",
      "error-message",
      "results-section",
      "results-count",
      "sticker-grid",
      "download-all-button",
      "reset-button",
      "preview-dialog",
      "preview-title",
      "preview-image",
      "close-preview-button"
    ];

    ids.forEach(function (id) {
      elements[id.replace(/-([a-z])/g, function (_, letter) {
        return letter.toUpperCase();
      })] = document.getElementById(id);
    });

    elements.countInputs = Array.from(document.querySelectorAll('input[name="sticker-count"]'));
  }

  function bindEvents() {
    elements.imageInput.addEventListener("change", function (event) {
      const file = event.target.files && event.target.files[0];
      if (file) {
        handleFileUpload(file);
      }
    });

    elements.countInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        if (input.checked) {
          setStickerCount(Number(input.value));
        }
      });
    });

    ["dragenter", "dragover"].forEach(function (eventName) {
      elements.uploadZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        elements.uploadZone.classList.add("is-dragging");
      });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
      elements.uploadZone.addEventListener(eventName, function (event) {
        event.preventDefault();
        elements.uploadZone.classList.remove("is-dragging");
      });
    });

    elements.uploadZone.addEventListener("drop", function (event) {
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    });

    elements.cropButton.addEventListener("click", function () {
      cropStickers();
    });

    elements.resetGridButton.addEventListener("click", function () {
      resetGridPosition();
    });

    elements.removeImageButton.addEventListener("click", function () {
      removeSourceImage();
    });

    elements.removeLightBackground.addEventListener("change", function () {
      state.removeLightBackground = elements.removeLightBackground.checked;
      updateBackgroundNote();
    });

    elements.cropPreviewCanvas.addEventListener("pointerdown", handleGridPointerDown);
    elements.cropPreviewCanvas.addEventListener("pointermove", handleGridPointerMove);
    elements.cropPreviewCanvas.addEventListener("pointerup", handleGridPointerUp);
    elements.cropPreviewCanvas.addEventListener("pointercancel", handleGridPointerUp);

    elements.downloadAllButton.addEventListener("click", function () {
      downloadAllStickers();
    });

    elements.stickerPhrases.addEventListener("input", syncPhraseLinesFromEditor);
    elements.copyPromptButton.addEventListener("click", copyAIPrompt);

    elements.resetButton.addEventListener("click", resetApp);
    elements.closePreviewButton.addEventListener("click", closePreview);

    elements.previewDialog.addEventListener("click", function (event) {
      if (event.target === elements.previewDialog) {
        closePreview();
      }
    });

    elements.previewDialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closePreview();
    });
  }

  function setStickerCount(count, clearResults) {
    if (!STICKER_CONFIGS[count]) {
      return;
    }

    state.selectedCount = count;
    const config = getGridConfig(count);

    elements.countInputs.forEach(function (input) {
      const isSelected = Number(input.value) === count;
      input.checked = isSelected;
      input.closest(".count-option").classList.toggle("is-selected", isSelected);
    });

    elements.selectedCount.textContent = count + " 張";
    elements.selectedGrid.textContent = config.columns + " × " + config.rows;
    elements.selectedRatio.textContent = "比例 " + config.columns + ":" + config.rows;
    elements.recommendedImageSize.textContent = config.imageWidth + " × " + config.imageHeight + " px";
    elements.recommendedCellSize.textContent = config.cellSize + " × " + config.cellSize + " px";
    elements.sourceGrid.textContent = state.sourceCanvas ? config.columns + " × " + config.rows : "—";
    renderPhraseEditor();
    if (state.sourceCanvas) {
      initializeGridLines();
      updateBackgroundNote();
      renderCropPreview();
    }

    if (clearResults !== false && state.stickers.length > 0) {
      clearStickers();
      elements.resultsSection.hidden = true;
    }

    updateRatioWarning();
    updateCropButton();
  }

  function createPhraseLines() {
    return DEFAULT_STICKER_PHRASES.concat(Array(40 - DEFAULT_STICKER_PHRASES.length).fill(""));
  }

  function renderPhraseEditor() {
    if (!elements.stickerPhrases) {
      return;
    }

    elements.stickerPhrases.value = state.phraseLines.slice(0, state.selectedCount).join("\n");
    updatePromptUI();
  }

  function syncPhraseLinesFromEditor() {
    const lines = elements.stickerPhrases.value.split(/\r?\n/).slice(0, state.selectedCount);
    for (let index = 0; index < state.selectedCount; index += 1) {
      state.phraseLines[index] = (lines[index] || "").trim();
    }
    updatePromptUI();
  }

  function getCurrentPhrases() {
    return state.phraseLines.slice(0, state.selectedCount).map(function (phrase) {
      return phrase.trim();
    });
  }

  function updatePromptUI() {
    if (!elements.promptCount) {
      return;
    }

    const phrases = getCurrentPhrases();
    const completed = phrases.filter(Boolean).length;
    const config = getGridConfig(state.selectedCount);
    const missing = state.selectedCount - completed;

    elements.promptSpec.textContent =
      state.selectedCount + " 張・" + config.columns + " × " + config.rows;
    elements.promptCount.textContent = missing
      ? "已填 " + completed + " / " + state.selectedCount + " 句，還差 " + missing + " 句"
      : "已填 " + completed + " / " + state.selectedCount + " 句";
    elements.copyPromptButton.disabled = missing > 0;

    if (missing > 0) {
      elements.promptStatus.textContent = "請先補完每一格的貼圖文字，再複製 AI Prompt。";
      elements.promptStatus.classList.add("is-error");
      elements.promptStatus.hidden = false;
    } else if (elements.promptStatus.classList.contains("is-error")) {
      elements.promptStatus.hidden = true;
      elements.promptStatus.classList.remove("is-error");
    }
  }

  function buildAIPrompt() {
    const config = getGridConfig(state.selectedCount);
    const phrases = getCurrentPhrases();
    const ratio = formatSimplifiedRatio(config.columns, config.rows);
    const phraseBlock = phrases.map(function (phrase) {
      return "- " + phrase;
    }).join("\n");

    return [
      "請以使用者附上的 Q 版角色參考圖作為唯一角色來源，製作一張完整的 LINE 貼圖大圖。",
      "",
      "【輸出與版面規格】",
      "- 最終只輸出一張完整圖片，不要輸出多張分開的圖片。",
      "- 圖片尺寸：" + config.imageWidth + " × " + config.imageHeight + " px。",
      "- 圖片比例：" + ratio + "。",
      "- 排列方式：" + config.columns + " 欄 × " + config.rows + " 行，共 " + state.selectedCount + " 格。",
      "- 每格尺寸：" + config.cellSize + " × " + config.cellSize + " px。",
      "- 排列順序由左至右、由上至下。",
      "- 每一格只能有一張 LINE 貼圖、一位完整人物與一句對應文字。",
      "- 每個人物與文字都必須完整留在自己的格子內，不可跨越格線、裁切、重疊或跑到相鄰格子。",
      "",
      "【角色一致性】",
      "- 所有格子必須使用完全相同的角色，不可重新設計人物。",
      "- 髮型、臉型、五官、眼鏡、帽子、服裝、配件、身體比例、畫風與配色必須保持一致。",
      "- 每格只改變符合文字情境的表情、姿勢與肢體動作。",
      "- 人物必須全身入鏡，保持大頭、小身體的日系可愛 Chibi Q 版比例。",
      "",
      "【文字與情境】",
      "請依照以下順序，把每一句文字放入對應格子；文字必須清楚、完整、不可改字：",
      phraseBlock,
      "- 可依文字意思加入少量情境元素，例如咖啡、筆電、愛心、星星、文件或電話，但不可喧賓奪主。",
      "",
      "【視覺風格】",
      "- 白色背景。",
      "- 粗黑外框，色彩鮮豔明亮。",
      "- 日系可愛 Chibi Q 版風格，高解析度。",
      "- 字體大、粗體、清楚易讀；人物與文字不可互相遮擋。",
      "- 四周保留足夠安全空白，方便後續自動裁切。",
      "",
      "【嚴格禁止】",
      "- 圖片中絕對不要出現任何數字、序號、編號或格子標記。",
      "- 不要加入 Logo、浮水印、邊框、格線、分隔線、框線或任何與貼圖無關的裝飾。",
      "- 不要新增其他角色，不要改變參考角色，不要讓人物或文字跨格。",
      "",
      "請先確認所有 " + state.selectedCount + " 格都完整存在，再輸出這一張完整的 LINE 貼圖排列大圖。"
    ].join("\n");
  }

  function formatSimplifiedRatio(columns, rows) {
    const divisor = greatestCommonDivisor(columns, rows);
    return (columns / divisor) + ":" + (rows / divisor);
  }

  function greatestCommonDivisor(first, second) {
    let a = first;
    let b = second;
    while (b !== 0) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a;
  }

  async function copyAIPrompt() {
    const phrases = getCurrentPhrases();
    if (phrases.some(function (phrase) { return !phrase; })) {
      updatePromptUI();
      return;
    }

    const prompt = buildAIPrompt();
    elements.generatedPrompt.value = prompt;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(prompt);
      } else {
        copyTextWithFallback(prompt);
      }
      elements.promptStatus.textContent = "✓ AI Prompt 已複製，可以貼給 ChatGPT 或其他生圖 AI。";
      elements.promptStatus.classList.remove("is-error");
      elements.promptStatus.hidden = false;
    } catch (error) {
      console.error(error);
      elements.promptStatus.textContent = "複製失敗，請重新點擊按鈕再試。";
      elements.promptStatus.classList.add("is-error");
      elements.promptStatus.hidden = false;
    }
  }

  function copyTextWithFallback(text) {
    const temporaryTextarea = document.createElement("textarea");
    temporaryTextarea.value = text;
    temporaryTextarea.setAttribute("readonly", "");
    temporaryTextarea.style.position = "fixed";
    temporaryTextarea.style.top = "-9999px";
    temporaryTextarea.style.left = "-9999px";
    temporaryTextarea.style.opacity = "0";
    document.body.append(temporaryTextarea);
    temporaryTextarea.focus();
    temporaryTextarea.select();
    temporaryTextarea.setSelectionRange(0, text.length);
    const copied = document.execCommand("copy");
    temporaryTextarea.remove();
    if (!copied) {
      throw new Error("Clipboard copy was rejected.");
    }
  }

  function getGridConfig(count) {
    return STICKER_CONFIGS[count] || STICKER_CONFIGS[DEFAULT_STICKER_COUNT];
  }

  async function handleFileUpload(file) {
    clearError();
    clearStickers();
    elements.resultsSection.hidden = true;
    elements.imageSummary.hidden = true;
    elements.cropPreviewSection.hidden = true;
    updateProgress(0, 0, "讀取圖片中…");

    if (!isSupportedFile(file)) {
      resetSourceState();
      showError("圖片格式無法處理，請使用 PNG、JPG、JPEG 或 WEBP。", elements.fileStatus);
      updateCropButton();
      return;
    }

    revokeSourceObjectUrl();
    state.sourceFile = file;
    state.sourceObjectUrl = URL.createObjectURL(file);

    try {
      const image = await loadImage(state.sourceObjectUrl);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);

      state.sourceImage = image;
      state.sourceCanvas = canvas;
      state.sourceHasTransparency = detectTransparency(canvas);
      initializeGridLines();
      state.removeLightBackground = !state.sourceHasTransparency;
      elements.removeLightBackground.checked = state.removeLightBackground;
      elements.removeLightBackground.disabled = state.sourceHasTransparency;

      elements.fileStatus.textContent = file.name + " 已準備好，可以開始裁切。";
      elements.sourceThumbnail.src = state.sourceObjectUrl;
      elements.sourceFileName.textContent = file.name;
      elements.sourceDimensions.textContent = formatDimensions(canvas.width, canvas.height);
      elements.sourceFileSize.textContent = formatBytes(file.size);
      elements.sourceTransparency.textContent = state.sourceHasTransparency ? "有 alpha" : "沒有";
      const activeConfig = getGridConfig(state.selectedCount);
      elements.sourceGrid.textContent = activeConfig.columns + " × " + activeConfig.rows;
      updateBackgroundNote();
      elements.imageSummary.hidden = false;
      renderCropPreview();

      updateRatioWarning();
      updateCropButton();
    } catch (error) {
      console.error(error);
      resetSourceState();
      showError("圖片解析失敗，請確認圖片是有效的 PNG、JPG、JPEG 或 WEBP。", elements.fileStatus);
      updateCropButton();
    }
  }

  function isSupportedFile(file) {
    const supportedTypes = ["image/png", "image/jpeg", "image/webp"];
    const extension = file.name.toLowerCase().split(".").pop();
    return supportedTypes.includes(file.type) || ["png", "jpg", "jpeg", "webp"].includes(extension);
  }

  function loadImage(source) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = reject;
      image.src = source;
    });
  }

  function detectTransparency(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 255) {
        return true;
      }
    }

    return false;
  }

  function updateRatioWarning() {
    if (!state.sourceCanvas) {
      elements.ratioWarning.hidden = true;
      return;
    }

    const validation = validateImageRatio(
      state.sourceCanvas.width,
      state.sourceCanvas.height,
      state.selectedCount
    );

    if (validation.isValid) {
      elements.ratioWarning.hidden = true;
      return;
    }

    elements.ratioWarning.textContent =
      "⚠️ 目前選擇 " +
      state.selectedCount +
      " 張（" +
      validation.config.columns +
      " × " +
      validation.config.rows +
      "），但圖片比例似乎不符合 " +
      validation.config.columns +
      ":" +
      validation.config.rows +
      "，請確認是否選錯貼圖數量。";
    elements.ratioWarning.hidden = false;
  }

  function validateImageRatio(width, height, count) {
    const config = getGridConfig(count);
    const expectedRatio = config.columns / config.rows;
    const actualRatio = width / height;
    const relativeDifference = Math.abs(actualRatio - expectedRatio) / expectedRatio;

    return {
      isValid: relativeDifference <= RATIO_TOLERANCE,
      actualRatio: actualRatio,
      expectedRatio: expectedRatio,
      config: config
    };
  }

  function isLowResolution(canvas, count) {
    const config = getGridConfig(count);
    return (
      canvas.width / config.columns < LOW_RESOLUTION_CELL_SIZE ||
      canvas.height / config.rows < LOW_RESOLUTION_CELL_SIZE
    );
  }

  function updateBackgroundNote() {
    if (!state.sourceCanvas) {
      return;
    }

    const notes = [];
    if (state.sourceHasTransparency) {
      notes.push("已偵測透明背景，裁切後會保留透明區域並執行 Auto Trim。");
    } else if (state.removeLightBackground) {
      notes.push("已預設開啟近白背景移除，只會移除從圖片邊緣連通的近白區域；如需保留白底可手動關閉。");
    } else {
      notes.push("近白背景移除目前已關閉，此圖片的白色背景會保留。");
    }
    if (isLowResolution(state.sourceCanvas, state.selectedCount)) {
      notes.push("⚠️ 圖片解析度可能不足，建議使用 AI 生成的高解析度圖片。");
    }
    elements.backgroundNote.textContent = notes.join(" ");
  }

  function updateCropButton() {
    elements.cropButton.disabled = !state.sourceCanvas || state.isProcessing;
  }

  function initializeGridLines() {
    state.activeGridLineLabel = "";
    if (!state.sourceCanvas) {
      state.gridLinesX = null;
      state.gridLinesY = null;
      return;
    }

    const config = getGridConfig(state.selectedCount);
    state.gridLinesX = Array.from({ length: config.columns + 1 }, function (_, index) {
      return (state.sourceCanvas.width / config.columns) * index;
    });
    state.gridLinesY = Array.from({ length: config.rows + 1 }, function (_, index) {
      return (state.sourceCanvas.height / config.rows) * index;
    });
  }

  function renderCropPreview() {
    if (!state.sourceCanvas) {
      elements.cropPreviewSection.hidden = true;
      elements.gridOffsetLabel.textContent = "可逐條拖曳格線調整邊界";
      return;
    }

    const config = getGridConfig(state.selectedCount);
    if (!state.gridLinesX || !state.gridLinesY) {
      initializeGridLines();
    }
    const linesX = state.gridLinesX;
    const linesY = state.gridLinesY;
    const canvas = elements.cropPreviewCanvas;
    const context = canvas.getContext("2d");
    canvas.width = state.sourceCanvas.width;
    canvas.height = state.sourceCanvas.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(state.sourceCanvas, 0, 0);

    context.save();
    context.strokeStyle = "rgba(25, 93, 94, 0.9)";
    context.lineWidth = Math.max(2, Math.round(Math.min(canvas.width, canvas.height) / 320));
    context.setLineDash([10, 10]);
    for (let column = 0; column <= config.columns; column += 1) {
      const x = Math.round(linesX[column]);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvas.height);
      context.stroke();
    }
    for (let row = 0; row <= config.rows; row += 1) {
      const y = Math.round(linesY[row]);
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(canvas.width, y);
      context.stroke();
    }
    context.restore();

    context.save();
    context.fillStyle = "rgba(232, 111, 81, 0.96)";
    for (let column = 1; column < config.columns; column += 1) {
      drawGridHandle(context, linesX[column], 12);
    }
    for (let row = 1; row < config.rows; row += 1) {
      drawGridHandle(context, 12, linesY[row]);
    }
    context.restore();

    elements.previewGridBadge.textContent = config.columns + " × " + config.rows;
    elements.gridOffsetLabel.textContent = state.activeGridLineLabel ||
      "可逐條拖曳格線調整邊界・最小格寬／高 " + MIN_GRID_CELL_SIZE + " px";
    elements.cropPreviewSection.hidden = false;
  }

  function drawGridHandle(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  function resetGridPosition() {
    initializeGridLines();
    state.activeGridLineLabel = "已重設為標準等分網格";
    renderCropPreview();
    window.setTimeout(function () {
      if (state.activeGridLineLabel === "已重設為標準等分網格") {
        state.activeGridLineLabel = "";
        renderCropPreview();
      }
    }, 1600);
  }

  function handleGridPointerDown(event) {
    if (!state.sourceCanvas || state.isProcessing) {
      return;
    }

    const point = getGridPointerPosition(event);
    const target = findClosestGridLine(point);
    if (!target) {
      state.activeGridLineLabel = "請拖曳深青色格線調整邊界";
      renderCropPreview();
      return;
    }

    elements.cropPreviewCanvas.setPointerCapture(event.pointerId);
    elements.cropPreviewCanvas.dataset.dragging = "true";
    elements.cropPreviewCanvas._gridDrag = {
      pointerId: event.pointerId,
      mode: target.axis,
      index: target.index,
      candidates: target.candidates,
      startX: point.x,
      startY: point.y,
      linesX: state.gridLinesX.slice(),
      linesY: state.gridLinesY.slice()
    };

    state.activeGridLineLabel = target.axis !== "auto"
      ? getGridLineLabel(target)
      : "請沿要調整的方向拖曳格線";
    renderCropPreview();
  }

  function handleGridPointerMove(event) {
    const drag = elements.cropPreviewCanvas._gridDrag;
    if (!drag || drag.pointerId !== event.pointerId || !state.sourceCanvas) {
      return;
    }

    const point = getGridPointerPosition(event);
    const deltaX = point.x - drag.startX;
    const deltaY = point.y - drag.startY;

    if (drag.mode === "auto") {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 2) {
        return;
      }
      drag.mode = Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
      drag.index = drag.candidates[drag.mode].index;
      state.activeGridLineLabel = getGridLineLabel({ axis: drag.mode, index: drag.index });
    }

    if (drag.mode === "x") {
      state.gridLinesX = drag.linesX.slice();
      state.gridLinesX[drag.index] = clampGridLine(
        drag.linesX[drag.index] + deltaX,
        drag.index === 0 ? 0 : drag.linesX[drag.index - 1] + MIN_GRID_CELL_SIZE,
        drag.index === drag.linesX.length - 1
          ? state.sourceCanvas.width
          : drag.linesX[drag.index + 1] - MIN_GRID_CELL_SIZE
      );
    } else if (drag.mode === "y") {
      state.gridLinesY = drag.linesY.slice();
      state.gridLinesY[drag.index] = clampGridLine(
        drag.linesY[drag.index] + deltaY,
        drag.index === 0 ? 0 : drag.linesY[drag.index - 1] + MIN_GRID_CELL_SIZE,
        drag.index === drag.linesY.length - 1
          ? state.sourceCanvas.height
          : drag.linesY[drag.index + 1] - MIN_GRID_CELL_SIZE
      );
    }
    renderCropPreview();
  }

  function handleGridPointerUp(event) {
    const drag = elements.cropPreviewCanvas._gridDrag;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    elements.cropPreviewCanvas.releasePointerCapture(event.pointerId);
    elements.cropPreviewCanvas.removeAttribute("data-dragging");
    elements.cropPreviewCanvas._gridDrag = null;
    state.activeGridLineLabel = "";
    renderCropPreview();
  }

  function getGridPointerPosition(event) {
    const rect = elements.cropPreviewCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (state.sourceCanvas.width / rect.width),
      y: (event.clientY - rect.top) * (state.sourceCanvas.height / rect.height)
    };
  }

  function findClosestGridLine(point) {
    const rect = elements.cropPreviewCanvas.getBoundingClientRect();
    const thresholdX = GRID_LINE_HIT_DISTANCE * (state.sourceCanvas.width / rect.width);
    const thresholdY = GRID_LINE_HIT_DISTANCE * (state.sourceCanvas.height / rect.height);
    let closestX = null;
    let closestY = null;

    state.gridLinesX.forEach(function (line, index) {
      const distance = Math.abs(point.x - line);
      if (distance <= thresholdX && (!closestX || distance < closestX.distance)) {
        closestX = { axis: "x", index: index, distance: distance };
      }
    });
    state.gridLinesY.forEach(function (line, index) {
      const distance = Math.abs(point.y - line);
      if (distance <= thresholdY && (!closestY || distance < closestY.distance)) {
        closestY = { axis: "y", index: index, distance: distance };
      }
    });

    if (closestX && closestY) {
      const tieDistance = Math.min(thresholdX, thresholdY) * 0.35;
      if (Math.abs(closestX.distance - closestY.distance) <= tieDistance) {
        return {
          axis: "auto",
          candidates: { x: closestX, y: closestY }
        };
      }
    }
    if (!closestX) {
      return closestY;
    }
    if (!closestY) {
      return closestX;
    }
    return closestX.distance <= closestY.distance ? closestX : closestY;
  }

  function getGridLineLabel(target) {
    return "正在調整第 " + (target.index + 1) + " 條" + (target.axis === "x" ? "垂直" : "水平") + "格線";
  }

  function clampGridLine(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }


  async function cropStickers() {
    if (!state.sourceCanvas || state.isProcessing) {
      return;
    }

    const ratioValidation = validateImageRatio(
      state.sourceCanvas.width,
      state.sourceCanvas.height,
      state.selectedCount
    );

    if (!ratioValidation.isValid) {
      showError("裁切已暫停，請先確認圖片比例與貼圖數量是否相符。", elements.errorMessage);
      elements.ratioWarning.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    state.isProcessing = true;
    clearError();
    clearStickers();
    elements.resultsSection.hidden = true;
    elements.progressPanel.hidden = false;
    elements.cropButton.disabled = true;
    updateDownloadAllButton();

    const config = getGridConfig(state.selectedCount);
    const total = config.columns * config.rows;
    const lowResolution = isLowResolution(state.sourceCanvas, state.selectedCount);

    updateProgress(0, total, lowResolution ? "圖片解析度可能不足，正在處理…" : "準備裁切…");

    try {
      for (let index = 0; index < total; index += 1) {
        const row = Math.floor(index / config.columns);
        const column = index % config.columns;
        const cropCanvas = cropCell(state.sourceCanvas, column, row, config);
        const backgroundProcessedCanvas = state.removeLightBackground && !state.sourceHasTransparency
          ? removeNearWhiteBackground(cropCanvas)
          : cropCanvas;
        const trimmedCanvas = state.sourceHasTransparency || state.removeLightBackground
          ? trimTransparentArea(backgroundProcessedCanvas, TRIM_SAFETY_MARGIN)
          : backgroundProcessedCanvas;
        const resizedCanvas = resizeSticker(trimmedCanvas);
        const blob = await canvasToBlob(resizedCanvas, "image/png");

        const validation = validateSticker(blob, resizedCanvas.width, resizedCanvas.height);
        state.stickers.push({
          index: index,
          filename: "sticker_" + String(index + 1).padStart(2, "0") + ".png",
          blob: blob,
          url: URL.createObjectURL(blob),
          width: resizedCanvas.width,
          height: resizedCanvas.height,
          size: blob.size,
          valid: validation.valid,
          validation: validation
        });

        updateProgress(index + 1, total, "正在裁切貼圖…");
        await nextFrame();
      }

      renderResults();
      elements.progressPanel.hidden = true;
      elements.resultsSection.hidden = false;
      elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      console.error(error);
      clearStickers();
      elements.progressPanel.hidden = true;
      showError("裁切失敗，請確認圖片是規則排列的貼圖網格。", elements.errorMessage);
    } finally {
      state.isProcessing = false;
      updateCropButton();
      updateDownloadAllButton();
    }
  }

  function cropCell(sourceCanvas, column, row, config) {
    const left = Math.round(state.gridLinesX[column] + CELL_SAFE_MARGIN);
    const top = Math.round(state.gridLinesY[row] + CELL_SAFE_MARGIN);
    const right = Math.round(state.gridLinesX[column + 1] - CELL_SAFE_MARGIN);
    const bottom = Math.round(state.gridLinesY[row + 1] - CELL_SAFE_MARGIN);
    const width = Math.max(1, right - left);
    const height = Math.max(1, bottom - top);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.clearRect(0, 0, width, height);
    if (!state.sourceHasTransparency && !state.removeLightBackground) {
      context.fillStyle = getOpaqueEdgeFillColor(sourceCanvas);
      context.fillRect(0, 0, width, height);
    }
    context.drawImage(sourceCanvas, left, top, width, height, 0, 0, width, height);
    return canvas;
  }

  function getOpaqueEdgeFillColor(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const points = [
      [0, 0],
      [canvas.width - 1, 0],
      [0, canvas.height - 1],
      [canvas.width - 1, canvas.height - 1]
    ];
    const totals = points.reduce(function (result, point) {
      const pixel = context.getImageData(point[0], point[1], 1, 1).data;
      result[0] += pixel[0];
      result[1] += pixel[1];
      result[2] += pixel[2];
      return result;
    }, [0, 0, 0]);
    return "rgb(" + totals.map(function (value) {
      return Math.round(value / points.length);
    }).join(", ") + ")";
  }

  function removeNearWhiteBackground(canvas) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const visited = new Uint8Array(canvas.width * canvas.height);
    const queue = [];

    function enqueueIfBackground(x, y) {
      if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
        return;
      }
      const position = y * canvas.width + x;
      if (visited[position]) {
        return;
      }
      const pixelIndex = position * 4;
      if (pixels[pixelIndex + 3] <= ALPHA_THRESHOLD || !isNearWhitePixel(pixels, pixelIndex)) {
        return;
      }
      visited[position] = 1;
      queue.push(position);
    }

    for (let x = 0; x < canvas.width; x += 1) {
      enqueueIfBackground(x, 0);
      enqueueIfBackground(x, canvas.height - 1);
    }
    for (let y = 1; y < canvas.height - 1; y += 1) {
      enqueueIfBackground(0, y);
      enqueueIfBackground(canvas.width - 1, y);
    }

    let queueIndex = 0;
    while (queueIndex < queue.length) {
      const position = queue[queueIndex];
      queueIndex += 1;
      const pixelIndex = position * 4;
      pixels[pixelIndex + 3] = 0;
      const x = position % canvas.width;
      const y = Math.floor(position / canvas.width);
      enqueueIfBackground(x - 1, y);
      enqueueIfBackground(x + 1, y);
      enqueueIfBackground(x, y - 1);
      enqueueIfBackground(x, y + 1);
    }

    context.putImageData(imageData, 0, 0);
    return canvas;
  }

  function isNearWhitePixel(pixels, pixelIndex) {
    return (
      pixels[pixelIndex] >= WHITE_BACKGROUND_THRESHOLD &&
      pixels[pixelIndex + 1] >= WHITE_BACKGROUND_THRESHOLD &&
      pixels[pixelIndex + 2] >= WHITE_BACKGROUND_THRESHOLD
    );
  }

  function trimTransparentArea(canvas, safetyMargin) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < canvas.height; y += 1) {
      for (let x = 0; x < canvas.width; x += 1) {
        const alpha = pixels[(y * canvas.width + x) * 4 + 3];
        if (alpha > ALPHA_THRESHOLD) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX < 0 || maxY < 0) {
      return canvas;
    }

    const left = Math.max(0, minX - safetyMargin);
    const top = Math.max(0, minY - safetyMargin);
    const right = Math.min(canvas.width, maxX + safetyMargin + 1);
    const bottom = Math.min(canvas.height, maxY + safetyMargin + 1);
    const trimmedCanvas = document.createElement("canvas");
    trimmedCanvas.width = Math.max(1, right - left);
    trimmedCanvas.height = Math.max(1, bottom - top);
    const trimmedContext = trimmedCanvas.getContext("2d", { willReadFrequently: true });
    trimmedContext.clearRect(0, 0, trimmedCanvas.width, trimmedCanvas.height);
    trimmedContext.drawImage(
      canvas,
      left,
      top,
      trimmedCanvas.width,
      trimmedCanvas.height,
      0,
      0,
      trimmedCanvas.width,
      trimmedCanvas.height
    );
    return trimmedCanvas;
  }

  function resizeSticker(canvas) {
    const scale = Math.min(
      1,
      MAX_STICKER_WIDTH / canvas.width,
      MAX_STICKER_HEIGHT / canvas.height
    );
    const width = Math.max(1, Math.round(canvas.width * scale));
    const height = Math.max(1, Math.round(canvas.height * scale));

    if (width === canvas.width && height === canvas.height) {
      return canvas;
    }

    const resizedCanvas = document.createElement("canvas");
    resizedCanvas.width = width;
    resizedCanvas.height = height;
    const context = resizedCanvas.getContext("2d", { willReadFrequently: true });
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, width, height);
    context.drawImage(canvas, 0, 0, width, height);
    return resizedCanvas;
  }

  function validateSticker(blob, width, height) {
    if (!blob || blob.type !== "image/png") {
      return { valid: false, message: "⚠ 格式異常" };
    }
    if (width > MAX_STICKER_WIDTH || height > MAX_STICKER_HEIGHT) {
      return { valid: false, message: "⚠ 尺寸超限" };
    }
    if (blob.size > MAX_STICKER_BYTES) {
      return { valid: false, message: "⚠️ 檔案過大" };
    }
    return { valid: true, message: "✓ 符合基本規格" };
  }

  function renderResults() {
    elements.stickerGrid.replaceChildren();
    elements.resultsCount.textContent =
      "已完成 " + state.stickers.length + " / " + state.selectedCount + " 張";

    state.stickers.forEach(function (sticker, index) {
      const card = document.createElement("article");
      card.className = "sticker-card";
      card.setAttribute("role", "listitem");

      const imageWrap = document.createElement("div");
      imageWrap.className = "sticker-image-wrap checkerboard";

      const image = document.createElement("img");
      image.className = "sticker-image";
      image.src = sticker.url;
      image.alt = "貼圖 " + String(index + 1).padStart(2, "0") + " 預覽";
      image.loading = "lazy";

      const number = document.createElement("span");
      number.className = "sticker-number";
      number.textContent = String(index + 1).padStart(2, "0");

      imageWrap.append(image, number);

      const meta = document.createElement("div");
      meta.className = "sticker-meta";

      const dimensions = document.createElement("span");
      dimensions.textContent = sticker.width + " × " + sticker.height + " px";

      const check = document.createElement("span");
      check.className = "sticker-check";
      if (!sticker.valid) {
        check.classList.add("is-warning");
      }
      check.textContent = sticker.validation.message;

      meta.append(dimensions, check);

      const actions = document.createElement("div");
      actions.className = "sticker-actions";

      const previewButton = document.createElement("button");
      previewButton.className = "small-button";
      previewButton.type = "button";
      previewButton.textContent = "預覽";
      previewButton.addEventListener("click", function () {
        openPreview(index);
      });

      const downloadButton = document.createElement("button");
      downloadButton.className = "small-button";
      downloadButton.type = "button";
      downloadButton.textContent = "下載 PNG";
      downloadButton.addEventListener("click", function () {
        downloadSticker(index);
      });

      actions.append(previewButton, downloadButton);
      card.append(imageWrap, meta, actions);
      elements.stickerGrid.append(card);
    });

    updateDownloadAllButton();
  }

  function updateDownloadAllButton() {
    if (!elements.downloadAllButton) {
      return;
    }

    const readyCount = state.stickers.length;
    elements.downloadAllButton.disabled = readyCount === 0 || state.isProcessing;
    elements.downloadAllButton.textContent = readyCount
      ? "下載 ZIP（" + readyCount + " 張 PNG）"
      : "下載 ZIP（所有 PNG）";
  }

  function openPreview(index) {
    const sticker = state.stickers[index];
    if (!sticker) {
      return;
    }

    elements.previewTitle.textContent = "貼圖 " + String(index + 1).padStart(2, "0") + " 預覽";
    elements.previewImage.src = sticker.url;
    elements.previewImage.alt = "貼圖 " + String(index + 1).padStart(2, "0") + " 預覽";

    if (typeof elements.previewDialog.showModal === "function") {
      elements.previewDialog.showModal();
    } else {
      elements.previewDialog.setAttribute("open", "");
    }
  }

  function closePreview() {
    elements.previewImage.removeAttribute("src");
    if (typeof elements.previewDialog.close === "function") {
      elements.previewDialog.close();
    } else {
      elements.previewDialog.removeAttribute("open");
    }
  }

  function downloadSticker(index) {
    const sticker = state.stickers[index];
    if (!sticker) {
      return;
    }

    triggerDownload(sticker.blob, sticker.filename);
  }

  async function downloadAllStickers() {
    if (!state.stickers.length || state.isProcessing) {
      return;
    }

    if (!window.JSZip) {
      showError("ZIP 元件尚未載入，請重新整理頁面後再試。", elements.errorMessage);
      return;
    }

    elements.downloadAllButton.disabled = true;
    elements.downloadAllButton.textContent = "正在準備 ZIP…";

    try {
      const zip = new window.JSZip();
      state.stickers.forEach(function (sticker) {
        zip.file(sticker.filename, sticker.blob);
      });
      state.zipBlob = await zip.generateAsync({ type: "blob", compression: "STORE" });
      triggerDownload(state.zipBlob, "LINE_Stickers_" + String(state.selectedCount).padStart(2, "0") + ".zip");
    } catch (error) {
      console.error(error);
      showError("ZIP 建立失敗，請稍後再試。", elements.errorMessage);
    } finally {
      updateDownloadAllButton();
    }
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function resetApp() {
    closePreview();
    clearStickers();
    resetSourceState();
    state.zipBlob = null;
    state.isProcessing = false;
    state.phraseLines = createPhraseLines();
    elements.imageInput.value = "";
    elements.sourceThumbnail.removeAttribute("src");
    elements.sourceFileName.textContent = "—";
    elements.removeLightBackground.checked = true;
    elements.removeLightBackground.disabled = false;
    elements.fileStatus.textContent = "尚未選擇圖片";
    elements.imageSummary.hidden = true;
    elements.resultsSection.hidden = true;
    elements.cropPreviewSection.hidden = true;
    elements.progressPanel.hidden = true;
    elements.ratioWarning.hidden = true;
    clearError();
    updateProgress(0, 0, "準備中…");
    setStickerCount(DEFAULT_STICKER_COUNT, false);
    renderPhraseEditor();
    updateCropButton();
    updateDownloadAllButton();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetSourceState() {
    revokeSourceObjectUrl();
    state.sourceFile = null;
    state.sourceImage = null;
    state.sourceCanvas = null;
    state.sourceHasTransparency = false;
    state.gridLinesX = null;
    state.gridLinesY = null;
    state.activeGridLineLabel = "";
    state.removeLightBackground = true;
    elements.cropPreviewSection.hidden = true;
    elements.sourceDimensions.textContent = "—";
    elements.sourceFileSize.textContent = "—";
    elements.sourceTransparency.textContent = "—";
    elements.sourceGrid.textContent = "—";
    elements.backgroundNote.textContent = "";
    elements.gridOffsetLabel.textContent = "可逐條拖曳格線調整邊界";
    elements.removeLightBackground.checked = true;
    elements.removeLightBackground.disabled = false;
  }

  function removeSourceImage() {
    clearStickers();
    resetSourceState();
    elements.imageInput.value = "";
    elements.sourceThumbnail.removeAttribute("src");
    elements.sourceFileName.textContent = "—";
    elements.fileStatus.textContent = "尚未選擇圖片";
    elements.imageSummary.hidden = true;
    elements.resultsSection.hidden = true;
    elements.ratioWarning.hidden = true;
    clearError();
    updateCropButton();
    updateDownloadAllButton();
  }

  function clearStickers() {
    state.stickers.forEach(function (sticker) {
      URL.revokeObjectURL(sticker.url);
    });
    state.stickers = [];
    state.zipBlob = null;
    elements.stickerGrid.replaceChildren();
  }

  function revokeSourceObjectUrl() {
    if (state.sourceObjectUrl) {
      URL.revokeObjectURL(state.sourceObjectUrl);
      state.sourceObjectUrl = null;
    }
  }

  function updateProgress(completed, total, text) {
    elements.progressText.textContent = text;
    elements.progressCount.textContent = completed + " / " + total;
    elements.progressBar.style.width = total ? (completed / total) * 100 + "%" : "0%";
  }

  function showError(message, target) {
    const element = target || elements.errorMessage;
    element.textContent = message;
    element.hidden = false;
  }

  function clearError() {
    elements.errorMessage.textContent = "";
    elements.errorMessage.hidden = true;
  }

  function formatDimensions(width, height) {
    return width.toLocaleString("en-US") + " × " + height.toLocaleString("en-US") + " px";
  }

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function canvasToBlob(canvas, type) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas could not be converted to a Blob."));
        }
      }, type);
    });
  }

  function nextFrame() {
    return new Promise(function (resolve) {
      window.requestAnimationFrame(resolve);
    });
  }

  window.StickerMaker = Object.freeze({
    STICKER_CONFIGS: STICKER_CONFIGS,
    DEFAULT_STICKER_COUNT: DEFAULT_STICKER_COUNT,
    validateImageRatio: validateImageRatio,
    validateSticker: validateSticker,
    resizeSticker: resizeSticker,
    trimTransparentArea: trimTransparentArea,
    formatBytes: formatBytes
  });
})();
