/**
 * 검측프로 - 검측업무 데이터 통합 어댑터
 *
 * 하는 일이 세 가지다.
 *
 *  (1) 검증  : window.INSPECTION_DATABASE 를 검사해 오류/경고를 모으고,
 *              쓸 수 없는 데이터를 제외하거나 안전한 값으로 대체한다.
 *  (2) 주입  : 검증을 통과한 DB 템플릿을 기존 WORK_CATEGORIES /
 *              SUB_WORK_TEMPLATES 배열에 덧붙인다. (기존 app.js 호환)
 *  (3) 정규화: 기존 템플릿과 DB 템플릿을 하나의 표준 구조로 변환해
 *              window.InspectionDataAdapter 로 노출한다. 앱은 데이터
 *              출처를 몰라도 된다.
 *
 * 로딩 순서 (index.html / test-inspection-data.html 공통):
 *   1) inspectionTemplates.js           기존 데이터. 손대지 않는다.
 *   2) inspectionDatabase.generated.js  DB 데이터. 자동 생성물. 편집 금지.
 *   3) inspectionDataAdapter.js         ← 이 파일.
 *   4) app.js                           앱 로직.
 *
 * 왜 배열에 push 하는가:
 *   inspectionTemplates.js 의 WORK_CATEGORIES / SUB_WORK_TEMPLATES 는
 *   최상위 `const` 다. 클래식 스크립트의 최상위 const 는 전역 렉시컬
 *   환경에 바인딩되므로 다른 스크립트에서 재선언하면 SyntaxError 가 나고
 *   앱 전체가 죽는다. 배열 자체는 변형 가능하므로 push() 로 덧붙인다.
 *
 * 데이터 취급 원칙:
 *   - 원문에 없는 검사기준을 만들어내지 않는다. 없으면 빈 문자열이다.
 *   - 자동 추출 항목은 전부 verificationStatus "unverified" 다.
 *   - 기존 하드코딩 템플릿과 DB 템플릿은 code 접두사("DB-")로 구분된다.
 *   - 어떤 데이터가 깨져 있어도 예외를 밖으로 던지지 않는다.
 */

(function (global) {
  // 같은 스크립트가 다시 로드되어도 기존 배열과 API를 그대로 재사용한다.
  if (global.__GUMCHEUK_INSPECTION_ADAPTER_INITIALIZED__ && global.InspectionDataAdapter) {
    return;
  }
  "use strict";

  /* ==================== 0. 상수 및 안전 헬퍼 ==================== */

  /** 기존 하드코딩 템플릿의 출처 표기 */
  var LEGACY_SOURCE_FILE = "inspectionTemplates.js";
  /** DB 템플릿임을 나타내는 표식 (기존 코드가 이미 쓰는 값) */
  var DB_TEMPLATE_SOURCE = "normalized-db";
  /** 한 템플릿 안에서 같은 검사항목 문구가 이 횟수를 넘으면 과다중복 경고 */
  var DUPLICATE_ITEM_TEXT_LIMIT = 3;
  /** 카테고리를 특정할 수 없을 때 떨어지는 공종 id */
  var FALLBACK_CATEGORY_ID = "etc";

  function str(v) {
    if (v === null || v === undefined) return "";
    return typeof v === "string" ? v : String(v);
  }
  function trimmed(v) {
    return str(v).trim();
  }
  function list(v) {
    return Array.isArray(v) ? v : [];
  }
  /** 첫 번째로 비어 있지 않은 문자열. 전부 비면 "" */
  function firstText() {
    for (var i = 0; i < arguments.length; i += 1) {
      var s = trimmed(arguments[i]);
      if (s) return s;
    }
    return "";
  }
  /** 예외를 삼키고 대체값을 돌려준다. 앱이 멈추지 않게 하는 마지막 방어선. */
  function guard(label, fallback, fn) {
    try {
      return fn();
    } catch (e) {
      console.error("[검측DB] " + label + " 중 오류가 발생해 건너뜁니다.", e);
      return fallback;
    }
  }

  /* ==================== 1. 검증 ==================== */

  function issue(code, scope, targetId, message) {
    return { code: code, scope: scope, targetId: str(targetId), message: message };
  }

  /**
   * 검측 DB 를 검사한다. 부수효과 없는 순수 함수다.
   *
   * @param {object} db      window.INSPECTION_DATABASE 형태의 객체
   * @param {object} context { legacyTemplateCodes: [], legacyCategoryIds: [] }
   *                         기존 데이터와의 ID 충돌 검사에 쓴다. 없으면 생략된다.
   * @returns {{valid:boolean, errors:Array, warnings:Array, summary:object,
   *            excludedTemplateIds:Array, repairedTemplateIds:Array}}
   */
  function validateDatabase(db, context) {
    var errors = [];
    var warnings = [];
    var excluded = [];
    var repaired = [];
    var summary = {
      categoryCount: 0,
      templateCount: 0,
      itemCount: 0,
      legacyTemplateCount: 0,
      databaseTemplateCount: 0,
    };
    var result = {
      valid: true,
      errors: errors,
      warnings: warnings,
      summary: summary,
      excludedTemplateIds: excluded,
      repairedTemplateIds: repaired,
    };

    context = context || {};
    var legacyCodes = {};
    list(context.legacyTemplateCodes).forEach(function (c) {
      if (trimmed(c)) legacyCodes[trimmed(c)] = true;
    });
    var legacyCategoryIds = {};
    list(context.legacyCategoryIds).forEach(function (c) {
      if (trimmed(c)) legacyCategoryIds[trimmed(c)] = true;
    });
    summary.legacyTemplateCount = Object.keys(legacyCodes).length;

    if (!db || typeof db !== "object") {
      errors.push(
        issue("DB_MISSING", "database", "INSPECTION_DATABASE", "검측 DB 전역 객체가 없습니다.")
      );
      result.valid = false;
      return result;
    }

    var categories = list(db.categories);
    var templates = list(db.templates);
    var items = list(db.items);
    var references = list(db.references);

    summary.categoryCount = categories.length;
    summary.templateCount = templates.length;
    summary.itemCount = items.length;
    summary.databaseTemplateCount = templates.length;

    /* --- 1-1. 카테고리 --- */
    var categoryIds = {};
    var categoryById = {};
    categories.forEach(function (cat, i) {
      var id = trimmed(cat && cat.id);
      if (!id) {
        errors.push(issue("CATEGORY_ID_EMPTY", "category", "index:" + i, "카테고리 id 가 비어 있습니다."));
        return;
      }
      if (categoryIds[id]) {
        errors.push(issue("CATEGORY_ID_DUPLICATE", "category", id, "카테고리 id 가 중복되었습니다."));
        return;
      }
      categoryIds[id] = true;
      categoryById[id] = cat;
      if (!trimmed(cat.name)) {
        warnings.push(issue("CATEGORY_NAME_EMPTY", "category", id, "카테고리 이름이 비어 있습니다."));
      }
      var appId = trimmed(cat.appCategoryId);
      if (!appId) {
        warnings.push(
          issue("CATEGORY_APP_ID_MISSING", "category", id,
            "appCategoryId 가 없어 '" + FALLBACK_CATEGORY_ID + "' 공종으로 처리됩니다.")
        );
      }
    });

    /* --- 1-2. 출처 참조 --- */
    var referenceIds = {};
    references.forEach(function (ref, i) {
      var id = trimmed(ref && ref.id);
      if (!id) {
        warnings.push(issue("REFERENCE_ID_EMPTY", "reference", "index:" + i, "출처 레코드에 id 가 없습니다."));
        return;
      }
      if (referenceIds[id]) {
        warnings.push(issue("REFERENCE_ID_DUPLICATE", "reference", id, "출처 id 가 중복되었습니다."));
      }
      referenceIds[id] = true;
    });

    function checkSourceIds(scope, targetId, sourceIds) {
      list(sourceIds).forEach(function (sid) {
        var id = trimmed(sid);
        if (!id) return;
        if (!referenceIds[id]) {
          warnings.push(
            issue("REFERENCE_UNKNOWN", scope, targetId,
              "존재하지 않는 출처 id 를 참조합니다: " + id)
          );
        }
      });
    }

    /* --- 1-3. 템플릿 --- */
    var templateIds = {};
    var templateCodes = {};
    templates.forEach(function (tpl, i) {
      var id = trimmed(tpl && tpl.id);
      if (!id) {
        errors.push(issue("TEMPLATE_ID_EMPTY", "template", "index:" + i, "템플릿 id 가 비어 있습니다."));
        return;
      }
      if (templateIds[id]) {
        errors.push(issue("TEMPLATE_ID_DUPLICATE", "template", id, "템플릿 id 가 중복되었습니다. 뒤에 나온 것은 제외합니다."));
        if (excluded.indexOf(id) < 0) excluded.push(id);
        return;
      }
      templateIds[id] = true;

      if (!firstText(tpl.name, tpl.subTrade, tpl.code)) {
        errors.push(issue("TEMPLATE_NAME_EMPTY", "template", id, "템플릿 이름이 비어 있습니다. 제외합니다."));
        if (excluded.indexOf(id) < 0) excluded.push(id);
      }

      var catId = trimmed(tpl.categoryId);
      if (!catId) {
        errors.push(
          issue("TEMPLATE_CATEGORY_MISSING", "template", id,
            "categoryId 가 비어 있습니다. '" + FALLBACK_CATEGORY_ID + "' 공종으로 대체합니다.")
        );
        if (repaired.indexOf(id) < 0) repaired.push(id);
      } else if (!categoryIds[catId]) {
        errors.push(
          issue("TEMPLATE_CATEGORY_NOT_FOUND", "template", id,
            "존재하지 않는 카테고리를 참조합니다(" + catId + "). '" + FALLBACK_CATEGORY_ID + "' 공종으로 대체합니다.")
        );
        if (repaired.indexOf(id) < 0) repaired.push(id);
      }

      // 앱에서 쓸 code (appCode). 기존 하드코딩 코드와 충돌하면 주입되지 않는다.
      var appCode = firstText(tpl.appCode, tpl.code);
      if (!appCode) {
        errors.push(issue("TEMPLATE_CODE_EMPTY", "template", id, "appCode/code 가 모두 비어 있습니다. 제외합니다."));
        if (excluded.indexOf(id) < 0) excluded.push(id);
      } else {
        if (templateCodes[appCode]) {
          errors.push(
            issue("TEMPLATE_CODE_DUPLICATE", "template", id,
              "DB 내부에서 appCode 가 중복되었습니다: " + appCode)
          );
          if (excluded.indexOf(id) < 0) excluded.push(id);
        }
        templateCodes[appCode] = true;
        if (legacyCodes[appCode]) {
          errors.push(
            issue("TEMPLATE_CODE_CONFLICTS_LEGACY", "template", id,
              "기존 템플릿 code 와 충돌합니다(" + appCode + "). 기존 데이터를 우선하고 이 템플릿은 제외합니다.")
          );
          if (excluded.indexOf(id) < 0) excluded.push(id);
        }
      }

      checkSourceIds("template", id, tpl.sourceIds);
    });

    /* --- 1-4. 검사항목 --- */
    var itemIds = {};
    var itemsByTemplate = {};
    items.forEach(function (it, i) {
      var id = trimmed(it && it.id);
      var tid = trimmed(it && it.templateId);

      if (!id) {
        errors.push(issue("ITEM_ID_EMPTY", "item", "index:" + i, "검사항목 id 가 비어 있습니다. 제외합니다."));
        return;
      }
      if (itemIds[id]) {
        errors.push(issue("ITEM_ID_DUPLICATE", "item", id, "검사항목 id 가 중복되었습니다. 뒤에 나온 것은 제외합니다."));
        return;
      }
      itemIds[id] = true;

      if (!tid) {
        errors.push(issue("ITEM_TEMPLATE_MISSING", "item", id, "templateId 가 비어 있습니다. 제외합니다."));
        return;
      }
      if (!templateIds[tid]) {
        errors.push(
          issue("ITEM_TEMPLATE_NOT_FOUND", "item", id,
            "존재하지 않는 템플릿을 참조합니다(" + tid + "). 제외합니다.")
        );
        return;
      }

      if (!firstText(it.title, it.sourceText)) {
        errors.push(issue("ITEM_TITLE_EMPTY", "item", id, "검사항목 문구가 비어 있습니다. 제외합니다."));
        return;
      }

      var criteria = firstText(it.criteriaText, it.criterionText);
      var declaredMissing = trimmed(it.criteriaStatus) === "missing_in_source";
      if (!criteria && !declaredMissing) {
        warnings.push(
          issue("ITEM_CRITERIA_EMPTY", "item", id,
            "검사기준이 비어 있으나 criteriaStatus 가 missing_in_source 로 표시되지 않았습니다.")
        );
      }

      checkSourceIds("item", id, it.sourceIds);

      if (!itemsByTemplate[tid]) itemsByTemplate[tid] = [];
      itemsByTemplate[tid].push(it);
    });

    /* --- 1-5. 템플릿별 순번 / 빈 템플릿 / 과다중복 --- */
    Object.keys(templateIds).forEach(function (tid) {
      var own = itemsByTemplate[tid] || [];
      if (own.length === 0) {
        errors.push(issue("TEMPLATE_NO_ITEMS", "template", tid, "검사항목이 0건입니다. 제외합니다."));
        if (excluded.indexOf(tid) < 0) excluded.push(tid);
        return;
      }

      var seen = {};
      var numbers = [];
      own.forEach(function (it) {
        var n = Number(it.sequence);
        if (!isFinite(n) || n <= 0) {
          warnings.push(
            issue("SEQUENCE_MISSING", "item", trimmed(it.id),
              "순번이 없거나 잘못되었습니다. 목록 순서대로 다시 매깁니다.")
          );
          return;
        }
        if (seen[n]) {
          warnings.push(
            issue("SEQUENCE_DUPLICATE", "item", trimmed(it.id),
              "템플릿 " + tid + " 안에서 순번 " + n + " 이 중복되었습니다.")
          );
        }
        seen[n] = true;
        numbers.push(n);
      });

      if (numbers.length) {
        numbers.sort(function (a, b) { return a - b; });
        var expected = 1;
        var gaps = [];
        for (var k = 0; k < numbers.length; k += 1) {
          while (expected < numbers[k]) {
            gaps.push(expected);
            expected += 1;
          }
          if (expected === numbers[k]) expected += 1;
        }
        if (gaps.length) {
          warnings.push(
            issue("SEQUENCE_GAP", "template", tid,
              "순번이 비어 있습니다: " + gaps.join(", "))
          );
        }
      }

      var textCount = {};
      own.forEach(function (it) {
        var key = firstText(it.title, it.sourceText);
        if (!key) return;
        textCount[key] = (textCount[key] || 0) + 1;
      });
      Object.keys(textCount).forEach(function (key) {
        if (textCount[key] > DUPLICATE_ITEM_TEXT_LIMIT) {
          warnings.push(
            issue("ITEM_TEXT_REPEATED", "template", tid,
              '"' + key + '" 이 ' + textCount[key] + "회 반복됩니다. 추출 오류일 수 있습니다.")
          );
        }
      });
    });

    result.valid = errors.length === 0;
    return result;
  }

  /* ==================== 2. 표준 구조 정규화 ==================== */

  /** 표준 검사항목 하나. 모든 필드가 항상 존재하고, 없으면 빈 문자열이다. */
  function makeStandardItem(fields) {
    return {
      id: str(fields.id),
      sequence: isFinite(Number(fields.sequence)) && Number(fields.sequence) > 0
        ? Number(fields.sequence)
        : 0,
      inspectionItem: str(fields.inspectionItem),
      inspectionCriteria: str(fields.inspectionCriteria),
      inspectionMethod: str(fields.inspectionMethod),
      reference: str(fields.reference),
      timing: str(fields.timing),
      responsibleParty: str(fields.responsibleParty),
      requiredEvidence: str(fields.requiredEvidence),
      notes: str(fields.notes),
    };
  }

  /** 표준 템플릿 하나. items 는 항상 배열이다. */
  function makeStandardTemplate(fields) {
    return {
      id: str(fields.id),
      categoryId: str(fields.categoryId),
      categoryName: str(fields.categoryName),
      templateName: str(fields.templateName),
      subCategory: str(fields.subCategory),
      sourceType: fields.sourceType === "database" ? "database" : "legacy",
      sourceFile: str(fields.sourceFile),
      inspectionStage: str(fields.inspectionStage),
      items: list(fields.items),
    };
  }

  /**
   * 기존 하드코딩 템플릿 → 표준 구조.
   * 원본 객체는 절대 변형하지 않는다. 읽기만 한다.
   *
   * @param {object} tpl        SUB_WORK_TEMPLATES 원소
   * @param {function} nameOf   categoryId → 공종명 조회 함수 (선택)
   */
  function normalizeLegacyTemplate(tpl, nameOf) {
    return guard("기존 템플릿 정규화", makeStandardTemplate({ sourceType: "legacy" }), function () {
      if (!tpl || typeof tpl !== "object") {
        return makeStandardTemplate({ sourceType: "legacy" });
      }
      var code = firstText(tpl.code);
      var categoryId = firstText(tpl.category);
      return makeStandardTemplate({
        id: code,
        categoryId: categoryId,
        categoryName: typeof nameOf === "function" ? str(nameOf(categoryId)) : "",
        templateName: firstText(tpl.name, code),
        subCategory: "",
        sourceType: "legacy",
        sourceFile: LEGACY_SOURCE_FILE,
        inspectionStage: "",
        items: list(tpl.items).map(function (it, i) {
          return makeStandardItem({
            id: code ? code + "-" + String(i + 1).padStart(2, "0") : "legacy-" + (i + 1),
            sequence: i + 1,
            inspectionItem: firstText(it && it.item),
            inspectionCriteria: firstText(it && it.standard),
            inspectionMethod: "",
            reference: "",
            timing: "",
            responsibleParty: "",
            requiredEvidence: "",
            notes: "",
          });
        }),
      });
    });
  }

  /** requiresPhoto 등 불리언 플래그 → 필요 증빙 문구. 원문에 없는 말을 만들지 않는다. */
  function evidenceFromFlags(it) {
    var out = [];
    if (it && it.requiresPhoto) out.push("사진");
    if (it && it.requiresMeasurement) out.push("측정값");
    if (it && it.requiresAttachment) out.push("첨부자료");
    return out.join(", ");
  }

  /**
   * DB 검사항목 → 표준 검사항목.
   *
   * inspectionMethod 는 원문(hwp/xls)에서 검사기준과 분리되어 있지 않으므로
   * 빈 문자열이다. 추측해서 채우지 않는다.
   * reference 도 원문에 도면번호/시방번호가 없으면 빈 문자열이다.
   */
  function normalizeDatabaseItem(it, seqFallback, tpl) {
    var missing = trimmed(it && it.criteriaStatus) === "missing_in_source";
    return makeStandardItem({
      id: firstText(it && it.id),
      sequence: isFinite(Number(it && it.sequence)) && Number(it.sequence) > 0
        ? Number(it.sequence)
        : seqFallback,
      inspectionItem: firstText(it && it.title, it && it.sourceText),
      // 원문에 기준이 없으면 빈 문자열. 절대 만들어 넣지 않는다.
      inspectionCriteria: missing ? "" : firstText(it && it.criteriaText, it && it.criterionText),
      inspectionMethod: firstText(it && it.inspectionMethod, it && it.method),
      reference: firstText(
        [trimmed(it && it.referenceCode), trimmed(it && it.referenceSection)]
          .filter(Boolean)
          .join(" ")
      ),
      timing: firstText(it && it.timing, tpl && tpl.defaultTiming),
      responsibleParty: firstText(it && it.responsibleParty),
      requiredEvidence: evidenceFromFlags(it),
      notes: firstText(it && it.notes),
    });
  }

  /**
   * DB 템플릿 → 표준 구조.
   *
   * @param {object} tpl      INSPECTION_DATABASE.templates 원소
   * @param {Array}  dbItems  이 템플릿에 속한 DB 검사항목 (정렬된 상태)
   * @param {object} options  { categoryName, categoryId, sourceFile }
   */
  function normalizeDatabaseTemplate(tpl, dbItems, options) {
    return guard("DB 템플릿 정규화", makeStandardTemplate({ sourceType: "database" }), function () {
      if (!tpl || typeof tpl !== "object") {
        return makeStandardTemplate({ sourceType: "database" });
      }
      options = options || {};
      return makeStandardTemplate({
        id: firstText(tpl.appCode, tpl.code, tpl.id),
        categoryId: firstText(options.categoryId, tpl.appCategoryId, FALLBACK_CATEGORY_ID),
        categoryName: firstText(options.categoryName, tpl.originalCategoryName),
        templateName: firstText(tpl.name, tpl.subTrade, tpl.code),
        subCategory: firstText(tpl.subTrade),
        sourceType: "database",
        sourceFile: firstText(options.sourceFile),
        inspectionStage: firstText(tpl.workStage),
        items: list(dbItems).map(function (it, i) {
          return normalizeDatabaseItem(it, i + 1, tpl);
        }),
      });
    });
  }

  /* ==================== 3. 초기화 ==================== */

  var DB = global.INSPECTION_DATABASE;

  var hasLegacy =
    typeof WORK_CATEGORIES !== "undefined" && typeof SUB_WORK_TEMPLATES !== "undefined";

  /** 주입 전 기존 데이터의 스냅샷. legacy / database 구분의 기준이 된다. */
  var legacyCategorySnapshot = hasLegacy
    ? WORK_CATEGORIES.map(function (c) { return { id: str(c && c.id), name: str(c && c.name) }; })
    : [];
  var legacyTemplateSnapshot = hasLegacy ? SUB_WORK_TEMPLATES.slice() : [];
  var legacyCodeSet = {};
  legacyTemplateSnapshot.forEach(function (t) {
    if (t && trimmed(t.code)) legacyCodeSet[trimmed(t.code)] = true;
  });

  /* --- 3-1. 검증 먼저 --- */
  var validation = guard("DB 검증", {
    valid: false,
    errors: [issue("VALIDATION_CRASHED", "database", "-", "검증 중 예외가 발생했습니다.")],
    warnings: [],
    summary: {
      categoryCount: 0, templateCount: 0, itemCount: 0,
      legacyTemplateCount: legacyTemplateSnapshot.length, databaseTemplateCount: 0,
    },
    excludedTemplateIds: [],
    repairedTemplateIds: [],
  }, function () {
    return validateDatabase(DB, {
      legacyTemplateCodes: Object.keys(legacyCodeSet),
      legacyCategoryIds: legacyCategorySnapshot.map(function (c) { return c.id; }),
    });
  });

  var excludedSet = {};
  list(validation.excludedTemplateIds).forEach(function (id) { excludedSet[id] = true; });

  /* --- 3-2. DB 인덱스 구성 --- */
  var dbCategories = DB ? list(DB.categories) : [];
  var dbTemplates = DB ? list(DB.templates) : [];
  var dbItems = DB ? list(DB.items) : [];
  var dbReferences = DB ? list(DB.references) : [];
  var dbSourceFiles = DB ? list(DB.sourceFiles) : [];

  var referenceById = {};
  dbReferences.forEach(function (r) {
    if (r && trimmed(r.id)) referenceById[trimmed(r.id)] = r;
  });
  var sourceFileById = {};
  dbSourceFiles.forEach(function (f) {
    if (f && trimmed(f.id)) sourceFileById[trimmed(f.id)] = f;
  });
  var dbCategoryById = {};
  dbCategories.forEach(function (c) {
    if (c && trimmed(c.id)) dbCategoryById[trimmed(c.id)] = c;
  });

  /** 템플릿 id → 검사항목 배열 (id 중복/빈 항목 제거 후 순번 정렬) */
  var itemsByTemplateId = {};
  var seenItemIds = {};
  dbItems.forEach(function (it) {
    if (!it) return;
    var id = trimmed(it.id);
    var tid = trimmed(it.templateId);
    if (!id || !tid) return;                       // 검증에서 이미 오류로 보고됨
    if (seenItemIds[id]) return;                   // 중복 id 는 먼저 나온 것만
    if (!firstText(it.title, it.sourceText)) return; // 문구 없는 항목은 제외
    seenItemIds[id] = true;
    if (!itemsByTemplateId[tid]) itemsByTemplateId[tid] = [];
    itemsByTemplateId[tid].push(it);
  });
  Object.keys(itemsByTemplateId).forEach(function (k) {
    itemsByTemplateId[k].sort(function (a, b) {
      var an = Number(a.sequence), bn = Number(b.sequence);
      if (!isFinite(an)) an = Number.MAX_SAFE_INTEGER;
      if (!isFinite(bn)) bn = Number.MAX_SAFE_INTEGER;
      return an - bn;
    });
  });

  /** 템플릿의 sourceIds → 원본 파일명 */
  function sourceFileNameFor(tpl) {
    var ids = list(tpl && tpl.sourceIds);
    for (var i = 0; i < ids.length; i += 1) {
      var ref = referenceById[trimmed(ids[i])];
      if (ref && trimmed(ref.fileName)) return trimmed(ref.fileName);
      if (ref && sourceFileById[trimmed(ref.sourceFileId)]) {
        return trimmed(sourceFileById[trimmed(ref.sourceFileId)].fileName);
      }
    }
    return "";
  }

  /** 앱 공종 id → 공종명 (기존 WORK_CATEGORIES 우선, 없으면 DB 카테고리명) */
  function appCategoryName(appId) {
    var id = trimmed(appId);
    if (!id) return "";
    var found = null;
    if (hasLegacy) {
      found = WORK_CATEGORIES.find(function (c) { return c && c.id === id; });
    }
    if (found) return str(found.name);
    var keys = Object.keys(dbCategoryById);
    for (var i = 0; i < keys.length; i += 1) {
      var cat = dbCategoryById[keys[i]];
      if (trimmed(cat.appCategoryId) === id) return str(cat.name);
    }
    return "";
  }

  /* --- 3-3. 기존 배열에 DB 데이터 주입 (app.js 호환 유지) --- */

  var addedCategories = 0;
  var addedTemplates = 0;
  var skippedTemplates = [];
  var injectedCodes = [];
  var itemsByCode = {};
  var templateMetaByCode = {};

  /**
   * DB 검사항목 → 기존 앱의 items 원소 형식 { item, standard, ... }.
   * 기존 app.js 의 loadTemplateItemsIntoChecklist() 가 이 형식을 읽는다.
   * 표준 구조와 별개로 유지해야 저장 데이터 호환이 깨지지 않는다.
   */
  function toAppItem(it) {
    var missing = trimmed(it.criteriaStatus) === "missing_in_source";
    return {
      // --- 기존 앱이 요구하는 필드 ---
      item: firstText(it.title, it.sourceText),
      standard: missing ? "" : firstText(it.criteriaText, it.criterionText),

      // --- DB 추적용 추가 필드 ---
      dbItemId: trimmed(it.id) || null,
      dbTemplateId: trimmed(it.templateId) || null,
      criteriaText: missing ? null : (firstText(it.criteriaText, it.criterionText) || null),
      criteriaStatus: firstText(it.criteriaStatus) || "present",
      verificationStatus: firstText(it.appVerificationStatus) || "unverified",
      dbVerificationStatus: firstText(it.verificationStatus) || null,
      referenceType: firstText(it.referenceType) || null,
      valueType: firstText(it.valueType) || null,
      unit: firstText(it.unit) || null,
      operator: firstText(it.operator) || null,
      targetValue: it.targetValue === undefined ? null : it.targetValue,
      minValue: it.minValue === undefined ? null : it.minValue,
      maxValue: it.maxValue === undefined ? null : it.maxValue,
      requiresPhoto: !!it.requiresPhoto,
      requiresMeasurement: !!it.requiresMeasurement,
      isHoldPoint: !!it.isHoldPoint,
      isWitnessPoint: !!it.isWitnessPoint,
      sourceIds: list(it.sourceIds).slice(),
      sourceText: firstText(it.sourceText) || null,
      dbNotes: firstText(it.notes) || null,
    };
  }

  if (hasLegacy && DB) {
    guard("DB 데이터 주입", null, function () {
      var existingCategoryIds = {};
      WORK_CATEGORIES.forEach(function (c) {
        if (c && trimmed(c.id)) existingCategoryIds[trimmed(c.id)] = true;
      });

      // (a) 공종: 기존 id 를 재사용하고, 기존에 없는 것만 새로 만든다.
      dbCategories.forEach(function (cat) {
        if (!cat) return;
        var appId = firstText(cat.appCategoryId, FALLBACK_CATEGORY_ID);
        if (existingCategoryIds[appId]) return;
        var dupName = WORK_CATEGORIES.some(function (c) { return c && c.name === cat.name; });
        if (dupName) {
          // 이름은 같은데 id 가 다르다. 새로 만들면 선택박스에 같은 이름이 두 번 뜬다.
          console.warn(
            "[검측DB] 공종 '" + str(cat.name) + "' 은 이름이 같은 기존 공종이 있어 새로 만들지 않습니다. " +
            "이 카테고리의 템플릿은 appCategoryId 매핑을 확인해야 합니다."
          );
          return;
        }
        WORK_CATEGORIES.push({ id: appId, name: str(cat.name) });
        existingCategoryIds[appId] = true;
        addedCategories += 1;
      });

      // (b) 세부공종 템플릿
      var existingCodes = {};
      SUB_WORK_TEMPLATES.forEach(function (t) {
        if (t && trimmed(t.code)) existingCodes[trimmed(t.code)] = true;
      });

      dbTemplates.forEach(function (tpl) {
        if (!tpl) return;
        var tplId = trimmed(tpl.id);
        var code = firstText(tpl.appCode, tpl.code);
        if (!code) return;

        if (excludedSet[tplId]) {
          skippedTemplates.push({ code: code, id: tplId, reason: "검증 오류로 제외" });
          return;
        }
        if (existingCodes[code]) {
          skippedTemplates.push({ code: code, id: tplId, reason: "기존 code 와 충돌" });
          return;
        }

        var own = itemsByTemplateId[tplId] || [];
        if (own.length === 0) {
          skippedTemplates.push({ code: code, id: tplId, reason: "검사항목 0건" });
          return;
        }

        var appCategoryId = firstText(tpl.appCategoryId, FALLBACK_CATEGORY_ID);
        if (!existingCategoryIds[appCategoryId]) appCategoryId = FALLBACK_CATEGORY_ID;

        SUB_WORK_TEMPLATES.push({
          // --- 기존 앱이 요구하는 필드 ---
          code: code,
          name: firstText(tpl.name, tpl.subTrade, code),
          category: appCategoryId,
          items: own.map(toAppItem),

          // --- DB 추적용 추가 필드 ---
          dbTemplateId: tplId,
          templateSource: DB_TEMPLATE_SOURCE,
          verificationStatus: trimmed(tpl.verificationStatus) === "verified" ? "verified" : "unverified",
          dbVerificationStatus: firstText(tpl.verificationStatus) || null,
          formIssues: list(tpl.formIssues).slice(),
          originalCategoryName: firstText(tpl.originalCategoryName) || null,
          dbNotes: firstText(tpl.notes) || null,
          sourceIds: list(tpl.sourceIds).slice(),
        });

        existingCodes[code] = true;
        addedTemplates += 1;
        injectedCodes.push(code);
        itemsByCode[code] = own.length;
        templateMetaByCode[code] = {
          dbTemplateId: tplId,
          formIssues: list(tpl.formIssues).slice(),
          verificationStatus: "unverified",
          missingCriteria: own.filter(function (i) {
            return trimmed(i.criteriaStatus) === "missing_in_source";
          }).length,
        };
      });
    });
  } else if (!hasLegacy) {
    console.error(
      "[검측DB] inspectionTemplates.js 가 먼저 로딩되지 않았습니다. " +
      "index.html 의 스크립트 순서를 확인하세요."
    );
  }

  /* --- 3-4. 표준 구조 레지스트리 --- */

  var standardTemplates = [];
  var standardById = {};

  guard("표준 템플릿 구성", null, function () {
    // 기존 템플릿 (주입 전 스냅샷 기준이라 DB 템플릿이 섞이지 않는다)
    legacyTemplateSnapshot.forEach(function (tpl) {
      var normalized = normalizeLegacyTemplate(tpl, appCategoryName);
      if (!normalized.id) return;
      standardTemplates.push(normalized);
      standardById[normalized.id] = normalized;
    });

    // DB 템플릿 (실제로 주입된 것만 노출한다. 제외된 것은 앱에서도 보이지 않는다)
    var injectedSet = {};
    injectedCodes.forEach(function (c) { injectedSet[c] = true; });

    dbTemplates.forEach(function (tpl) {
      if (!tpl) return;
      var code = firstText(tpl.appCode, tpl.code);
      if (!code || !injectedSet[code]) return;
      var tplId = trimmed(tpl.id);
      var appCategoryId = firstText(tpl.appCategoryId, FALLBACK_CATEGORY_ID);
      if (!appCategoryName(appCategoryId)) appCategoryId = FALLBACK_CATEGORY_ID;

      var normalized = normalizeDatabaseTemplate(tpl, itemsByTemplateId[tplId] || [], {
        categoryId: appCategoryId,
        categoryName: appCategoryName(appCategoryId),
        sourceFile: sourceFileNameFor(tpl),
      });
      if (!normalized.id) return;
      if (standardById[normalized.id]) return; // 있을 수 없지만 방어
      standardTemplates.push(normalized);
      standardById[normalized.id] = normalized;
    });
  });

  /** 표준 카테고리 목록. 기존 18개 순서를 유지하고, 주입으로 늘어난 것을 뒤에 붙인다. */
  function buildCategories() {
    var source = hasLegacy ? WORK_CATEGORIES : legacyCategorySnapshot;
    var counts = {};
    standardTemplates.forEach(function (t) {
      counts[t.categoryId] = (counts[t.categoryId] || 0) + 1;
    });
    return source.map(function (c) {
      var id = str(c && c.id);
      return { id: id, name: str(c && c.name), templateCount: counts[id] || 0 };
    });
  }

  /* ==================== 4. 공개 API ==================== */

  var statistics = {
    categoryCount: 0,
    templateCount: 0,
    itemCount: 0,
    legacyTemplateCount: 0,
    databaseTemplateCount: 0,
    legacyItemCount: 0,
    databaseItemCount: 0,
    errorCount: list(validation.errors).length,
    warningCount: list(validation.warnings).length,
    excludedTemplateCount: list(validation.excludedTemplateIds).length,
    repairedTemplateCount: list(validation.repairedTemplateIds).length,
    skippedTemplates: skippedTemplates,
    addedCategories: addedCategories,
    missingCriteriaItemCount: 0,
    inputDigest: (DB && DB.meta && DB.meta.inputDigest) || null,
    generatedAt: (DB && DB.meta && DB.meta.generatedAt) || null,
  };

  guard("통계 집계", null, function () {
    statistics.categoryCount = buildCategories().length;
    statistics.templateCount = standardTemplates.length;
    standardTemplates.forEach(function (t) {
      var n = t.items.length;
      statistics.itemCount += n;
      if (t.sourceType === "database") {
        statistics.databaseTemplateCount += 1;
        statistics.databaseItemCount += n;
      } else {
        statistics.legacyTemplateCount += 1;
        statistics.legacyItemCount += n;
      }
    });
    statistics.missingCriteriaItemCount = dbItems.filter(function (i) {
      return i && trimmed(i.criteriaStatus) === "missing_in_source";
    }).length;
  });

  var api = {
    /** 어댑터가 DB 템플릿을 하나라도 주입했는가 */
    available: addedTemplates > 0,
    /** 주입하지 못한 이유 (available === false 일 때만 의미 있음) */
    reason: null,

    /* ---- 조회 ---- */

    /** 표준 카테고리 목록 [{id, name, templateCount}] */
    getAllCategories: function () {
      return guard("getAllCategories", [], function () {
        return buildCategories();
      });
    },

    /** 표준 템플릿 전체. 출처(legacy/database)와 무관하게 같은 구조다. */
    getAllTemplates: function () {
      return guard("getAllTemplates", [], function () {
        return standardTemplates.slice();
      });
    },

    /** 공종 id 로 표준 템플릿 필터. 없는 공종이면 빈 배열. */
    getTemplatesByCategory: function (categoryId) {
      return guard("getTemplatesByCategory", [], function () {
        var id = trimmed(categoryId);
        if (!id) return [];
        return standardTemplates.filter(function (t) { return t.categoryId === id; });
      });
    },

    /** 표준 템플릿 단건. 없으면 null. */
    getTemplateById: function (templateId) {
      return guard("getTemplateById", null, function () {
        var id = trimmed(templateId);
        if (!id) return null;
        return standardById[id] || null;
      });
    },

    /**
     * 기존 app.js 가 쓰는 형식({code, name, category, items:[{item, standard, ...}]})
     * 그대로의 템플릿. 체크리스트 행 생성에 쓴다. 저장 데이터 호환을 위해 유지한다.
     */
    getAppTemplate: function (code) {
      return guard("getAppTemplate", null, function () {
        var c = trimmed(code);
        if (!c) return null;
        if (typeof getSubWorkTemplate === "function") return getSubWorkTemplate(c);
        if (!hasLegacy) return null;
        return SUB_WORK_TEMPLATES.find(function (t) { return t && t.code === c; }) || null;
      });
    },

    /* ---- 검증 / 통계 ---- */

    /**
     * DB 검증. 인자를 주지 않으면 로딩 시점에 계산된 결과를 그대로 돌려준다.
     * 다른 데이터를 검사하고 싶으면 db 를 넘긴다.
     *
     * summary 의 의미가 두 경로에서 다르다.
     *   인자 없음: 앱이 실제로 쓰는 전체 수치 (기존 + DB 합계)
     *   db 지정  : 넘긴 db 자체의 수치 (기존 템플릿 수는 context 에서만 옴)
     */
    validateDatabase: function (db, context) {
      if (db === undefined) {
        return {
          valid: validation.valid,
          errors: list(validation.errors).slice(),
          warnings: list(validation.warnings).slice(),
          summary: {
            categoryCount: statistics.categoryCount,
            templateCount: statistics.templateCount,
            itemCount: statistics.itemCount,
            legacyTemplateCount: statistics.legacyTemplateCount,
            databaseTemplateCount: statistics.databaseTemplateCount,
          },
          excludedTemplateIds: list(validation.excludedTemplateIds).slice(),
          repairedTemplateIds: list(validation.repairedTemplateIds).slice(),
        };
      }
      return guard("validateDatabase", {
        valid: false,
        errors: [issue("VALIDATION_CRASHED", "database", "-", "검증 중 예외가 발생했습니다.")],
        warnings: [],
        summary: {
          categoryCount: 0, templateCount: 0, itemCount: 0,
          legacyTemplateCount: 0, databaseTemplateCount: 0,
        },
        excludedTemplateIds: [],
        repairedTemplateIds: [],
      }, function () {
        return validateDatabase(db, context);
      });
    },

    /** 통계 스냅샷 */
    getStatistics: function () {
      return guard("getStatistics", {}, function () {
        var copy = {};
        Object.keys(statistics).forEach(function (k) { copy[k] = statistics[k]; });
        return copy;
      });
    },

    /* ---- 출처 ---- */

    /**
     * 표준 템플릿 id 또는 출처 id 로 원본 정보를 찾는다.
     * 템플릿 id 를 주면 { sourceType, sourceFile, references: [...] } 를 돌려준다.
     * 출처 id 를 주면 해당 출처 레코드 하나를 돌려준다. 없으면 null.
     */
    getSourceInformation: function (idOrTemplateId) {
      return guard("getSourceInformation", null, function () {
        var id = trimmed(idOrTemplateId);
        if (!id) return null;
        if (referenceById[id]) return referenceById[id];

        var tpl = standardById[id];
        if (!tpl) return null;
        if (tpl.sourceType === "legacy") {
          return {
            sourceType: "legacy",
            sourceFile: tpl.sourceFile,
            references: [],
            note: "기존 하드코딩 템플릿입니다. 원본 문서 출처가 없습니다.",
          };
        }
        var raw = dbTemplates.find(function (t) {
          return t && firstText(t.appCode, t.code) === id;
        });
        var refs = list(raw && raw.sourceIds)
          .map(function (sid) { return referenceById[trimmed(sid)]; })
          .filter(Boolean);
        return {
          sourceType: "database",
          sourceFile: tpl.sourceFile,
          references: refs,
          note: "자동 추출 데이터입니다. 최신 기준과 대조되지 않았습니다(미검증).",
        };
      });
    },

    /** 출처 id 로 레코드 조회. 없으면 null. */
    getSourceReference: function (sourceId) {
      return guard("getSourceReference", null, function () {
        var id = trimmed(sourceId);
        if (!id) return null;
        return referenceById[id] || null;
      });
    },

    /** 출처 id 배열 → 원문 텍스트 배열 */
    getSourceTexts: function (sourceIds) {
      return guard("getSourceTexts", [], function () {
        return list(sourceIds)
          .map(function (id) { return referenceById[trimmed(id)]; })
          .filter(Boolean)
          .map(function (r) { return str(r.sourceText); });
      });
    },

    /** 템플릿 id 가 DB 출처인지 */
    isDatabaseTemplate: function (id) {
      return guard("isDatabaseTemplate", false, function () {
        var t = standardById[trimmed(id)];
        return !!t && t.sourceType === "database";
      });
    },

    /** 주입된 DB 템플릿의 서식 결함/검증상태 메타 */
    getTemplateMeta: function (code) {
      return guard("getTemplateMeta", null, function () {
        var c = trimmed(code);
        if (!c) return null;
        return templateMetaByCode[c] || null;
      });
    },

    /* ---- 정규화 함수 노출 (테스트/재사용용) ---- */
    normalizeLegacyTemplate: function (tpl) {
      return normalizeLegacyTemplate(tpl, appCategoryName);
    },
    normalizeDatabaseTemplate: function (tpl, items, options) {
      return normalizeDatabaseTemplate(tpl, items, options);
    },

    /* ---- 브라우저 콘솔용 자체 점검 ---- */

    /**
     * 콘솔에서 바로 돌려보는 점검 함수.
     *   InspectionDataAdapter.runSelfTest()
     * localStorage 를 읽거나 쓰지 않는다.
     */
    runSelfTest: function () {
      return guard("runSelfTest", null, function () {
        var v = api.validateDatabase();
        var s = api.getStatistics();
        var cats = api.getAllCategories();
        var tpls = api.getAllTemplates();

        var problems = [];
        if (!hasLegacy) problems.push("기존 inspectionTemplates.js 미로딩");
        if (!DB) problems.push("inspectionDatabase.generated.js 미로딩");
        if (cats.length === 0) problems.push("카테고리 0건");
        if (tpls.length === 0) problems.push("템플릿 0건");
        tpls.forEach(function (t) {
          if (!t.id) problems.push("id 없는 템플릿");
          if (!Array.isArray(t.items)) problems.push(t.id + ": items 가 배열이 아님");
          if (t.items.length === 0) problems.push(t.id + ": 검사항목 0건");
          t.items.forEach(function (it) {
            if (!it.inspectionItem) problems.push(t.id + ": 문구 없는 검사항목");
          });
        });

        console.group("[검측DB] 자체 점검");
        console.info("카테고리 " + cats.length + "건");
        console.info(
          "템플릿 " + s.templateCount + "건 (기존 " + s.legacyTemplateCount +
          " + DB " + s.databaseTemplateCount + ")"
        );
        console.info(
          "검사항목 " + s.itemCount + "건 (기존 " + s.legacyItemCount +
          " + DB " + s.databaseItemCount + ")"
        );
        console.info("검증: 오류 " + v.errors.length + "건 / 경고 " + v.warnings.length + "건");
        if (v.errors.length) console.error("오류", v.errors);
        if (v.warnings.length) console.warn("경고", v.warnings);
        if (s.excludedTemplateCount) console.warn("제외된 템플릿", v.excludedTemplateIds);
        if (s.repairedTemplateCount) console.warn("자동 보정된 템플릿", v.repairedTemplateIds);
        if (skippedTemplates.length) console.warn("주입하지 않은 템플릿", skippedTemplates);
        if (problems.length) console.error("구조 문제", problems);
        else console.info("구조 문제 없음");
        console.groupEnd();

        return { ok: problems.length === 0, problems: problems, validation: v, statistics: s };
      });
    },
  };

  if (!DB) {
    api.reason = "INSPECTION_DATABASE 가 없습니다. inspectionDatabase.generated.js 로딩 실패.";
  } else if (!hasLegacy) {
    api.reason = "기존 inspectionTemplates.js 가 먼저 로딩되지 않았습니다.";
  } else if (addedTemplates === 0) {
    api.reason = "주입할 DB 템플릿이 없습니다.";
  }

  global.InspectionDataAdapter = api;
  global.__GUMCHEUK_INSPECTION_ADAPTER_INITIALIZED__ = true;

  /**
   * 하위호환. 1차 연동 때 만들어진 이름이다.
   * test-inspection-data.html 등 기존 호출부가 깨지지 않도록 유지한다.
   */
  global.INSPECTION_DB_ADAPTER = {
    available: api.available,
    reason: api.reason,
    templateCodes: injectedCodes.slice(),
    itemsByCode: itemsByCode,
    templateMetaByCode: templateMetaByCode,
    stats: {
      addedCategories: addedCategories,
      addedTemplates: addedTemplates,
      addedItems: statistics.databaseItemCount,
      skipped: skippedTemplates,
      missingCriteriaItems: statistics.missingCriteriaItemCount,
      inputDigest: statistics.inputDigest,
    },
    getSourceReference: api.getSourceReference,
    getSourceTexts: api.getSourceTexts,
    getTemplateMeta: api.getTemplateMeta,
    isDatabaseTemplate: function (code) {
      return !!templateMetaByCode[trimmed(code)];
    },
  };

  /* ==================== 5. 로딩 요약 로그 ==================== */

  guard("로딩 로그", null, function () {
    console.info(
      "[검측DB] 공종 " + statistics.categoryCount +
      ", 템플릿 " + statistics.templateCount +
      " (기존 " + statistics.legacyTemplateCount + " + DB " + statistics.databaseTemplateCount + ")" +
      ", 검사항목 " + statistics.itemCount +
      " — DB 항목은 전부 미검증(unverified)" +
      (statistics.missingCriteriaItemCount
        ? ", 기준누락 " + statistics.missingCriteriaItemCount + "건"
        : "")
    );
    if (validation.errors.length) {
      console.error("[검측DB] 검증 오류 " + validation.errors.length + "건", validation.errors);
    }
    if (validation.warnings.length) {
      console.warn("[검측DB] 검증 경고 " + validation.warnings.length + "건", validation.warnings);
    }
    if (validation.excludedTemplateIds.length) {
      console.warn("[검측DB] 제외된 템플릿", validation.excludedTemplateIds);
    }
    if (validation.repairedTemplateIds.length) {
      console.warn("[검측DB] 자동 보정된 템플릿(공종 대체)", validation.repairedTemplateIds);
    }
    if (skippedTemplates.length) {
      console.warn("[검측DB] 주입하지 않은 템플릿", skippedTemplates);
    }
    if (api.reason) {
      console.warn("[검측DB] " + api.reason + " 기존 템플릿만 사용합니다.");
    }
  });

  /* Node 환경(스모크 테스트)에서도 검증 함수를 쓸 수 있게 한다. */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { InspectionDataAdapter: api, validateDatabase: validateDatabase };
  }
})(typeof window !== "undefined" ? window : globalThis);
