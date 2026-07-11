import { test, expect } from '@playwright/test'

test.describe('문서방 오픈툴박스 스모크 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // Vite 개발 서버 디폴트 포트로 이동
    await page.goto('http://localhost:5173/')
  })

  test('1. 메인 대시보드 타이틀 확인 및 기본 레이아웃 검증', async ({ page }) => {
    // 타이틀 확인
    await expect(page.locator('.mds-logo-title')).toHaveText('문서방 오픈툴박스')
    
    // 사이드바가 존재하지 않는지 검증
    const sidebar = page.locator('.mds-sidebar')
    await expect(sidebar).toHaveCount(0)
    
    // 포털 대시보드 메인 영역이 존재하는지 검증
    await expect(page.locator('.mds-dashboard')).toBeVisible()
  })

  test('2. 패밀리 앱 바로가기 링크 및 준비중 상태 검증', async ({ page }) => {
    // 1) 공사일보 작성기 바로가기 버튼 링크 검증
    const dailyReportBtn = page.locator('.mds-family-app-item', { hasText: '공사일보 작성기' })
    await expect(dailyReportBtn).toBeVisible()
    
    // 2) 준비중 카드 작동 검증 (클릭 시 alert이 뜨는지 또는 비활성화 스타일이 적용되었는지)
    const prepBtn = page.locator('.mds-family-app-item.is-prep', { hasText: '품질관리 독립 앱' })
    await expect(prepBtn).toBeVisible()
    await expect(prepBtn).toHaveClass(/is-prep/)
  })

  test('3. 건설기준 탐색기 모달 창 팝업 및 닫기 기능 동작 검증', async ({ page }) => {
    // 1) 건설기준 탐색기 바로가기 클릭
    const navigatorShortcut = page.locator('.mds-search-box-card--navigator-shortcut')
    await expect(navigatorShortcut).toBeVisible()
    await navigatorShortcut.click()

    // 2) 모달 오버레이 및 다이얼로그 활성화 확인
    const modal = page.locator('.mds-modal-overlay')
    await expect(modal).toBeVisible()
    await expect(page.locator('.mds-modal-title')).toContainText('건설기준 탐색기')

    // 3) 모달 닫기 버튼 클릭
    const closeBtn = page.locator('.mds-modal-close-btn')
    await expect(closeBtn).toBeVisible()
    await closeBtn.click()

    // 4) 모달 비활성화 확인
    await expect(modal).toHaveCount(0)
  })

  test('4. 모바일 뷰포트에서의 레이아웃 및 옴니박스 반응형 검증', async ({ page }) => {
    // 375x667 모바일 뷰포트로 리사이징
    await page.setViewportSize({ width: 375, height: 667 })
    
    // 구글 검색창 노출 및 포털이 깨지지 않고 렌더링되는지 검토
    await expect(page.locator('#google-search-input')).toBeVisible()
    await expect(page.locator('.mds-family-apps__grid')).toBeVisible()
  })

  test('5. 공사일보 독립 앱 직접 URL 접속 및 새로고침 데이터 보존 검증', async ({ page }) => {
    // 1) 직접 URL 접속 (Vite 정적 리소스는 index.html 명시가 안전함)
    await page.goto('http://localhost:5173/gongsailbo-pro/index.html')
    await expect(page.locator('#projectName')).toBeVisible()
    
    // 2) 현장명 값 입력 변경
    const testProjectName = '플레이라이트 통합 테스트 현장'
    await page.fill('#projectName', testProjectName)
    await page.locator('#projectName').blur()
    
    // 3) 저장 버튼 클릭 (공사일보는 명시적 저장이 필요함)
    const saveBtn = page.locator('#saveBtn')
    await expect(saveBtn).toBeVisible()
    await saveBtn.click()
    
    // 4) 새로고침
    await page.reload()
    
    // 5) 로컬 스토리지 키 prefix가 반영되어 새로고침 후에도 유지되는지 검증
    await expect(page.locator('#projectName')).toHaveValue(testProjectName)
  })

  test('6. 안전환경보전비 독립 앱 JSON 백업 파일 다운로드 기능 작동 검증', async ({ page }) => {
    // 직접 URL 접속 (Vite 정적 리소스는 index.html 명시가 안전함)
    await page.goto('http://localhost:5173/safety-environment-costs/index.html')
    
    // 다운로드 이벤트 약속 정의
    const downloadPromise = page.waitForEvent('download')
    
    // 백업/다운로드 버튼 클릭
    const exportBtn = page.locator('#export-json')
    await expect(exportBtn).toBeVisible()
    await exportBtn.click()
    
    // 다운로드 완료 대기 및 검증
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('산업안전보건관리비')
  })
})
