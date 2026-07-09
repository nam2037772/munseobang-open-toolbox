const STORAGE_KEY = "construction-daily-pro-v1";

const defaults = {
  projectName: "한국정보통신공사협회 제주특별자치도 회관 신축공사",
  period: "2026년 5월 15일 ~ 2026년 2월 10일",
  reports: {}
};

const seeds = {
  labor: [
    { company: "일성종합건설㈜", trade: "관리자", today: 0 },
    { company: "직영", trade: "코아천공", today: 0 },
    { company: "안전인원", trade: "안전시설, 신호수", today: 0 }
  ],
  equipment: [
    { name: "백호", spec: "0.3W", today: 0, note: "" },
    { name: "백호", spec: "0.6W", today: 0, note: "" },
    { name: "덤프", spec: "15TON", today: 0, note: "" },
    { name: "크레인", spec: "카고", today: 0, note: "" },
    { name: "펌프카", spec: "각종", today: 0, note: "" }
  ],
  material: [
    { name: "레미콘", spec: "25-21-150", unit: "㎥", today: 0 },
    { name: "레미콘", spec: "25-27-150", unit: "㎥", today: 0 },
    { name: "철근", spec: "HD10", unit: "TON", today: 0 },
    { name: "철근", spec: "HD13", unit: "TON", today: 0 },
    { name: "시멘트", spec: "40KG", unit: "포", today: 0 },
    { name: "모래", spec: "미장사", unit: "㎥", today: 0 },
    { name: "레미탈", spec: "", unit: "포", today: 0 }
  ]
};

let state = loadState();
let activeDate = todayKey();
let previewZoom = 1;
const PREVIEW_ZOOM_MIN = 0.5;
const PREVIEW_ZOOM_MAX = 2;
const PREVIEW_ZOOM_STEP = 0.1;

// styles.css @media print의 @page 여백/글자크기와 반드시 같은 값을 유지해야 한다.
const PRINT_PAGE_WIDTH_MM = 210;
const PRINT_PAGE_HEIGHT_MM = 297;
const PRINT_MARGIN_TOP_MM = 10;
const PRINT_MARGIN_SIDE_MM = 10;
const PRINT_MARGIN_BOTTOM_MM = 10;
const PRINT_FONT_SIZE_PX = 9.5;
const PRINT_FIT_MIN_ZOOM = 0.35;
// 측정치와 실제 인쇄 페이지 나눔 사이의 오차(테두리/반올림 등)로 경계값에서 2페이지로
// 넘어가는 것을 막기 위한 여유분. 가용 높이의 90%만 목표로 잡는다.
const PRINT_FIT_SAFETY = 0.9;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("reportDate").value = activeDate;
  ensureReport(activeDate);
  bindEvents();
  applyPreviewZoom();
  render();
});

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...defaults, ...saved, reports: saved?.reports || {} };
  } catch {
    return structuredClone(defaults);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function blankReport(date) {
  return {
    date,
    weather: "흐림",
    tempHigh: "",
    tempLow: "",
    progressRate: "",
    siteMemo: "",
    todayWork: "",
    tomorrowWork: "",
    labor: structuredClone(seeds.labor),
    equipment: structuredClone(seeds.equipment),
    material: structuredClone(seeds.material)
  };
}

function ensureReport(date) {
  let changed = false;
  if (!state.reports[date]) {
    state.reports[date] = blankReport(date);
    carryNamesFromPrevious(date);
    syncAllReportLists();
    changed = true;
  }
  changed = syncRowsFromPrevious(date) || changed;
  if (changed) persist();
}

function sortedDates() {
  return Object.keys(state.reports).sort();
}

function previousDate(date) {
  return sortedDates().filter((d) => d < date).at(-1);
}

function itemKey(item, type) {
  if (type === "labor") return [item.company, item.trade].join("|");
  if (type === "equipment") return [item.name, item.spec].join("|");
  return [item.name, item.spec, item.unit].join("|");
}


function hasListKey(item, type) {
  const parts = type === "labor"
    ? [item.company, item.trade]
    : type === "equipment"
      ? [item.name, item.spec]
      : [item.name, item.spec, item.unit];
  return parts.some((part) => String(part || "").trim());
}

function syncRowAcrossReports(type, item) {
  if (!hasListKey(item, type)) return false;
  const key = itemKey(item, type);
  let changed = false;
  sortedDates().forEach((date) => {
    const rows = state.reports[date][type];
    if (rows.some((row) => itemKey(row, type) === key)) return;
    rows.push(nextDayRow(item, type));
    changed = true;
  });
  return changed;
}

function compareText(a, b) {
  const left = String(a || "").trim();
  const right = String(b || "").trim();
  if (!left && right) return 1;
  if (left && !right) return -1;
  return left.localeCompare(right, "ko-KR", { numeric: true, sensitivity: "base" });
}

function sortParts(item, type) {
  if (type === "labor") return [item.company, item.trade];
  if (type === "equipment") return [item.name, item.spec];
  return [item.name, item.spec, item.unit];
}

function sortRowsForDisplay(rows, type) {
  return [...rows].sort((a, b) => {
    const left = sortParts(a, type);
    const right = sortParts(b, type);
    for (let i = 0; i < left.length; i += 1) {
      const compared = compareText(left[i], right[i]);
      if (compared) return compared;
    }
    return a.sourceIndex - b.sourceIndex;
  });
}

function syncAllReportLists() {
  let changed = false;
  ["labor", "equipment", "material"].forEach((type) => {
    const masterRows = [];
    const masterKeys = new Set();
    sortedDates().forEach((date) => {
      state.reports[date][type].forEach((item) => {
        if (!hasListKey(item, type)) return;
        const key = itemKey(item, type);
        if (masterKeys.has(key)) return;
        masterRows.push(item);
        masterKeys.add(key);
      });
    });
    sortedDates().forEach((date) => {
      const rows = state.reports[date][type];
      const rowKeys = new Set(rows.map((item) => itemKey(item, type)));
      masterRows.forEach((item) => {
        const key = itemKey(item, type);
        if (rowKeys.has(key)) return;
        rows.push(nextDayRow(item, type));
        rowKeys.add(key);
        changed = true;
      });
    });
  });
  return changed;
}
function carryNamesFromPrevious(date) {
  const prev = previousDate(date);
  if (!prev) return;
  ["labor", "equipment", "material"].forEach((type) => {
    state.reports[date][type] = state.reports[prev][type].map((item) => {
      const next = { ...item, prev: "", today: 0 };
      if (type === "equipment") next.note = "";
      return next;
    });
  });
}


function syncRowsFromPrevious(date) {
  const prev = previousDate(date);
  if (!prev) return false;
  let changed = false;
  ["labor", "equipment", "material"].forEach((type) => {
    const current = state.reports[date][type];
    const currentKeys = new Set(current.map((item) => itemKey(item, type)));
    state.reports[prev][type].forEach((item) => {
      const key = itemKey(item, type);
      if (currentKeys.has(key)) return;
      current.push(nextDayRow(item, type));
      currentKeys.add(key);
      changed = true;
    });
  });
  return changed;
}

function nextDayRow(item, type) {
  if (type === "labor") {
    return { company: item.company || "", trade: item.trade || "", prev: "", today: 0 };
  }
  if (type === "equipment") {
    return { name: item.name || "", spec: item.spec || "", prev: "", today: 0, note: "" };
  }
  return { name: item.name || "", spec: item.spec || "", unit: item.unit || "", prev: "", today: 0 };
}
function priorTotal(date, type, key) {
  const prev = previousDate(date);
  if (!prev) return 0;
  const item = calculatedRows(prev, type).find((row) => row.key === key);
  return item ? item.total : 0;
}

function calculatedRows(date, type) {
  const report = state.reports[date];
  const rows = report[type].map((item, sourceIndex) => {
    const key = itemKey(item, type);
    const prev = item.prev === "" || item.prev === undefined || item.prev === null
      ? priorTotal(date, type, key)
      : number(item.prev);
    const today = number(item.today);
    return { ...item, key, prev, today, total: prev + today, sourceIndex };
  });
  return sortRowsForDisplay(rows, type);
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedRenderSummaryOnly = debounce(renderSummaryOnly, 300);

function bindEvents() {
  ["labor", "equipment", "material"].forEach((type) => {
    $(`${type}Rows`).addEventListener("focusout", handleRowFocusOut);
  });
  $("zoomInBtn").addEventListener("click", () => setPreviewZoom(previewZoom + PREVIEW_ZOOM_STEP));
  $("zoomOutBtn").addEventListener("click", () => setPreviewZoom(previewZoom - PREVIEW_ZOOM_STEP));
  $("zoomResetBtn").addEventListener("click", () => setPreviewZoom(1));
  $("newReportBtn").addEventListener("click", () => openDate($("reportDate").value));
  $("reportDate").addEventListener("change", (event) => openDate(event.target.value));
  $("saveBtn").addEventListener("click", () => {
    readForm();
    persist();
    render();
    toast("저장했습니다.");
  });
  $("previewBtn").addEventListener("click", () => {
    readForm();
    persist();
    renderPreview();
    $("previewPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("printBtn").addEventListener("click", () => {
    readForm();
    persist();
    renderPreview();
    window.print();
  });
  $("exportBtn").addEventListener("click", () => {
    readForm();
    persist();
    renderPreview();
    exportExcel();
  });
  $("shareBtn").addEventListener("click", async () => {
    readForm();
    persist();
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: "공사일보", text });
        return;
      } catch {
        // 사용자가 공유를 취소했거나 지원하지 않으면 복사로 대체한다.
      }
    }
    const copied = await copyText(text);
    toast(copied ? "공유문을 복사했습니다." : "복사에 실패했습니다. 아래 문구를 직접 복사해주세요.");
  });
  $("copyShareBtn").addEventListener("click", async () => {
    const copied = await copyText($("shareText").value);
    toast(copied ? "공유문을 복사했습니다." : "복사에 실패했습니다. 아래 문구를 직접 복사해주세요.");
  });
  $("dateList").addEventListener("click", (event) => {
    const button = event.target.closest(".date-item");
    if (!button) return;
    openDate(button.dataset.date);
  });
  document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });
  document.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addRow(button.dataset.add));
  });
  ["projectName", "period", "weather", "tempHigh", "tempLow", "progressRate", "siteMemo", "todayWork", "tomorrowWork"].forEach((id) => {
    $(id).addEventListener("input", () => {
      readForm();
      debouncedRenderSummaryOnly();
    });
  });
}

function openDate(date) {
  if (!date) return;
  readForm();
  activeDate = date;
  ensureReport(activeDate);
  $("reportDate").value = activeDate;
  render();
}

function setTab(tab) {
  document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("active"));
  $(`${tab}Panel`).classList.add("active");
}

function readForm() {
  if (!state.reports[activeDate]) return;
  const report = state.reports[activeDate];
  state.projectName = $("projectName").value.trim();
  state.period = $("period").value.trim();
  report.weather = $("weather").value;
  report.tempHigh = $("tempHigh").value;
  report.tempLow = $("tempLow").value;
  report.progressRate = $("progressRate").value;
  report.siteMemo = $("siteMemo").value.trim();
  report.todayWork = $("todayWork").value.trim();
  report.tomorrowWork = $("tomorrowWork").value.trim();
}

function render() {
  const report = state.reports[activeDate];
  $("projectName").value = state.projectName;
  $("period").value = state.period;
  $("weather").value = report.weather;
  $("tempHigh").value = report.tempHigh;
  $("tempLow").value = report.tempLow;
  $("progressRate").value = report.progressRate;
  $("siteMemo").value = report.siteMemo;
  $("todayWork").value = report.todayWork;
  $("tomorrowWork").value = report.tomorrowWork;
  $("projectLine").textContent = state.projectName || "공사명 미입력";
  $("activeDateText").textContent = activeDate;
  renderRows("labor");
  renderRows("equipment");
  renderRows("material");
  renderDates();
  renderSummaryOnly();
}

function renderSummaryOnly() {
  $("shareText").value = buildShareText();
  renderPreview();
}

function renderDates() {
  const dates = sortedDates().reverse();
  $("reportCount").textContent = `${dates.length}건`;
  $("dateList").innerHTML = "";
  dates.forEach((date) => {
    const report = state.reports[date];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `date-item${date === activeDate ? " active" : ""}`;
    button.dataset.date = date;
    button.innerHTML = `<strong>${date}</strong><span>${report.weather || ""}</span>`;
    $("dateList").appendChild(button);
  });
}

function renderRows(type) {
  const tbody = $(`${type}Rows`);
  tbody.innerHTML = "";
  calculatedRows(activeDate, type).forEach((row, index) => {
    const dataIndex = row.sourceIndex ?? index;
    const tr = document.createElement("tr");
    if (type === "labor") {
      tr.innerHTML = `
        <td><input value="${escapeAttr(row.company || "")}" data-type="${type}" data-index="${dataIndex}" data-field="company"></td>
        <td><input value="${escapeAttr(row.trade || "")}" data-type="${type}" data-index="${dataIndex}" data-field="trade"></td>
        <td class="num"><input type="number" step="0.01" value="${row.prev}" data-type="${type}" data-index="${dataIndex}" data-field="prev"></td>
        <td class="num"><input type="number" step="0.01" value="${row.today}" data-type="${type}" data-index="${dataIndex}" data-field="today"></td>
        <td class="num"><input class="readonly" value="${row.total}" readonly></td>
        <td class="action-cell"><button class="small danger" data-remove="${type}" data-index="${dataIndex}" type="button">삭제</button></td>`;
    }
    if (type === "equipment") {
      tr.innerHTML = `
        <td><input value="${escapeAttr(row.name || "")}" data-type="${type}" data-index="${dataIndex}" data-field="name"></td>
        <td><input value="${escapeAttr(row.spec || "")}" data-type="${type}" data-index="${dataIndex}" data-field="spec"></td>
        <td class="num"><input type="number" step="0.01" value="${row.prev}" data-type="${type}" data-index="${dataIndex}" data-field="prev"></td>
        <td class="num"><input type="number" step="0.01" value="${row.today}" data-type="${type}" data-index="${dataIndex}" data-field="today"></td>
        <td class="num"><input class="readonly" value="${row.total}" readonly></td>
        <td><input value="${escapeAttr(row.note || "")}" data-type="${type}" data-index="${dataIndex}" data-field="note"></td>
        <td class="action-cell"><button class="small danger" data-remove="${type}" data-index="${dataIndex}" type="button">삭제</button></td>`;
    }
    if (type === "material") {
      tr.innerHTML = `
        <td><input value="${escapeAttr(row.name || "")}" data-type="${type}" data-index="${dataIndex}" data-field="name"></td>
        <td><input value="${escapeAttr(row.spec || "")}" data-type="${type}" data-index="${dataIndex}" data-field="spec"></td>
        <td><input value="${escapeAttr(row.unit || "")}" data-type="${type}" data-index="${dataIndex}" data-field="unit"></td>
        <td class="num"><input type="number" step="0.01" value="${row.prev}" data-type="${type}" data-index="${dataIndex}" data-field="prev"></td>
        <td class="num"><input type="number" step="0.01" value="${row.today}" data-type="${type}" data-index="${dataIndex}" data-field="today"></td>
        <td class="num"><input class="readonly" value="${row.total}" readonly></td>
        <td class="action-cell"><button class="small danger" data-remove="${type}" data-index="${dataIndex}" type="button">삭제</button></td>`;
    }
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll("input[data-type]").forEach((input) => {
    input.addEventListener("change", updateRowField);
  });
  tbody.querySelectorAll("button[data-remove]").forEach((button) => {
    button.addEventListener("click", () => removeRow(button.dataset.remove, Number(button.dataset.index)));
  });
}

function updateRowField(event) {
  const { type, index, field } = event.target.dataset;
  const row = state.reports[activeDate][type][Number(index)];
  row[field] = ["today", "prev"].includes(field)
    ? (event.target.value === "" ? "" : number(event.target.value))
    : event.target.value;
  persist();
  refreshRowTotal(event.target);
  renderSummaryOnly();
}

function handleRowFocusOut(event) {
  const input = event.target.closest("input[data-type]");
  if (!input) return;
  const tr = input.closest("tr");
  if (tr && tr.contains(event.relatedTarget)) return;
  const { type, index } = input.dataset;
  const row = state.reports[activeDate][type][Number(index)];
  if (row && syncRowAcrossReports(type, row)) {
    persist();
    renderDates();
  }
}

function refreshRowTotal(input) {
  const row = input.closest("tr");
  if (!row) return;
  const prevInput = row.querySelector('input[data-field="prev"]');
  const todayInput = row.querySelector('input[data-field="today"]');
  const totalInput = row.querySelector("input.readonly");
  if (!prevInput || !todayInput || !totalInput) return;
  totalInput.value = number(prevInput.value) + number(todayInput.value);
}

function addRow(type) {
  const row = type === "labor"
    ? { company: "", trade: "", prev: "", today: 0 }
    : type === "equipment"
      ? { name: "", spec: "", prev: "", today: 0, note: "" }
      : { name: "", spec: "", unit: "", prev: "", today: 0 };
  state.reports[activeDate][type].push(row);
  persist();
  renderRows(type);
  renderSummaryOnly();
}

function removeRow(type, index) {
  state.reports[activeDate][type].splice(index, 1);
  persist();
  renderRows(type);
  renderSummaryOnly();
}

function buildShareText() {
  const report = state.reports[activeDate];
  const labor = calculatedRows(activeDate, "labor").filter((row) => row.today);
  const equipment = calculatedRows(activeDate, "equipment").filter((row) => row.today);
  const material = calculatedRows(activeDate, "material").filter((row) => row.today);
  const lines = [
    `[공사일보] ${activeDate}`,
    `공사명: ${state.projectName}`,
    `날씨: ${report.weather}${tempRangeText(report) ? ` (최고/최저 ${tempRangeText(report)})` : ""}${report.progressRate ? ` / 주간공정율 ${report.progressRate}%` : ""}`,
    "",
    "[금일 작업내용]",
    report.todayWork || "-",
    "",
    "[투입인원]",
    labor.length ? labor.map((row) => `- ${row.company} / ${row.trade}: 금일 ${row.today}, 누계 ${row.total}`).join("\n") : "-",
    "",
    "[장비]",
    equipment.length ? equipment.map((row) => `- ${row.name} ${row.spec}: 금일 ${row.today}, 누계 ${row.total}`).join("\n") : "-",
    "",
    "[자재]",
    material.length ? material.map((row) => `- ${row.name} ${row.spec}: 금일 ${row.today}${row.unit}, 누계 ${row.total}${row.unit}`).join("\n") : "-",
    "",
    "[명일 작업내용]",
    report.tomorrowWork || "-",
    report.siteMemo ? `\n특이사항: ${report.siteMemo}` : ""
  ];
  return lines.join("\n");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function copyText(text) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // file:// 등 보안 컨텍스트가 아니면 Clipboard API가 거부될 수 있어 아래 방식으로 대체한다.
    }
  }
  const temp = document.createElement("textarea");
  temp.value = text;
  temp.style.position = "fixed";
  temp.style.opacity = "0";
  document.body.appendChild(temp);
  temp.focus();
  temp.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(temp);
  return copied;
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 1800);
}


















function renderPreview() {
  const target = $("previewPaper");
  if (!target || !state.reports[activeDate]) return;
  target.innerHTML = buildReportPreview();
  fitPreviewToOnePage();
}

function fitPreviewToOnePage() {
  const paper = $("previewPaper");
  if (!paper) return;
  const saved = {
    zoom: paper.style.zoom,
    width: paper.style.width,
    height: paper.style.height,
    fontSize: paper.style.fontSize,
    padding: paper.style.padding,
    margin: paper.style.margin
  };

  // 인쇄 스타일(폭/글자크기/여백)과 동일한 조건으로 임시 측정한다.
  paper.style.zoom = "1";
  paper.style.width = `${PRINT_PAGE_WIDTH_MM - PRINT_MARGIN_SIDE_MM * 2}mm`;
  paper.style.height = "auto";
  paper.style.fontSize = `${PRINT_FONT_SIZE_PX}px`;
  paper.style.padding = "0";
  paper.style.margin = "0";

  const contentHeightMm = (paper.scrollHeight * 25.4) / 96;
  const availableHeightMm = (PRINT_PAGE_HEIGHT_MM - PRINT_MARGIN_TOP_MM - PRINT_MARGIN_BOTTOM_MM) * PRINT_FIT_SAFETY;
  const ratio = Math.max(PRINT_FIT_MIN_ZOOM, Math.min(1, availableHeightMm / contentHeightMm));

  paper.style.zoom = saved.zoom;
  paper.style.width = saved.width;
  paper.style.height = saved.height;
  paper.style.fontSize = saved.fontSize;
  paper.style.padding = saved.padding;
  paper.style.margin = saved.margin;

  paper.style.setProperty("--print-fit-zoom", ratio.toFixed(4));
}

function setPreviewZoom(value) {
  previewZoom = Math.min(PREVIEW_ZOOM_MAX, Math.max(PREVIEW_ZOOM_MIN, value));
  applyPreviewZoom();
}

function applyPreviewZoom() {
  $("previewPaper").style.zoom = previewZoom;
  $("zoomLevel").textContent = `${Math.round(previewZoom * 100)}%`;
}

function exportExcel() {
  const html = buildExcelDocument();
  downloadBlob(html, `공사일보_${activeDate}.xls`, "application/vnd.ms-excel;charset=utf-8");
  toast("A4 세로 양식의 엑셀 파일을 저장했습니다.");
}

function buildExcelDocument() {
  return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>공사일보</x:Name><x:WorksheetOptions><x:PageSetup><x:Layout x:Orientation="Portrait"/><x:PaperSizeIndex>9</x:PaperSizeIndex></x:PageSetup><x:FitToPage/><x:Print><x:FitWidth>1</x:FitWidth><x:FitHeight>1</x:FitHeight></x:Print></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
<style>
  @page { size: A4 portrait; margin: 0.35in; mso-page-orientation: portrait; }
  body { margin: 0; font-family: "Malgun Gothic", Arial, sans-serif; color: #111; }
  table.report-output { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 9.5pt; line-height: 1.2; }
  /* Excel은 td의 height를 신뢰하지 않고 tr의 height(pt 단위)만 반영하므로 행 단위로 지정한다 */
  .report-output tr { mso-height-source: userset; height: 15pt; }
  .report-output th, .report-output td { border: 1px solid #222; padding: 3px 4px; vertical-align: middle; mso-number-format:"\\@"; }
  /* 표 맨 위 빈 줄: 인쇄물을 철핀/펀치로 철할 때 구멍 뚫을 여백 */
  .report-output .punch-row { height: 57pt; }
  .report-output .punch-cell { border: 0; }
  .report-output th { background: #e8edf2; text-align: center; font-weight: 700; }
  .report-output .title { height: 24pt; }
  .report-output .title th { background: #fff; font-size: 16pt; }
  .report-output .section { height: 16pt; }
  .report-output .section th { background: #d7e2ea; font-size: 10pt; }
  .report-output .center { text-align: center; }
  .report-output .right { text-align: right; }
  .report-output .memo-row { height: 64pt; }
  .report-output .memo { white-space: pre-line; vertical-align: top; }
  .report-output .sign-row { height: 32pt; }
  .report-output .sign { text-align: center; }
</style>
</head><body>${buildReportPreview("report-output")}</body></html>`;
}

// 아래 문서는 12칸 그리드를 기준으로 한다. 장비/자재 표는 6칸씩 좌우로 나란히 배치하고,
// 다른 행들은 12칸을 적절히 colspan으로 나눠 쓴다.
function tempRangeText(report) {
  if (!report.tempHigh && !report.tempLow) return "";
  return `${report.tempHigh || "-"}℃ / ${report.tempLow || "-"}℃`;
}

function buildReportPreview(tableClass = "") {
  const report = state.reports[activeDate];
  const labor = calculatedRows(activeDate, "labor");
  const equipment = calculatedRows(activeDate, "equipment");
  const material = calculatedRows(activeDate, "material");
  const progress = report.progressRate ? `${escapeHtml(report.progressRate)}%` : "";
  return `
    <table class="${tableClass}">
      <colgroup>
        <col style="width: 9%"><col style="width: 8%"><col style="width: 7%">
        <col style="width: 7%"><col style="width: 7%"><col style="width: 11%">
        <col style="width: 10%"><col style="width: 8%"><col style="width: 7%">
        <col style="width: 7%"><col style="width: 7%"><col style="width: 12%">
      </colgroup>
      <tr class="punch-row"><td colspan="12" class="punch-cell"></td></tr>
      <tr class="report-title title"><th colspan="12">공 사 일 보</th></tr>
      <tr class="report-meta"><th colspan="2">공사명</th><td colspan="6">${escapeHtml(state.projectName)}</td><th colspan="2">일자</th><td colspan="2" class="center">${escapeHtml(activeDate)}</td></tr>
      <tr class="report-meta"><th colspan="2">공사기간</th><td colspan="4">${escapeHtml(state.period)}</td><th colspan="2">날씨</th><td colspan="4" class="center">${escapeHtml(report.weather)}</td></tr>
      <tr class="report-meta"><th colspan="3">최고/최저</th><td colspan="3" class="center">${escapeHtml(tempRangeText(report))}</td><th colspan="3">주간공정율</th><td colspan="3" class="center">${progress}</td></tr>
      ${previewSection("금 일 작 업 공 정", ["업체명", "공종", "전일", "금일", "누계"], [3, 3, 2, 2, 2], labor.map((row) => [row.company, row.trade, row.prev, row.today, row.total]), 12)}
      ${memoRows(report)}
      ${sideBySideSection(
        "장 비 투 입 현 황", ["장비명", "규격", "전일", "금일", "누계", "비고"],
        equipment.map((row) => [row.name, row.spec, row.prev, row.today, row.total, row.note]),
        "자 재 투 입 현 황", ["자재명", "규격", "단위", "전일", "금일", "누계"],
        material.map((row) => [row.name, row.spec, row.unit, row.prev, row.today, row.total])
      )}
      <tr class="report-section section"><th colspan="12">결 재</th></tr>
      <tr class="sign-row"><th colspan="3">담당</th><td colspan="3" class="sign sign-cell"></td><th colspan="3">소장</th><td colspan="3" class="sign sign-cell"></td></tr>
    </table>`;
}

function previewSection(title, headers, colspans, rows, totalCols) {
  const bodyRows = rows.length ? rows : [headers.map(() => "")];
  const header = `<tr>${headers.map((head, index) => `<th colspan="${colspans[index]}">${escapeHtml(head)}</th>`).join("")}</tr>`;
  const body = bodyRows.map((row) => `<tr>${row.map((cell, index) => {
    const isNumber = typeof cell === "number";
    return `<td colspan="${colspans[index]}" class="${isNumber ? "right" : ""}">${formatPreviewCell(cell)}</td>`;
  }).join("")}</tr>`).join("");
  return `<tr class="report-section section"><th colspan="${totalCols}">${escapeHtml(title)}</th></tr>${header}${body}`;
}

// 장비/자재처럼 열 개수가 같은 두 표를 한 행씩 짝지어 좌우로 나란히 그린다.
function sideBySideSection(leftTitle, leftHeaders, leftRows, rightTitle, rightHeaders, rightRows) {
  const blankLeft = leftHeaders.map(() => "");
  const blankRight = rightHeaders.map(() => "");
  const rowCount = Math.max(leftRows.length, rightRows.length, 1);
  const cell = (value) => `<td class="${typeof value === "number" ? "right" : ""}">${formatPreviewCell(value)}</td>`;
  const body = Array.from({ length: rowCount }, (_, index) => {
    const left = leftRows[index] || blankLeft;
    const right = rightRows[index] || blankRight;
    return `<tr>${left.map(cell).join("")}${right.map(cell).join("")}</tr>`;
  }).join("");
  const titleRow = `<tr class="report-section section"><th colspan="${leftHeaders.length}">${escapeHtml(leftTitle)}</th><th colspan="${rightHeaders.length}">${escapeHtml(rightTitle)}</th></tr>`;
  const headerRow = `<tr>${leftHeaders.map((head) => `<th>${escapeHtml(head)}</th>`).join("")}${rightHeaders.map((head) => `<th>${escapeHtml(head)}</th>`).join("")}</tr>`;
  return `${titleRow}${headerRow}${body}`;
}

function memoRows(report) {
  return `
    <tr class="report-section section"><th colspan="12">작 업 내 용</th></tr>
    <tr class="memo-row"><th colspan="3">금일 작업내용</th><td colspan="9" class="memo memo-cell-wide">${formatPreviewCell(report.todayWork)}</td></tr>
    <tr class="memo-row"><th colspan="3">명일 작업내용</th><td colspan="9" class="memo memo-cell-wide">${formatPreviewCell(report.tomorrowWork)}</td></tr>
    <tr class="memo-row"><th colspan="3">특이사항</th><td colspan="9" class="memo memo-cell-wide">${formatPreviewCell(report.siteMemo)}</td></tr>`;
}

function formatPreviewCell(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number") return value.toLocaleString("ko-KR");
  return escapeHtml(value).replaceAll("\n", "<br>");
}





