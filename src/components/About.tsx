import Hero from './Hero'
import Principles from './Principles'
import Workflow from './Workflow'
import Updates from './Updates'

interface AboutProps {
  onBackToHome: () => void
}

function About({ onBackToHome }: AboutProps) {
  return (
    <>
      <Hero onBackToHome={onBackToHome} />
      <Principles />
      <Workflow />
      <Updates />
    </>
  )
}

export default About
