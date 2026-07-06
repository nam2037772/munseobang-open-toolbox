import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchHub from './components/SearchHub'
import CategoryGrid from './components/CategoryGrid'
import Principles from './components/Principles'
import Workflow from './components/Workflow'
import Updates from './components/Updates'
import Footer from './components/Footer'

function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <SearchHub />
        <CategoryGrid />
        <Principles />
        <Workflow />
        <Updates />
      </main>
      <Footer />
    </div>
  )
}

export default App
