import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import SearchResults from './components/SearchResults'
import Favorites from './components/Favorites'
import FolderGrid from './components/FolderGrid'
import FolderView from './components/FolderView'
import About from './components/About'
import Footer from './components/Footer'
import type { FolderId } from './data/apps'

type View = 'home' | 'about'

function App() {
  const [selectedFolder, setSelectedFolder] = useState<FolderId | null>(null)
  const [view, setView] = useState<View>('home')
  const [query, setQuery] = useState('')

  const goHome = () => {
    setView('home')
    setSelectedFolder(null)
    setQuery('')
  }

  const showSearchResults = view === 'home' && query.trim().length > 0

  return (
    <div id="top">
      <div className="app-topbar">
        <Header onHome={goHome} onAbout={() => setView('about')} />
        {view === 'home' && <SearchBar value={query} onChange={setQuery} />}
      </div>

      <main className="workspace">
        {view === 'about' ? (
          <About onBackToHome={goHome} />
        ) : showSearchResults ? (
          <SearchResults query={query} />
        ) : selectedFolder ? (
          <FolderView folderId={selectedFolder} onBack={() => setSelectedFolder(null)} />
        ) : (
          <>
            <Favorites />
            <FolderGrid onSelect={setSelectedFolder} />
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
