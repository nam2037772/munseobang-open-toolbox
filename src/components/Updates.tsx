const UPDATES = [
  { date: '2026.07.05', title: '문서방 MVP 1차 기술감리 및 한글 인코딩 복구' },
  { date: '준비중', title: '공사일보 작성 후 PC 저장 도구' },
  { date: '준비중', title: '사진대지 PDF 저장 도구' },
]

function Updates() {
  return (
    <section className="updates" id="updates">
      <h2 className="section-title">최신 작업 기록</h2>
      <div className="updates__grid">
        {UPDATES.map((update) => (
          <article key={update.title} className="update-card">
            <span className="update-card__date">{update.date}</span>
            <h3 className="update-card__title">{update.title}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Updates
