// 건설 실무 최신소식 자동 수집 스크립트
// GitHub Actions에서 하루 1~2회 실행되어 public/data/news.json을 갱신한다.
// 원문 전문은 저장하지 않고 제목, 날짜, 출처, 링크, 카테고리만 남긴다.
// 출처 하나가 실패해도 나머지 출처 수집과 파일 저장은 계속 진행한다.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const NEWS_PATH = path.join(ROOT_DIR, 'public', 'data', 'news.json')
const LOG_PATH = path.join(ROOT_DIR, 'scripts', 'fetch-news-log.json')

const USER_AGENT =
  'Mozilla/5.0 (compatible; MunseobangNewsBot/1.0; +https://github.com/nam2037772/munseobang-open-toolbox)'
const TIMEOUT_MS = 15000
const MAX_PER_SOURCE = 25
const MAX_TOTAL = 200
const MAX_LOG_RUNS = 30

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

// 일부 사이트(국토교통부)는 최초 요청 시 WAF 쿠키 발급용 307 리다이렉트를 반환한다.
// 쿠키를 저장했다가 재요청해서 실제 콘텐츠를 받아온다.
async function fetchTextWithCookieRedirect(url) {
  let currentUrl = url
  let cookie = ''
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const res = await fetchWithTimeout(currentUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': USER_AGENT,
        ...(cookie ? { Cookie: cookie } : {}),
      },
    })
    if (res.status >= 300 && res.status < 400) {
      const setCookie = res.headers.get('set-cookie')
      if (setCookie) cookie = setCookie.split(';')[0]
      const location = res.headers.get('location')
      if (!location) throw new Error(`리다이렉트 응답에 location이 없음 (${res.status})`)
      currentUrl = new URL(location, currentUrl).toString()
      continue
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  }
  throw new Error('리다이렉트 횟수 초과')
}

async function fetchText(url) {
  const res = await fetchWithTimeout(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

function decodeEntities(raw) {
  return raw
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function cleanText(raw) {
  return decodeEntities(raw.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTrBlocks(html) {
  return html.match(/<tr[\s\S]*?<\/tr>/g) || []
}

function dedupeByUrl(items) {
  const map = new Map()
  for (const item of items) map.set(item.url, item)
  return [...map.values()]
}

// ---------- 국토교통부 (RSS) ----------
async function fetchMolitFeed(rssId, category) {
  const feedUrl = `https://www.molit.go.kr/dev/board/board_rss.jsp?rss_id=${rssId}`
  const xml = await fetchTextWithCookieRedirect(feedUrl)
  const itemBlocks = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1])

  const results = []
  for (const block of itemBlocks) {
    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)
    const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/)
    const dcDateMatch = block.match(/<dc:date>([\s\S]*?)<\/dc:date>/)
    const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)
    if (!titleMatch || !linkMatch) continue

    const title = cleanText(titleMatch[1])
    const url = decodeEntities(linkMatch[1]).trim()

    let date = null
    if (dcDateMatch) {
      date = dcDateMatch[1].trim().slice(0, 10)
    } else if (pubDateMatch) {
      const parsed = new Date(pubDateMatch[1].trim())
      if (!Number.isNaN(parsed.getTime())) date = parsed.toISOString().slice(0, 10)
    }
    if (!title || !url || !date) continue

    results.push({ source: '국토교통부', category, title, date, url, tags: ['정책', '건설'] })
  }
  return dedupeByUrl(results)
}

// ---------- 대한건설협회 (게시판) ----------
async function fetchCakBoard(boardPath, category) {
  const listUrl = `https://www.cak.or.kr/lay1/bbs/${boardPath}/list.do`
  const html = await fetchText(listUrl)
  const rows = extractTrBlocks(html)

  const results = []
  for (const row of rows) {
    const linkMatch = row.match(/href="view\.do\?article_seq=(\d+)[^"]*"[^>]*>([\s\S]*?)<\/a>/)
    if (!linkMatch) continue
    const dateMatch = row.match(/(\d{2})\.(\d{2})\.(\d{2})/)
    if (!dateMatch) continue

    const id = linkMatch[1]
    const title = cleanText(linkMatch[2])
    const date = `20${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
    if (!title) continue

    const url = `https://www.cak.or.kr/lay1/bbs/${boardPath}/view.do?article_seq=${id}`
    results.push({ source: '대한건설협회', category, title, date, url, tags: ['건설', '협회'] })
  }
  return dedupeByUrl(results)
}

// ---------- 대한건축사협회 (게시판) ----------
async function fetchKiraBoard(category) {
  const listUrl = 'https://www.kira.or.kr/jsp/main/01/01.jsp'
  const html = await fetchText(listUrl)
  const rows = extractTrBlocks(html)

  const results = []
  for (const row of rows) {
    const linkMatch = row.match(/fnReadArticle\((\d+)\)[^>]*>([\s\S]*?)<\/a>/)
    if (!linkMatch) continue
    const dateMatch = row.match(/(20\d{2}-\d{2}-\d{2})/)
    if (!dateMatch) continue

    const id = linkMatch[1]
    const title = cleanText(linkMatch[2])
    if (!title) continue

    const url = `https://www.kira.or.kr/jsp/main/01/01.jsp?mode=read&ba_id=${id}`
    results.push({ source: '대한건축사협회', category, title, date: dateMatch[1], url, tags: ['건축', '협회'] })
  }
  return dedupeByUrl(results)
}

// ---------- CSI 건설공사 안전관리 종합정보망 (공지사항/자료실) ----------
async function fetchCsiBoard(kind, category) {
  const viewFnName = kind === 'notice' ? 'noticeViewAjax' : 'dataViewAjax'
  const viewPage = kind === 'notice' ? 'noticeOnlyView' : 'dataOnlyView'
  const bbsId = kind === 'notice' ? 'noti' : 'data'

  const listUrl = `https://www.csi.go.kr/community/${kind}ListAjax.do`
  const html = await fetchText(listUrl)
  const rows = extractTrBlocks(html)

  const idPattern = new RegExp(`${viewFnName}\\.do\\?bbt_no=(\\d+)`)
  const results = []
  for (const row of rows) {
    const idMatch = row.match(idPattern)
    if (!idMatch) continue
    const titleTdMatch = row.match(/<td class="t-left">([\s\S]*?)<\/td>/)
    const dateMatch = row.match(/(20\d{2}-\d{2}-\d{2})/)
    if (!titleTdMatch || !dateMatch) continue

    const title = cleanText(titleTdMatch[1])
    if (!title) continue

    const url = `https://www.csi.go.kr/community/${viewPage}.do?bbs_id=${bbsId}&bbt_no=${idMatch[1]}`
    results.push({ source: 'CSI', category, title, date: dateMatch[1], url, tags: ['안전', '건설'] })
  }
  return dedupeByUrl(results)
}

const JOBS = [
  { name: '국토교통부 보도자료', run: () => fetchMolitFeed('NEWS', '보도자료') },
  { name: '국토교통부 공지사항', run: () => fetchMolitFeed('N01_B', '공지사항') },
  { name: '대한건설협회 공지사항', run: () => fetchCakBoard('S1T9C11/A/1', '공지사항') },
  { name: '대한건설협회 보도자료', run: () => fetchCakBoard('S1T9C12/A/2', '보도자료') },
  { name: '대한건축사협회 공지사항', run: () => fetchKiraBoard('공지사항') },
  { name: 'CSI 공지사항', run: () => fetchCsiBoard('notice', '공지사항') },
  { name: 'CSI 자료실', run: () => fetchCsiBoard('data', '자료실') },
]

async function readExistingNews() {
  try {
    const raw = await readFile(NEWS_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function readExistingLog() {
  try {
    const raw = await readFile(LOG_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function mergeNews(existing, fresh) {
  const byUrl = new Map()
  for (const item of existing) {
    if (item && item.url) byUrl.set(item.url, item)
  }
  for (const item of fresh) {
    byUrl.set(item.url, item)
  }

  const sortDesc = (list) => list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))

  const all = sortDesc([...byUrl.values()])
  const perSourceCount = new Map()
  const capped = []
  for (const item of all) {
    const key = `${item.source}::${item.category}`
    const count = perSourceCount.get(key) || 0
    if (count >= MAX_PER_SOURCE) continue
    perSourceCount.set(key, count + 1)
    capped.push(item)
  }

  return sortDesc(capped).slice(0, MAX_TOTAL)
}

async function main() {
  const runLog = { runAt: new Date().toISOString(), sources: [] }
  const collected = []

  for (const job of JOBS) {
    const startedAt = Date.now()
    try {
      const items = await job.run()
      const valid = items.filter((item) => item.title && item.date && item.url)
      collected.push(...valid)
      runLog.sources.push({
        name: job.name,
        status: 'ok',
        count: valid.length,
        tookMs: Date.now() - startedAt,
      })
      console.log(`[OK] ${job.name}: ${valid.length}건`)
    } catch (error) {
      runLog.sources.push({
        name: job.name,
        status: 'error',
        count: 0,
        error: String(error && error.message ? error.message : error),
        tookMs: Date.now() - startedAt,
      })
      console.error(`[FAIL] ${job.name}:`, error && error.message ? error.message : error)
    }
    await sleep(400)
  }

  const existing = await readExistingNews()
  const merged = mergeNews(existing, collected)

  await mkdir(path.dirname(NEWS_PATH), { recursive: true })
  await writeFile(NEWS_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8')

  runLog.totalItems = merged.length
  const existingLog = await readExistingLog()
  const nextLog = [...existingLog, runLog].slice(-MAX_LOG_RUNS)
  await mkdir(path.dirname(LOG_PATH), { recursive: true })
  await writeFile(LOG_PATH, `${JSON.stringify(nextLog, null, 2)}\n`, 'utf-8')

  const failedCount = runLog.sources.filter((s) => s.status === 'error').length
  console.log(`수집 완료: 총 ${merged.length}건 저장, 실패한 출처 ${failedCount}건`)
}

main().catch((error) => {
  console.error('치명적 오류:', error)
  process.exitCode = 1
})
