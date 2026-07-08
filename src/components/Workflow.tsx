const STEPS = [
  { step: '1단계', title: '찾기', desc: '필요한 문서, 기준, 계산기, CAD 자료를 답안 카드에서 찾습니다.' },
  { step: '2단계', title: '확인', desc: '공식자료 우선, 기준 확인, 검토필요 라벨을 보고 신뢰 수준을 판단합니다.' },
  { step: '3단계', title: '사용', desc: '공사일보, 사진대지, 계산기 같은 도구는 브라우저에서 바로 사용하도록 확장합니다.' },
  {
    step: '4단계',
    title: '저장',
    desc: '결과물은 사용자의 PC에 저장합니다. 문서방은 기본적으로 사용자 파일을 보관하지 않습니다.',
  },
]

function Workflow() {
  return (
    <section className="workflow">
      <h2 className="section-title">문서방 사용 흐름</h2>
      <ol className="workflow__list">
        {STEPS.map((item) => (
          <li key={item.step} className="workflow__item">
            <span className="workflow__step">{item.step}</span>
            <h3 className="workflow__title">{item.title}</h3>
            <p className="workflow__desc">{item.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Workflow
