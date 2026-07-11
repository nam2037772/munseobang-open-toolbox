/**
 * 검측프로 - 앱 로직
 * 서버 전송 없음. 모든 데이터는 localStorage(임시자동저장) 또는
 * 사용자가 내려받는 JSON 파일에만 존재한다.
 */

const STORAGE_KEY = "munseobang:gumcheuk:autosave_v1";
const OLD_STORAGE_KEY = "gumcheukpro_autosave_v1";
if (localStorage.getItem(OLD_STORAGE_KEY) && !localStorage.getItem(STORAGE_KEY)) {
  try {
    localStorage.setItem(STORAGE_KEY, localStorage.getItem(OLD_STORAGE_KEY));
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch (e) {
    console.error("Migration failed", e);
  }
}

/* ===================== 상태(state) ===================== */

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function nowLocalDateTimeStr() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}
function uid() {
  return "id" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function createDefaultState() {
  return {
    projectInfo: {
      projectName: "",
      siteName: "",
      contractor: "",
      supervisor: "",
      siteManager: "",
      inspectionNo: "",
      inspectionDate: todayStr(),
    },
    requestInfo: {
      categoryId: WORK_CATEGORIES[0].id,
      subWorkCode: "",
      location: "",
      drawingNo: "",
      requestDateTime: nowLocalDateTimeStr(),
      requestor: "",
      requestNote: "",
    },
    checklist: [],
    signatures: {
      contractorCheck: null,
      supervisorCheck: null,
      contractorRecheck: null,
      supervisorRecheck: null,
      supervisorSign: null,
      chiefSign: null,
    },
    photos: [],
    participants: [],
    resultNotice: {
      result: "",
      noticeDate: todayStr(),
      instructions: "",
    },
    ui: { activeStep: 1, activeDoc: "request" },
  };
}

let state = loadFromStorage() || createDefaultState();

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return mergeWithDefaults(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

function mergeWithDefaults(loaded) {
  const base = createDefaultState();
  return {
    ...base,
    ...loaded,
    projectInfo: { ...base.projectInfo, ...(loaded.projectInfo || {}) },
    requestInfo: { ...base.requestInfo, ...(loaded.requestInfo || {}) },
    signatures: { ...base.signatures, ...(loaded.signatures || {}) },
    resultNotice: { ...base.resultNotice, ...(loaded.resultNotice || {}) },
    checklist: Array.isArray(loaded.checklist) ? loaded.checklist : [],
    photos: Array.isArray(loaded.photos) ? loaded.photos : [],
    participants: Array.isArray(loaded.participants) ? loaded.participants : [],
    ui: { ...base.ui, ...(loaded.ui || {}) },
  };
}

let autosaveTimer = null;
function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const el = document.getElementById("autosaveLine");
      const t = new Date().toLocaleTimeString("ko-KR");
      el.textContent = "자동 임시저장: " + t;
      el.style.color = "";
    } catch (e) {
      const el = document.getElementById("autosaveLine");
      el.textContent = "자동 임시저장 실패(저장 용량 초과 가능) - JSON 저장을 이용하세요";
      el.style.color = "#b91c1c";
    }
  }, 400);
}

let renderTimer = null;
function scheduleRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderActivePreview, 120);
}

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function nl2br(s) {
  return esc(s).replace(/\n/g, "<br/>");
}

/* ===================== 초기화 ===================== */

document.addEventListener("DOMContentLoaded", init);

function init() {
  populateCategorySelect();
  populateSubWorkSelect(state.requestInfo.categoryId);
  bindTopbar();
  bindStepNav();
  bindProjectForm();
  bindRequestForm();
  bindChecklist();
  bindSignatureModal();
  bindPhotoArea();
  bindResultForm();
  bindParticipants();
  bindPreviewTabs();
  bindPrintButtons();

  fillFormsFromState();
  renderChecklistRows();
  renderPhotoList();
  renderParticipantRows();
  renderSignaturePreviews();
  renderActivePreview();
}

/* ===================== 상단 툴바 ===================== */

function bindTopbar() {
  document.getElementById("btnNew").addEventListener("click", () => {
    if (!confirm("현재 작성 중인 내용을 지우고 새 검측을 시작할까요? 저장하지 않은 내용은 사라집니다.")) return;
    state = createDefaultState();
    afterStateReplaced();
  });

  document.getElementById("btnResetAll").addEventListener("click", () => {
    if (!confirm("정말 모든 데이터를 초기화할까요? 자동 임시저장 내용도 함께 삭제되며 되돌릴 수 없습니다.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = createDefaultState();
    afterStateReplaced({ autosave: false });
  });

  document.getElementById("btnSaveJson").addEventListener("click", () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const no = state.projectInfo.inspectionNo || "미지정";
    a.href = url;
    a.download = `검측_${no}_${state.projectInfo.inspectionDate || todayStr()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  document.getElementById("btnLoad").addEventListener("click", () => {
    document.getElementById("fileLoad").click();
  });
  document.getElementById("fileLoad").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = mergeWithDefaults(parsed);
        afterStateReplaced();
        alert("불러오기가 완료되었습니다.");
      } catch (err) {
        alert("파일을 읽을 수 없습니다. 검측프로에서 저장한 JSON 파일인지 확인하세요.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });
}

function afterStateReplaced(options = { autosave: true }) {
  fillFormsFromState();
  populateSubWorkSelect(state.requestInfo.categoryId);
  document.getElementById("ri_subWork").value = state.requestInfo.subWorkCode || "";
  renderChecklistRows();
  renderPhotoList();
  renderParticipantRows();
  renderSignaturePreviews();
  goToStep(1, options);
  renderActivePreview();
  if (options.autosave) scheduleAutosave();
}

/* ===================== 단계 네비게이션 ===================== */

function bindStepNav() {
  document.querySelectorAll(".step-btn").forEach((btn) => {
    btn.addEventListener("click", () => goToStep(Number(btn.dataset.step)));
  });
}
function goToStep(step, options = { autosave: true }) {
  state.ui.activeStep = step;
  document.querySelectorAll(".step-btn").forEach((b) => b.classList.toggle("active", Number(b.dataset.step) === step));
  document.querySelectorAll(".step-panel").forEach((p) => p.classList.toggle("active", Number(p.dataset.panel) === step));

  const stepDocMap = {
    2: "request",
    3: "checklist",
    4: "photos",
    5: "result",
    6: "participants",
  };
  if (stepDocMap[step]) {
    state.ui.activeDoc = stepDocMap[step];
    document.querySelectorAll(".ptab").forEach((b) => b.classList.toggle("active", b.dataset.doc === state.ui.activeDoc));
    renderActivePreview();
  }
  if (options.autosave) scheduleAutosave();
}

/* ===================== STEP1: 현장 기본정보 ===================== */

function bindProjectForm() {
  const map = {
    pi_projectName: "projectName",
    pi_siteName: "siteName",
    pi_contractor: "contractor",
    pi_supervisor: "supervisor",
    pi_siteManager: "siteManager",
    pi_inspectionNo: "inspectionNo",
    pi_inspectionDate: "inspectionDate",
  };
  Object.entries(map).forEach(([id, field]) => {
    document.getElementById(id).addEventListener("input", (e) => {
      state.projectInfo[field] = e.target.value;
      scheduleAutosave();
      scheduleRender();
    });
  });
}

/* ===================== STEP2: 검측요청 정보 ===================== */

function populateCategorySelect() {
  const sel = document.getElementById("ri_category");
  sel.innerHTML = WORK_CATEGORIES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
}
function populateSubWorkSelect(categoryId) {
  const sel = document.getElementById("ri_subWork");
  const list = getSubWorkByCategory(categoryId);
  const options = [`<option value="">(세부공종 선택)</option>`].concat(
    list.map((t) => `<option value="${t.code}">${esc(t.name)}</option>`)
  );
  sel.innerHTML = options.join("");
}

function bindRequestForm() {
  document.getElementById("ri_category").addEventListener("change", (e) => {
    state.requestInfo.categoryId = e.target.value;
    state.requestInfo.subWorkCode = "";
    populateSubWorkSelect(e.target.value);
    scheduleAutosave();
    scheduleRender();
  });

  document.getElementById("ri_subWork").addEventListener("change", (e) => {
    state.requestInfo.subWorkCode = e.target.value;
    if (state.checklist.length === 0 && e.target.value) {
      loadTemplateItemsIntoChecklist(e.target.value, false);
    }
    scheduleAutosave();
    scheduleRender();
  });

  const textMap = {
    ri_location: "location",
    ri_drawingNo: "drawingNo",
    ri_requestDateTime: "requestDateTime",
    ri_requestor: "requestor",
    ri_requestNote: "requestNote",
  };
  Object.entries(textMap).forEach(([id, field]) => {
    document.getElementById(id).addEventListener("input", (e) => {
      state.requestInfo[field] = e.target.value;
      scheduleAutosave();
      scheduleRender();
    });
  });

  document.getElementById("btnLoadTemplateItems").addEventListener("click", () => {
    const code = state.requestInfo.subWorkCode;
    if (!code) {
      alert("먼저 세부공종을 선택하세요.");
      return;
    }
    if (state.checklist.length > 0 && !confirm("현재 작성된 검사항목을 기본 항목으로 다시 채울까요? 기존 입력 내용은 사라집니다.")) {
      return;
    }
    loadTemplateItemsIntoChecklist(code, true);
  });
}

function loadTemplateItemsIntoChecklist(code, force) {
  const tpl = getSubWorkTemplate(code);
  if (!tpl) return;
  if (!force && state.checklist.length > 0) return;
  state.checklist = tpl.items.map((it) => ({
    item: it.item,
    standard: it.standard,
    result: { c1: "", c2: "", s1: "", s2: "" },
    action: "",
    remark: "",
  }));
  renderChecklistRows();
  scheduleAutosave();
  scheduleRender();
}

/* ===================== STEP3: 검측점검표 ===================== */

function bindChecklist() {
  document.getElementById("btnAddRow").addEventListener("click", () => {
    state.checklist.push({ item: "", standard: "", result: { c1: "", c2: "", s1: "", s2: "" }, action: "", remark: "" });
    renderChecklistRows();
    scheduleAutosave();
    scheduleRender();
  });

  const container = document.getElementById("checklistRows");
  function updateChecklistFromEvent(e) {
    const rowEl = e.target.closest(".checklist-row");
    if (!rowEl) return;
    const idx = Number(rowEl.dataset.idx);
    const field = e.target.dataset.field;
    if (!field || !state.checklist[idx]) return;
    if (field.startsWith("result.")) {
      const key = field.split(".")[1];
      state.checklist[idx].result[key] = e.target.value;
    } else {
      state.checklist[idx][field] = e.target.value;
    }
    scheduleAutosave();
    scheduleRender();
  }
  container.addEventListener("input", updateChecklistFromEvent);
  container.addEventListener("change", updateChecklistFromEvent);

  container.addEventListener("click", (e) => {
    const rowEl = e.target.closest(".checklist-row");
    if (!rowEl) return;
    const idx = Number(rowEl.dataset.idx);
    if (e.target.dataset.action === "removeRow") {
      if (!confirm("이 검사항목을 삭제할까요?")) return;
      state.checklist.splice(idx, 1);
      renderChecklistRows();
      scheduleAutosave();
      scheduleRender();
    } else if (e.target.dataset.action === "attachPhoto") {
      pendingLinkIndex = idx;
      document.getElementById("photoInput").click();
    }
  });
}

function resultSelectHTML(field, selected) {
  const opts = ["", "적합", "부적합", "해당없음"]
    .map((v) => `<option value="${v}" ${v === selected ? "selected" : ""}>${v || "-"}</option>`)
    .join("");
  return `<select data-field="${field}">${opts}</select>`;
}

function renderChecklistRows() {
  const container = document.getElementById("checklistRows");
  if (state.checklist.length === 0) {
    container.innerHTML = `<p class="hint">검사항목이 없습니다. 2단계에서 세부공종을 선택하거나 "+ 검사항목 추가"를 눌러 항목을 만드세요.</p>`;
    return;
  }
  container.innerHTML = state.checklist
    .map((row, i) => {
      const photoCount = state.photos.filter((p) => p.linkedItem === i).length;
      return `
      <div class="checklist-row" data-idx="${i}">
        <div class="row-head">
          <input type="text" data-field="item" value="${esc(row.item)}" placeholder="검사항목" />
          <button class="row-remove" data-action="removeRow" type="button" title="삭제">✕</button>
        </div>
        <div class="row-field">
          <label>검사기준(시방)</label>
          <input type="text" data-field="standard" value="${esc(row.standard)}" />
        </div>
        <div class="result-grid">
          <label>시공자1차 ${resultSelectHTML("result.c1", row.result.c1)}</label>
          <label>시공자2차 ${resultSelectHTML("result.c2", row.result.c2)}</label>
          <label>감리자1차 ${resultSelectHTML("result.s1", row.result.s1)}</label>
          <label>감리자2차 ${resultSelectHTML("result.s2", row.result.s2)}</label>
        </div>
        <div class="row-field"><label>조치사항</label><input type="text" data-field="action" value="${esc(row.action)}" /></div>
        <div class="row-field"><label>특기사항</label><input type="text" data-field="remark" value="${esc(row.remark)}" /></div>
        <div class="row-photo-btn">
          <button class="btn btn-sm" data-action="attachPhoto" type="button">사진첨부</button>
          <span class="photo-badge">${photoCount > 0 ? photoCount + "장 연결됨" : ""}</span>
        </div>
      </div>`;
    })
    .join("");
}

/* ===================== 서명 모달(공통) ===================== */

let currentSigTarget = null;
let sigCtx = null;
let sigDrawing = false;

function bindSignatureModal() {
  document.querySelectorAll("[data-sigbtn]").forEach((btn) => {
    btn.addEventListener("click", () => openSignatureModal({ type: "fixed", key: btn.dataset.sigbtn }));
  });

  const canvas = document.getElementById("sigCanvas");
  sigCtx = canvas.getContext("2d");

  function pos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }
  function start(e) {
    sigDrawing = true;
    const p = pos(e);
    sigCtx.beginPath();
    sigCtx.moveTo(p.x, p.y);
    e.preventDefault();
  }
  function move(e) {
    if (!sigDrawing) return;
    const p = pos(e);
    sigCtx.lineTo(p.x, p.y);
    sigCtx.strokeStyle = "#1f2937";
    sigCtx.lineWidth = 2.4;
    sigCtx.lineCap = "round";
    sigCtx.stroke();
    e.preventDefault();
  }
  function end() {
    sigDrawing = false;
  }
  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  window.addEventListener("mouseup", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);

  document.getElementById("sigClear").addEventListener("click", () => {
    sigCtx.clearRect(0, 0, canvas.width, canvas.height);
  });
  document.getElementById("sigCancel").addEventListener("click", closeSignatureModal);
  document.getElementById("sigSave").addEventListener("click", () => {
    const dataUrl = canvas.toDataURL("image/png");
    applySignature(currentSigTarget, dataUrl);
    closeSignatureModal();
  });
}

function openSignatureModal(target) {
  currentSigTarget = target;
  const canvas = document.getElementById("sigCanvas");
  sigCtx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("sigModal").hidden = false;
}
function closeSignatureModal() {
  document.getElementById("sigModal").hidden = true;
  currentSigTarget = null;
}
function applySignature(target, dataUrl) {
  if (!target) return;
  if (target.type === "fixed") {
    state.signatures[target.key] = dataUrl;
    renderSignaturePreviews();
  } else if (target.type === "participant") {
    state.participants[target.idx].signature = dataUrl;
    renderParticipantRows();
  } else if (target.type === "result") {
    state.resultNotice[target.key] = dataUrl;
    renderSignaturePreviews();
  }
  scheduleAutosave();
  scheduleRender();
}

function renderSignaturePreviews() {
  ["contractorCheck", "supervisorCheck", "contractorRecheck", "supervisorRecheck"].forEach((key) => {
    const el = document.getElementById("sigPreview_" + key);
    const v = state.signatures[key];
    el.innerHTML = v ? `<img src="${v}" alt="서명"/>` : `<span class="empty">미서명</span>`;
  });
  ["supervisorSign", "chiefSign"].forEach((key) => {
    const el = document.getElementById("sigPreview_" + key);
    const v = state.signatures[key];
    el.innerHTML = v ? `<img src="${v}" alt="서명"/>` : `<span class="empty">미서명</span>`;
  });
}

/* ===================== STEP4: 사진첨부 ===================== */

let pendingLinkIndex = null; // 체크리스트 행에서 "사진첨부" 클릭 시 자동 연결용
let currentPhotoId = null;

function fileToResizedDataURL(file, maxWidth, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function bindPhotoArea() {
  const dropZone = document.getElementById("dropZone");
  const input = document.getElementById("photoInput");

  dropZone.addEventListener("click", () => {
    pendingLinkIndex = null;
    input.click();
  });
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
  input.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    e.target.value = "";
  });

  document.getElementById("photoList").addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (!card) return;
    openPhotoModal(card.dataset.id);
  });

  document.getElementById("photoModalClose").addEventListener("click", () => {
    const photo = state.photos.find((p) => p.id === currentPhotoId);
    if (photo) {
      photo.caption = document.getElementById("photoModalCaption").value;
      const linkVal = document.getElementById("photoModalLink").value;
      photo.linkedItem = linkVal === "" ? null : Number(linkVal);
    }
    document.getElementById("photoModal").hidden = true;
    renderPhotoList();
    renderChecklistRows();
    scheduleAutosave();
    scheduleRender();
  });
  document.getElementById("photoModalDelete").addEventListener("click", () => {
    if (!confirm("이 사진을 삭제할까요?")) return;
    state.photos = state.photos.filter((p) => p.id !== currentPhotoId);
    document.getElementById("photoModal").hidden = true;
    renderPhotoList();
    renderChecklistRows();
    scheduleAutosave();
    scheduleRender();
  });
}

async function handleFiles(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
  let failedCount = 0;
  for (const file of files) {
    try {
      const dataUrl = await fileToResizedDataURL(file, 1280, 0.82);
      state.photos.push({
        id: uid(),
        dataUrl,
        caption: "",
        linkedItem: pendingLinkIndex,
      });
    } catch (e) {
      failedCount += 1;
    }
  }
  pendingLinkIndex = null;
  renderPhotoList();
  renderChecklistRows();
  scheduleAutosave();
  scheduleRender();
  if (failedCount > 0) {
    alert(`사진 ${failedCount}장을 처리하지 못했습니다. 이미지 파일 형식 또는 용량을 확인하세요.`);
  }
}

function renderPhotoList() {
  const container = document.getElementById("photoList");
  if (state.photos.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = state.photos
    .map(
      (p) => `
      <div class="photo-card" data-id="${p.id}">
        <img src="${p.dataUrl}" alt="첨부 사진" />
        <div class="cap">${esc(p.caption) || "(설명 없음)"}</div>
      </div>`
    )
    .join("");
}

function openPhotoModal(id) {
  currentPhotoId = id;
  const photo = state.photos.find((p) => p.id === id);
  if (!photo) return;
  document.getElementById("photoModalImg").src = photo.dataUrl;
  document.getElementById("photoModalCaption").value = photo.caption || "";
  const sel = document.getElementById("photoModalLink");
  const opts = [`<option value="">연결 안함</option>`].concat(
    state.checklist.map((row, i) => `<option value="${i}">#${i + 1} ${esc(row.item || "(제목없음)")}</option>`)
  );
  sel.innerHTML = opts.join("");
  sel.value = photo.linkedItem === null || photo.linkedItem === undefined ? "" : String(photo.linkedItem);
  document.getElementById("photoModal").hidden = false;
}

/* ===================== STEP5: 검측결과통보서 ===================== */

function bindResultForm() {
  document.getElementById("rn_result").addEventListener("change", (e) => {
    state.resultNotice.result = e.target.value;
    scheduleAutosave();
    scheduleRender();
  });
  document.getElementById("rn_noticeDate").addEventListener("input", (e) => {
    state.resultNotice.noticeDate = e.target.value;
    scheduleAutosave();
    scheduleRender();
  });
  document.getElementById("rn_instructions").addEventListener("input", (e) => {
    state.resultNotice.instructions = e.target.value;
    scheduleAutosave();
    scheduleRender();
  });
}

/* ===================== STEP6: 공사 참여자 실명부 ===================== */

function bindParticipants() {
  document.getElementById("btnAddParticipant").addEventListener("click", () => {
    state.participants.push({
      workDate: todayStr(),
      location: "",
      affiliation: "",
      position: "",
      name: "",
      idInfo: "",
      workContent: "",
      signature: null,
    });
    renderParticipantRows();
    scheduleAutosave();
    scheduleRender();
  });

  const container = document.getElementById("participantRows");
  container.addEventListener("input", (e) => {
    const rowEl = e.target.closest(".participant-row");
    if (!rowEl) return;
    const idx = Number(rowEl.dataset.idx);
    const field = e.target.dataset.field;
    if (!field) return;
    state.participants[idx][field] = e.target.value;
    scheduleAutosave();
    scheduleRender();
  });
  container.addEventListener("click", (e) => {
    const rowEl = e.target.closest(".participant-row");
    if (!rowEl) return;
    const idx = Number(rowEl.dataset.idx);
    if (e.target.dataset.action === "removeParticipant") {
      if (!confirm("이 참여자를 삭제할까요?")) return;
      state.participants.splice(idx, 1);
      renderParticipantRows();
      scheduleAutosave();
      scheduleRender();
    } else if (e.target.dataset.action === "signParticipant") {
      openSignatureModal({ type: "participant", idx });
    }
  });
}

function renderParticipantRows() {
  const container = document.getElementById("participantRows");
  if (state.participants.length === 0) {
    container.innerHTML = `<p class="hint">참여자가 없습니다. "+ 참여자 추가"를 눌러 입력하세요.</p>`;
    return;
  }
  container.innerHTML = state.participants
    .map(
      (row, i) => `
      <div class="participant-row" data-idx="${i}">
        <button class="row-remove" data-action="removeParticipant" type="button">✕</button>
        <label>작업일<input type="date" data-field="workDate" value="${esc(row.workDate)}" /></label>
        <label>작업위치/공종<input type="text" data-field="location" value="${esc(row.location)}" /></label>
        <label>소속<input type="text" data-field="affiliation" value="${esc(row.affiliation)}" /></label>
        <label>직위<input type="text" data-field="position" value="${esc(row.position)}" /></label>
        <label>성명<input type="text" data-field="name" value="${esc(row.name)}" /></label>
        <label>생년월일/식별정보<input type="text" data-field="idInfo" value="${esc(row.idInfo)}" /></label>
        <label class="full">공사한 내용<input type="text" data-field="workContent" value="${esc(row.workContent)}" /></label>
        <label>서명
          <button class="btn btn-sm" data-action="signParticipant" type="button">서명하기</button>
        </label>
        <div>${row.signature ? `<img src="${row.signature}" style="max-height:34px" alt="서명"/>` : `<span class="hint">미서명</span>`}</div>
      </div>`
    )
    .join("");
}

/* ===================== 폼 <- 상태 반영 ===================== */

function fillFormsFromState() {
  document.getElementById("pi_projectName").value = state.projectInfo.projectName;
  document.getElementById("pi_siteName").value = state.projectInfo.siteName;
  document.getElementById("pi_contractor").value = state.projectInfo.contractor;
  document.getElementById("pi_supervisor").value = state.projectInfo.supervisor;
  document.getElementById("pi_siteManager").value = state.projectInfo.siteManager;
  document.getElementById("pi_inspectionNo").value = state.projectInfo.inspectionNo;
  document.getElementById("pi_inspectionDate").value = state.projectInfo.inspectionDate;

  document.getElementById("ri_category").value = state.requestInfo.categoryId;
  populateSubWorkSelect(state.requestInfo.categoryId);
  document.getElementById("ri_subWork").value = state.requestInfo.subWorkCode;
  document.getElementById("ri_location").value = state.requestInfo.location;
  document.getElementById("ri_drawingNo").value = state.requestInfo.drawingNo;
  document.getElementById("ri_requestDateTime").value = state.requestInfo.requestDateTime;
  document.getElementById("ri_requestor").value = state.requestInfo.requestor;
  document.getElementById("ri_requestNote").value = state.requestInfo.requestNote;

  document.getElementById("rn_result").value = state.resultNotice.result;
  document.getElementById("rn_noticeDate").value = state.resultNotice.noticeDate;
  document.getElementById("rn_instructions").value = state.resultNotice.instructions;
}

/* ===================== 미리보기 탭 ===================== */

function bindPreviewTabs() {
  document.querySelectorAll(".ptab").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.ui.activeDoc = btn.dataset.doc;
      document.querySelectorAll(".ptab").forEach((b) => b.classList.toggle("active", b === btn));
      renderActivePreview();
    });
  });
}

function renderActivePreview() {
  const area = document.getElementById("previewArea");
  const doc = state.ui.activeDoc || "request";
  const builders = {
    request: buildRequestDocHTML,
    checklist: buildChecklistDocHTML,
    result: buildResultDocHTML,
    participants: buildParticipantsDocHTML,
    photos: buildPhotosDocHTML,
  };
  area.innerHTML = (builders[doc] || buildRequestDocHTML)(state);
}

/* ===================== 문서 템플릿 빌더 ===================== */

function categoryName(id) {
  const c = WORK_CATEGORIES.find((x) => x.id === id);
  return c ? c.name : "";
}
function subWorkName(code) {
  const t = getSubWorkTemplate(code);
  return t ? t.name : "";
}
function sigCell(dataUrl) {
  return dataUrl ? `<img class="sig-img" src="${dataUrl}" alt="서명"/>` : `<span class="sig-line">&nbsp;</span>`;
}

function projectMetaTableHTML() {
  const p = state.projectInfo;
  return `
  <table class="meta-table">
    <tr><td>공사명</td><td>${esc(p.projectName)}</td><td>검측번호</td><td>${esc(p.inspectionNo)}</td></tr>
    <tr><td>현장명</td><td>${esc(p.siteName)}</td><td>검측일자</td><td>${esc(p.inspectionDate)}</td></tr>
    <tr><td>시공사</td><td>${esc(p.contractor)}</td><td>감리자</td><td>${esc(p.supervisor)}</td></tr>
    <tr><td>현장대리인</td><td colspan="3">${esc(p.siteManager)}</td></tr>
  </table>`;
}

function buildRequestDocHTML() {
  const r = state.requestInfo;
  return `
  <h1>검측 요청서</h1>
  ${projectMetaTableHTML()}
  <table>
    <tr><th style="width:110px">공종</th><td>${esc(categoryName(r.categoryId))}</td></tr>
    <tr><th>세부공종</th><td>${esc(subWorkName(r.subWorkCode))}</td></tr>
    <tr><th>위치 및 부위</th><td>${esc(r.location)}</td></tr>
    <tr><th>도면번호</th><td>${esc(r.drawingNo)}</td></tr>
    <tr><th>검측요구일시</th><td>${esc(r.requestDateTime).replace("T", " ")}</td></tr>
    <tr><th>요청인</th><td>${esc(r.requestor)}</td></tr>
    <tr><th>비고</th><td>${nl2br(r.requestNote)}</td></tr>
  </table>
  <p>위와 같이 검측을 요청하오니 확인하여 주시기 바랍니다.</p>
  <div class="doc-footer-note">본 요청서는 문서작성 보조도구로 자동 작성된 자료이며, 최종 검측 일정 및 승인 여부는 감리자와 협의하여 결정합니다.</div>`;
}

function buildChecklistDocHTML() {
  const p = state.projectInfo;
  const r = state.requestInfo;
  const rows = state.checklist
    .map(
      (row, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${esc(row.item)}</td>
        <td>${esc(row.standard)}</td>
        <td>${esc(row.result.c1) || "-"}</td>
        <td>${esc(row.result.c2) || "-"}</td>
        <td>${esc(row.result.s1) || "-"}</td>
        <td>${esc(row.result.s2) || "-"}</td>
        <td>${esc(row.action)}</td>
        <td>${esc(row.remark)}</td>
      </tr>`
    )
    .join("");
  return `
  <h1>검측 점검표</h1>
  <table class="meta-table">
    <tr><td>공종 CODE No.</td><td>${esc(r.subWorkCode)}</td><td>검측일자</td><td>${esc(p.inspectionDate)}</td></tr>
    <tr><td>공종</td><td>${esc(categoryName(r.categoryId))}</td><td>세부공종</td><td>${esc(subWorkName(r.subWorkCode))}</td></tr>
    <tr><td>위치 및 부위</td><td>${esc(r.location)}</td><td>도면번호</td><td>${esc(r.drawingNo)}</td></tr>
  </table>
  <table>
    <thead>
      <tr>
        <th>순번</th><th>검사항목</th><th>검사기준(시방)</th>
        <th>시공자1차</th><th>시공자2차</th><th>감리자1차</th><th>감리자2차</th>
        <th>조치사항</th><th>특기사항</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="9">작성된 검사항목이 없습니다.</td></tr>`}</tbody>
  </table>
  <table class="meta-table">
    <tr>
      <td>시공자 점검</td><td>${sigCell(state.signatures.contractorCheck)}</td>
      <td>감리원 검측</td><td>${sigCell(state.signatures.supervisorCheck)}</td>
    </tr>
    <tr>
      <td>시공자 재점검</td><td>${sigCell(state.signatures.contractorRecheck)}</td>
      <td>감리원 재검측</td><td>${sigCell(state.signatures.supervisorRecheck)}</td>
    </tr>
  </table>
  <div class="doc-footer-note">검사결과의 적합/부적합 판정은 시공자와 감리원이 직접 선택한 값이며, 본 프로그램은 판정을 자동으로 결정하지 않습니다.</div>`;
}

function buildResultDocHTML() {
  const rn = state.resultNotice;
  return `
  <h1>검측 결과 통보서</h1>
  ${projectMetaTableHTML()}
  <table>
    <tr><th style="width:110px">검측결과</th><td>${esc(rn.result) || "(미선택)"}</td></tr>
    <tr><th>통보일자</th><td>${esc(rn.noticeDate)}</td></tr>
    <tr><th>지시사항</th><td>${nl2br(rn.instructions)}</td></tr>
  </table>
  <table class="meta-table">
    <tr>
      <td>감리원</td><td>${sigCell(state.signatures.supervisorSign)}</td>
      <td>총괄감리원</td><td>${sigCell(state.signatures.chiefSign)}</td>
    </tr>
  </table>
  <div class="doc-footer-note">감리 승인 및 최종 적합 여부에 대한 판단은 현장 책임자와 감리자가 직접 수행합니다. 본 통보서는 작성 보조 자료입니다.</div>`;
}

function buildParticipantsDocHTML() {
  const rows = state.participants
    .map(
      (row) => `
      <tr>
        <td>${esc(row.workDate)}</td>
        <td>${esc(row.location)}</td>
        <td>${esc(row.affiliation)}</td>
        <td>${esc(row.position)}</td>
        <td>${esc(row.name)}</td>
        <td>${esc(row.idInfo)}</td>
        <td>${esc(row.workContent)}</td>
        <td>${sigCell(row.signature)}</td>
      </tr>`
    )
    .join("");
  return `
  <h1>공사 참여자 실명부</h1>
  ${projectMetaTableHTML()}
  <table>
    <thead>
      <tr>
        <th>작업일</th><th>작업위치 및 공종</th><th>소속</th><th>직위</th><th>성명</th>
        <th>생년월일/식별정보</th><th>공사한 내용</th><th>서명</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="8">등록된 참여자가 없습니다.</td></tr>`}</tbody>
  </table>
  <div class="doc-footer-note">본 실명부의 개인정보는 서버에 저장되지 않으며 사용자의 PC(JSON/PDF 파일)에만 보관됩니다. 취급에 유의하시기 바랍니다.</div>`;
}

function buildPhotosDocHTML() {
  if (state.photos.length === 0) {
    return `<h1>사진첨부 자료</h1><p>첨부된 사진이 없습니다.</p>`;
  }
  const figures = state.photos
    .map((p) => {
      const linkTxt = p.linkedItem !== null && p.linkedItem !== undefined && state.checklist[p.linkedItem]
        ? `[#${p.linkedItem + 1} ${esc(state.checklist[p.linkedItem].item)}] `
        : "";
      return `<figure><img src="${p.dataUrl}" alt="첨부 사진"/><figcaption>${linkTxt}${esc(p.caption)}</figcaption></figure>`;
    })
    .join("");
  return `
  <h1>사진첨부 자료(사진대지)</h1>
  ${projectMetaTableHTML()}
  <div class="photo-grid">${figures}</div>`;
}

function buildAllDocHTML() {
  return [buildRequestDocHTML(), buildChecklistDocHTML(), buildResultDocHTML(), buildParticipantsDocHTML(), buildPhotosDocHTML()]
    .map((html) => `<div class="doc-page doc-a4">${html}</div>`)
    .join("");
}

/* ===================== PDF 출력 (브라우저 인쇄) ===================== */

function bindPrintButtons() {
  document.querySelectorAll("[data-print]").forEach((btn) => {
    btn.addEventListener("click", () => printDoc(btn.dataset.print));
  });
}

function printDoc(type) {
  const root = document.getElementById("printRoot");
  if (type === "all") {
    root.innerHTML = buildAllDocHTML();
  } else {
    const builders = {
      request: buildRequestDocHTML,
      checklist: buildChecklistDocHTML,
      result: buildResultDocHTML,
      participants: buildParticipantsDocHTML,
      photos: buildPhotosDocHTML,
    };
    const html = (builders[type] || buildRequestDocHTML)();
    root.innerHTML = `<div class="doc-page doc-a4">${html}</div>`;
  }
  requestAnimationFrame(() => window.print());
}



