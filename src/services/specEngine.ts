import type { SpecIndexItem, SpecNode } from '../types/spec'

let cachedIndex: SpecIndexItem[] | null = null
const cachedDetails: Record<string, SpecNode> = {}

/**
 * Normalizes relative BASE_URL in sub-path environments (e.g. GitHub Pages)
 */
function getCleanBaseUrl(): string {
  let base = import.meta.env.BASE_URL || '/'
  if (base === './' || base === '.') {
    const pathParts = window.location.pathname.split('/')
    const lastPart = pathParts[pathParts.length - 1]
    if (lastPart.includes('.')) {
      base = pathParts.slice(0, -1).join('/') + '/'
    } else {
      base = pathParts.join('/')
      if (!base.endsWith('/')) base += '/'
    }
  }
  return base
}

/**
 * Normalizes code and text by removing whitespaces, hyphens, and converting to lowercase
 */
export function normalizeCodeOrText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[\s\-_]/g, '')
}

/**
 * Fetch the base spec index from public directory
 */
export async function getSpecIndex(): Promise<SpecIndexItem[]> {
  if (cachedIndex) return cachedIndex

  const baseUrl = getCleanBaseUrl()
  const res = await fetch(`${baseUrl}data/specs/index.json`)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = await res.json()
  cachedIndex = data
  return data
}

/**
 * Fetch detailed spec node by its code (e.g. "KCS 14 20 10")
 */
export async function getSpecDetail(code: string): Promise<SpecNode | null> {
  const normalizedCode = code.replace(/\s+/g, '_')
  if (cachedDetails[normalizedCode]) {
    return cachedDetails[normalizedCode]
  }

  const baseUrl = getCleanBaseUrl()
  const res = await fetch(`${baseUrl}data/specs/${normalizedCode}.json`)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  const data = (await res.json()) as SpecNode
  cachedDetails[normalizedCode] = data
  return data
}

/**
 * Normalizes query and specs to search code, title, keywords, summary, and checkpoints
 */
export async function searchSpecs(query: string): Promise<SpecIndexItem[]> {
  const index = await getSpecIndex()
  const trimmed = query.trim()

  if (!trimmed) return index

  // Tokenize search query (e.g., "KCS 14-20" -> ["kcs", "1420"])
  const normalizedTokens = trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeCodeOrText)

  return index.filter((item) => {
    const normCode = normalizeCodeOrText(item.code)
    const normTitle = normalizeCodeOrText(item.title)
    const normKeywords = (item.keywords || []).map(normalizeCodeOrText).join(' ')
    const normSummary = normalizeCodeOrText(item.summary || '')
    const normCheckpoints = (item.checkpoints || []).map(normalizeCodeOrText).join(' ')

    const combinedSearchSpace = `${normCode} ${normTitle} ${normKeywords} ${normSummary} ${normCheckpoints}`

    // All search tokens must be matched
    return normalizedTokens.every((token) => combinedSearchSpace.includes(token))
  })
}

/**
 * Model name configuration.
 * Resolves VITE_GEMINI_MODEL from environment variables, defaults to 'gemini-2.5-flash'
 */
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash'

/**
 * Perform AI summarization based STRICTLY on selected SpecNode contents.
 * No speculative answers or external data retrieval.
 */
export async function summarizeWithAI(node: SpecNode, apiKey?: string): Promise<string> {
  if (!node) return '선택된 건설기준이 없습니다.'

  const checkpointsText = (node.checkpoints || [])
    .map(cp => `- [${cp.category}] ${cp.item}: ${cp.criteria} ${cp.testMethod ? `(시험법: ${cp.testMethod})` : ''}`)
    .join('\n')

  const docContext = `
[제공된 기준 자료]
- 기준 코드: ${node.code}
- 기준명: ${node.title}
- 개정일: ${node.revisionDate}
- 공식 출처 URL: ${node.originalUrl}
- 세부 조항 발췌문:
${checkpointsText}
`

  // 1. Fallback Guide: If API Key is missing
  if (!apiKey) {
    const listItems = (node.checkpoints || []).map(cp => `* **${cp.item}** (분류: ${cp.category})`).join('\n')
    return `### 💡 로컬 간이 실무 가이드 (API 키 미등록)
본 기능은 개발자/실험용 AI 기능입니다. 현재 API 키가 등록되지 않아 로컬 기본 정보만 제공합니다.

**${node.code} (${node.title}) 검토 시 핵심 실무 항목:**
${listItems}

---
⚠️ **[주의 및 경고]** 
본 안내는 제공된 정보를 바탕으로 한 일반적인 검토 안내일 뿐이며, 국토교통부 고시 공식 건설기준 답변이 아닙니다. 실제 인허가 및 시공 시에는 아래의 공식 원문 검색 버튼을 눌러 **국가건설기준센터(KCSC) 공식 원문**을 반드시 확인하시기 바랍니다.

[공식 원문 직접 검색]
- [국가건설기준센터 공식 원문 보기 ↗](${node.originalUrl})
`
  }

  // 2. Use Gemini API with strict instruction prompts
  const prompt = `당신은 대한민국 국가건설기준(KCS, KDS) 및 국가표준(KS) 전문가입니다.
제공된 건설기준 자료를 바탕으로 질문에 대한 전문적인 요약 보고서를 작성하세요.

${docContext}

[수행 지침 및 제한 사항 - 필독]
1. 반드시 위에 제공된 [제공된 기준 자료]의 내용만 사용하여 요약을 작성하십시오.
2. 자료에 없는 내용을 임의로 추측하거나 지어내지 마십시오 (환각 방지).
3. 수치, 허용오차, 적용 기온/두께 등은 자료에 명시된 그대로 사용하고 임의로 생성하지 마십시오.
4. 답변에 기준 코드(${node.code})와 조항명/조항 내용을 명확히 표시하십시오.
5. 답변 끝에 반드시 "※ 본 요약은 참고용이며, 최종 시공 및 품질 관리 판단은 국가건설기준센터(KCSC)의 공식 원문을 대조·확인해야 합니다."라는 경고성 안내를 명시하십시오.

마크다운 형식으로 보기 좋게 렌더링될 수 있도록 답변해 주세요. 한국어로 작성해 주세요.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      if (response.status === 400 || response.status === 403) {
        throw new Error('API 키가 올바르지 않거나 권한이 없습니다. 설정을 확인해 주세요.')
      }
      throw new Error(`Gemini API 통신 실패 (HTTP ${response.status})`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      throw new Error('API 응답 형식오류: 요약 결과가 없습니다.')
    }
    return text
  } catch (error: any) {
    console.error('Gemini API Error:', error)
    return `### ⚠️ AI 요약 오류 발생
AI 요약 서비스를 호출하는 도중 문제가 발생했습니다: **${error.message || error}**

**확인 사항:**
1. 우측 상단의 API 설정을 열어 입력한 API 키가 정확한지 확인해 주세요.
2. 일시적인 네트워크 장애 또는 API 한도 초과일 수 있습니다.
3. API 호출이 실패하더라도 좌측 목록 검색 및 우측 상세 수치 확인(로컬 기능)은 그대로 사용하실 수 있습니다.`
  }
}
