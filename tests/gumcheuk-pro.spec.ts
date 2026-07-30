import { test, expect, type Page } from '@playwright/test'
import { writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const appUrl = 'http://localhost:5173/gumcheuk-pro/index.html'
const dataTestUrl = 'http://localhost:5173/gumcheuk-pro/test-inspection-data.html'

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test.describe('검측프로 통합 및 보안 회귀', () => {
  test('기존 50개 데이터 검증과 19+3 템플릿, 130개 항목', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(dataTestUrl)
    await expect(page.locator('#summary')).toContainText('전체 통과 — 50건')
    await expect(page.locator('.case.fail')).toHaveCount(0)
    const stats = await page.evaluate(() => window.InspectionDataAdapter.getStatistics())
    expect(stats.legacyTemplateCount).toBe(19)
    expect(stats.databaseTemplateCount).toBe(3)
    expect(stats.itemCount).toBe(130)
    expect(errors).toEqual([])
  })

  test('기존/DB 템플릿, 판정 3종, 즉시 경고, 자동저장, 새로고침, JSON 왕복', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(appUrl)
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    await page.click('.step-btn[data-step="2"]')
    await page.selectOption('#ri_category', 'concrete')
    await page.selectOption('#ri_subWork', 'CO-01')
    await page.click('.step-btn[data-step="3"]')
    await expect(page.locator('.checklist-row')).toHaveCount(5)

    await page.selectOption('.checklist-row:first-child select[data-field="result.c1"]', '적합')
    await page.selectOption('.checklist-row:first-child select[data-field="result.c1"]', '부적합')
    await expect(page.locator('.checklist-row:first-child .action-required')).toBeVisible()
    await page.selectOption('.checklist-row:first-child select[data-field="result.c1"]', '해당없음')
    await expect(page.locator('.checklist-row:first-child .action-required')).toHaveCount(0)
    await page.fill('.checklist-row:first-child input[data-field="remark"]', '자동저장 메모')
    await expect(page.locator('#autosaveLine')).not.toHaveText('자동 임시저장: -', { timeout: 3000 })
    await page.reload()
    await page.click('.step-btn[data-step="3"]')
    await expect(page.locator('.checklist-row:first-child input[data-field="remark"]')).toHaveValue('자동저장 메모')

    await page.click('.step-btn[data-step="2"]')
    await page.selectOption('#ri_category', 'rc')
    await page.selectOption('#ri_subWork', 'DB-04-001')
    page.once('dialog', (dialog) => dialog.accept())
    await page.click('#btnLoadTemplateItems')
    await expect(page.locator('.checklist-row')).toHaveCount(7)

    const downloadPromise = page.waitForEvent('download')
    await page.click('#btnSaveJson')
    const download = await downloadPromise
    const savedPath = await download.path()
    expect(savedPath).toBeTruthy()

    await page.click('.step-btn[data-step="1"]')
    await page.fill('#pi_projectName', '변경 전')
    const dialogPromise = page.waitForEvent('dialog')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('#btnLoad')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles(savedPath as string)
    const loadDialog = await dialogPromise
    expect(loadDialog.message()).toContain('불러오기가 완료')
    await loadDialog.accept()
    await expect(page.locator('#pi_projectName')).not.toHaveValue('변경 전')
    expect(errors).toEqual([])
  })

  test('기존 localStorage 호환과 비파괴 마이그레이션', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(appUrl)
    const result = await page.evaluate(() => {
      localStorage.clear()
      const legacy = {
        projectInfo: { projectName: '기존 저장 현장' },
        requestInfo: { categoryId: 'concrete', subWorkCode: 'CO-01' },
        checklist: [{
          item: '기존 항목', standard: '기존 기준',
          result: { c1: '적합', c2: '', s1: '', s2: '' },
          action: '', remark: '기존 메모'
        }]
      }
      const original = JSON.stringify(legacy)
      localStorage.setItem('munseobang:gumcheuk:autosave_v1', original)
      const migrated = window.eval('migrateSavedInspectionData')(legacy)
      return {
        unchanged: JSON.stringify(legacy) === original,
        copied: migrated !== legacy,
        version: migrated.schemaVersion
      }
    })
    expect(result).toEqual({ unchanged: true, copied: true, version: 2 })
    await page.reload()
    await expect(page.locator('#pi_projectName')).toHaveValue('기존 저장 현장')
    await expect(page.locator('.checklist-row')).toHaveCount(1)
    const keys = await page.evaluate(() => ({
      old: localStorage.getItem('munseobang:gumcheuk:autosave_v1'),
      current: localStorage.getItem('gumcheukpro_autosave_v1')
    }))
    expect(keys.old).toBeTruthy()
    expect(keys.current).toBe(keys.old)
    expect(errors).toEqual([])
  })

  test('잘못된 JSON 구조와 5MB 초과 파일 방어', async ({ page }) => {
    test.setTimeout(60000)
    const errors = collectErrors(page)
    await page.goto(appUrl)

    let dialogPromise = page.waitForEvent('dialog')
    let fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('#btnLoad')
    let fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken')
    })
    let dialog = await dialogPromise
    expect(dialog.message()).toContain('파일을 읽을 수 없습니다')
    await dialog.accept()

    dialogPromise = page.waitForEvent('dialog')
    fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('#btnLoad')
    fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'wrong.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":"world"}')
    })
    dialog = await dialogPromise
    expect(dialog.message()).toContain('파일을 읽을 수 없습니다')
    await dialog.accept()

    const largePath = join(tmpdir(), 'gumcheuk-large-json-test.json')
    await writeFile(largePath, '{"projectInfo":{"projectName":"' + 'x'.repeat(5 * 1024 * 1024) + '"}}')
    let largeDialogMessage = ''
    page.once('dialog', async (largeDialog) => {
      largeDialogMessage = largeDialog.message()
      await largeDialog.accept()
    })
    fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('#btnLoad')
    fileChooser = await fileChooserPromise
    await fileChooser.setFiles(largePath)
    expect(largeDialogMessage).toContain('5MB 이하')
    await unlink(largePath)
    await expect(page.locator('#pi_projectName')).toBeVisible()
    expect(errors).toEqual([])
  })

  test('악성 dataUrl 제거와 어댑터 재실행 중복 방지', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto(appUrl)
    const before = await page.evaluate(() => ({
      templates: window.eval('SUB_WORK_TEMPLATES.length'),
      stats: window.InspectionDataAdapter.getStatistics()
    }))

    const dialogPromise = page.waitForEvent('dialog')
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.click('#btnLoad')
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'unsafe-image.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({
        schemaVersion: 2,
        projectInfo: {}, requestInfo: {}, checklist: [],
        signatures: { contractorCheck: 'data:image/svg+xml,<svg onload=alert(1)>' },
        photos: [{ id: 'unsafe', dataUrl: 'javascript:alert(1)', caption: 'x', linkedItem: null }],
        participants: [{ name: 'x', signature: 'data:text/html,unsafe' }],
        resultNotice: {}, ui: {}
      }))
    })
    const importDialog = await dialogPromise
    await importDialog.accept()
    const sanitized = await page.evaluate(() => window.eval(
      '({ signature: state.signatures.contractorCheck, photo: state.photos[0].dataUrl, participant: state.participants[0].signature })'
    ))
    expect(sanitized).toEqual({ signature: null, photo: '', participant: null })

    const after = await page.evaluate(async () => {
      const source = await (await fetch('inspectionDataAdapter.js')).text()
      window.eval(source)
      return {
        templates: window.eval('SUB_WORK_TEMPLATES.length'),
        stats: window.InspectionDataAdapter.getStatistics()
      }
    })
    expect(after.templates).toBe(before.templates)
    expect(after.stats.legacyTemplateCount).toBe(19)
    expect(after.stats.databaseTemplateCount).toBe(3)
    expect(after.stats.itemCount).toBe(130)
    expect(errors).toEqual([])
  })
})