/**
 * 검측프로 - 검측업무 DB 어댑터
 *
 * window.INSPECTION_DATABASE (inspectionDatabase.generated.js) 를
 * 기존 앱이 쓰는 WORK_CATEGORIES / SUB_WORK_TEMPLATES 형식으로 바꿔 넣는다.
 *
 * 로딩 순서 (index.html):
 *   1) inspectionTemplates.js        기존 데이터. 손대지 않는다.
 *   2) inspectionDatabase.generated.js  DB 데이터. 자동 생성물.
 *   3) inspectionDataAdapter.js      ← 이 파일. 둘을 합친다.
 *   4) app.js                        앱 로직.
 *
 * 왜 이런 방식인가:
 *   inspectionTemplates.js 의 WORK_CATEGORIES / SUB_WORK_TEMPLATES 는
 *   최상위 `const` 다. 클래식 스크립트의 최상위 const 는 전역 렉시컬
 *   환경에 바인딩되므로 다른 스크립트에서 재선언하면 SyntaxError 가 나고
 *   앱 전체가 죽는다. 그러나 배열 자체는 변형 가능하므로
 *   push() 로 항목을 덧붙이는 방식을 쓴다.
 *   덕분에 getSubWorkTemplate() / getSubWorkByCategory() 를 비롯한
 *   app.js 의 기존 함수를 하나도 고치지 않고 새 데이터가 흘러들어간다.
 *
 * 데이터 취급 원칙:
 *   - 원문에 없는 검사기준을 만들어내지 않는다.
 *   - 자동 추출 항목은 전부 verificationStatus "unverified" 다.
 *   - 기존 하드코딩 템플릿과 DB 템플릿은 code 접두사로 구분된다.
 */

(function () {
  "use strict";

  var DB = window.INSPECTION_DATABASE;

  /** 어댑터가 만들어낸 것들. app.js 와 테스트가 참조한다. */
  window.INSPECTION_DB_ADAPTER = {
    available: false,
    reason: null,
    templateCodes: [],
    itemsByCode: {},
    templateMetaByCode: {},
    stats: null,
  };

  var A = window.INSPECTION_DB_ADAPTER;

  if (!DB || typeof DB !== "object") {
    A.reason = "INSPECTION_DATABASE 가 없습니다. inspectionDatabase.generated.js 로딩 실패.";
    console.warn("[검측DB] " + A.reason + " 기존 템플릿만 사용합니다.");
    return;
  }
  if (typeof WORK_CATEGORIES === "undefined" || typeof SUB_WORK_TEMPLATES === "undefined") {
    A.reason = "기존 inspectionTemplates.js 가 먼저 로딩되지 않았습니다.";
    console.error("[검측DB] " + A.reason);
    return;
  }

  var categories = Array.isArray(DB.categories) ? DB.categories : [];
  var templates = Array.isArray(DB.templates) ? DB.templates : [];
  var items = Array.isArray(DB.items) ? DB.items : [];
  var references = Array.isArray(DB.references) ? DB.references : [];

  /* ---------------- 1. 공종: 기존 id 재사용, 없으면 새로 추가 ---------------- */

  var existingCategoryIds = {};
  WORK_CATEGORIES.forEach(function (c) {
    existingCategoryIds[c.id] = true;
  });

  var addedCategories = 0;
  categories.forEach(function (cat) {
    var appId = cat.appCategoryId || "etc";
    if (existingCategoryIds[appId]) return;
    // 기존에 없는 공종만 새로 만든다. 같은 이름이 두 번 나오지 않게 한다.
    var dupName = WORK_CATEGORIES.some(function (c) {
      return c.name === cat.name;
    });
    if (dupName) return;
    WORK_CATEGORIES.push({ id: appId, name: cat.name });
    existingCategoryIds[appId] = true;
    addedCategories += 1;
  });

  /* ---------------- 2. 검사항목을 템플릿별로 묶기 ---------------- */

  var itemsByTemplateId = {};
  items.forEach(function (it) {
    if (!it || !it.templateId) return;
    if (!itemsByTemplateId[it.templateId]) itemsByTemplateId[it.templateId] = [];
    itemsByTemplateId[it.templateId].push(it);
  });
  Object.keys(itemsByTemplateId).forEach(function (k) {
    itemsByTemplateId[k].sort(function (a, b) {
      return (a.sequence || 0) - (b.sequence || 0);
    });
  });

  var referenceById = {};
  references.forEach(function (r) {
    if (r && r.id) referenceById[r.id] = r;
  });

  /**
   * DB 검사항목 → 기존 앱의 items 원소 형식.
   *
   * 기존 형식은 { item, standard } 두 필드뿐이다.
   * 앱 호환을 위해 그 두 필드를 반드시 채우되,
   * 추적/표시에 필요한 값은 접두사 없는 추가 필드로 함께 싣는다.
   * app.js 의 loadTemplateItemsIntoChecklist() 가 이 추가 필드를
   * 체크리스트 행으로 옮긴다.
   */
  function toAppItem(it) {
    var missing = it.criteriaStatus === "missing_in_source";
    return {
      // --- 기존 앱이 요구하는 필드 ---
      item: it.title || it.sourceText || "",
      // 원문에 기준이 없으면 빈 문자열. 절대 만들어 넣지 않는다.
      standard: missing ? "" : (it.criteriaText || ""),

      // --- DB 추적용 추가 필드 ---
      dbItemId: it.id || null,
      dbTemplateId: it.templateId || null,
      criteriaText: missing ? null : (it.criteriaText || null),
      criteriaStatus: it.criteriaStatus || "present",
      verificationStatus: it.appVerificationStatus || "unverified",
      dbVerificationStatus: it.verificationStatus || null,
      referenceType: it.referenceType || null,
      valueType: it.valueType || null,
      unit: it.unit || null,
      operator: it.operator || null,
      targetValue: it.targetValue === undefined ? null : it.targetValue,
      minValue: it.minValue === undefined ? null : it.minValue,
      maxValue: it.maxValue === undefined ? null : it.maxValue,
      requiresPhoto: !!it.requiresPhoto,
      requiresMeasurement: !!it.requiresMeasurement,
      isHoldPoint: !!it.isHoldPoint,
      isWitnessPoint: !!it.isWitnessPoint,
      sourceIds: Array.isArray(it.sourceIds) ? it.sourceIds.slice() : [],
      sourceText: it.sourceText || null,
      dbNotes: it.notes || null,
    };
  }

  /* ---------------- 3. 세부공종 템플릿 주입 ---------------- */

  var existingCodes = {};
  SUB_WORK_TEMPLATES.forEach(function (t) {
    existingCodes[t.code] = true;
  });

  var addedTemplates = 0;
  var skippedTemplates = [];

  templates.forEach(function (tpl) {
    var code = tpl.appCode || tpl.code;
    if (!code) return;

    // 기존 코드와 충돌하면 주입하지 않는다. 기존 데이터가 우선이다.
    if (existingCodes[code]) {
      skippedTemplates.push({ code: code, reason: "기존 코드와 충돌" });
      return;
    }

    var dbItems = itemsByTemplateId[tpl.id] || [];
    if (dbItems.length === 0) {
      skippedTemplates.push({ code: code, reason: "검사항목 0건" });
      return;
    }

    var appCategoryId = tpl.appCategoryId || "etc";
    if (!existingCategoryIds[appCategoryId]) appCategoryId = "etc";

    SUB_WORK_TEMPLATES.push({
      // --- 기존 앱이 요구하는 필드 ---
      code: code,
      name: tpl.name || tpl.subTrade || code,
      category: appCategoryId,
      items: dbItems.map(toAppItem),

      // --- DB 추적용 추가 필드 ---
      dbTemplateId: tpl.id,
      templateSource: "normalized-db",
      verificationStatus: tpl.verificationStatus === "verified" ? "verified" : "unverified",
      dbVerificationStatus: tpl.verificationStatus || null,
      formIssues: Array.isArray(tpl.formIssues) ? tpl.formIssues.slice() : [],
      originalCategoryName: tpl.originalCategoryName || null,
      dbNotes: tpl.notes || null,
      sourceIds: Array.isArray(tpl.sourceIds) ? tpl.sourceIds.slice() : [],
    });

    existingCodes[code] = true;
    addedTemplates += 1;
    A.templateCodes.push(code);
    A.itemsByCode[code] = dbItems.length;
    A.templateMetaByCode[code] = {
      dbTemplateId: tpl.id,
      formIssues: Array.isArray(tpl.formIssues) ? tpl.formIssues.slice() : [],
      verificationStatus: "unverified",
      missingCriteria: dbItems.filter(function (i) {
        return i.criteriaStatus === "missing_in_source";
      }).length,
    };
  });

  /* ---------------- 4. 조회 헬퍼 (기존 함수는 건드리지 않음) ---------------- */

  /** DB 출처 레코드 조회. 없으면 null. */
  A.getSourceReference = function (sourceId) {
    if (!sourceId) return null;
    return referenceById[sourceId] || null;
  };

  /** 템플릿 코드가 DB에서 온 것인지 */
  A.isDatabaseTemplate = function (code) {
    return !!(code && A.templateMetaByCode[code]);
  };

  /** 템플릿 코드의 DB 메타 조회 */
  A.getTemplateMeta = function (code) {
    if (!code) return null;
    return A.templateMetaByCode[code] || null;
  };

  /** 검사항목의 원문 출처 텍스트들 */
  A.getSourceTexts = function (sourceIds) {
    if (!Array.isArray(sourceIds)) return [];
    return sourceIds
      .map(function (id) {
        return referenceById[id];
      })
      .filter(Boolean)
      .map(function (r) {
        return r.sourceText;
      });
  };

  A.available = addedTemplates > 0;
  A.stats = {
    addedCategories: addedCategories,
    addedTemplates: addedTemplates,
    addedItems: A.templateCodes.reduce(function (sum, c) {
      return sum + A.itemsByCode[c];
    }, 0),
    skipped: skippedTemplates,
    missingCriteriaItems: items.filter(function (i) {
      return i.criteriaStatus === "missing_in_source";
    }).length,
    inputDigest: (DB.meta && DB.meta.inputDigest) || null,
  };

  console.info(
    "[검측DB] 공종 +" + addedCategories +
    ", 세부공종 +" + addedTemplates +
    ", 검사항목 +" + A.stats.addedItems +
    " (전부 미검증 unverified" +
    (A.stats.missingCriteriaItems ? ", 기준누락 " + A.stats.missingCriteriaItems + "건" : "") +
    ")"
  );
  if (skippedTemplates.length) {
    console.warn("[검측DB] 주입하지 않은 템플릿:", skippedTemplates);
  }
})();
