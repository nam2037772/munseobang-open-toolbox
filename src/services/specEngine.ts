import type { SpecIndexItem, SpecNode } from '../types/spec'

let cachedIndex: SpecIndexItem[] | null = null
const cachedDetails: Record<string, SpecNode> = {}

/**
 * Fetch the base spec index from public directory
 */
export async function getSpecIndex(): Promise<SpecIndexItem[]> {
  if (cachedIndex) return cachedIndex

  const baseUrl = import.meta.env.BASE_URL || '/'
  try {
    const res = await fetch(`${baseUrl}data/specs/index.json`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    cachedIndex = data
    return data
  } catch (error) {
    console.error('Failed to load spec index:', error)
    return []
  }
}

/**
 * Fetch detailed spec node by its code (e.g. "KCS 14 20 10")
 */
export async function getSpecDetail(code: string): Promise<SpecNode | null> {
  const normalizedCode = code.replace(/\s+/g, '_')
  if (cachedDetails[normalizedCode]) {
    return cachedDetails[normalizedCode]
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  try {
    const res = await fetch(`${baseUrl}data/specs/${normalizedCode}.json`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = (await res.json()) as SpecNode
    cachedDetails[normalizedCode] = data
    return data
  } catch (error) {
    console.error(`Failed to load spec detail for ${code}:`, error)
    return null
  }
}

/**
 * Local in-memory keyword tokenizer search
 */
export async function searchSpecs(query: string): Promise<SpecIndexItem[]> {
  const index = await getSpecIndex()
  const trimmed = query.trim().toLowerCase()

  if (!trimmed) return index

  // Tokenize user search (e.g. "철근 피복" -> ["철근", "피복"])
  const tokens = trimmed.split(/\s+/).filter(Boolean)

  return index.filter((item) => {
    const codeMatch = item.code.toLowerCase().includes(trimmed)
    const titleMatch = item.title.toLowerCase().includes(trimmed)
    
    // Check if item's keywords or code contains all/any search tokens
    const keywordMatch = tokens.every((token) => 
      item.keywords.some((kw) => kw.toLowerCase().includes(token)) ||
      item.title.toLowerCase().includes(token) ||
      item.code.toLowerCase().includes(token)
    )

    return codeMatch || titleMatch || keywordMatch
  })
}
