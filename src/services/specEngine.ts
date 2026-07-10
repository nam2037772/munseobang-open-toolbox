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
