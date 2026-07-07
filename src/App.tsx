import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import SearchHub from './components/SearchHub'
import Favorites from './components/Favorites'
import FolderGrid from './components/FolderGrid'
import FolderView from './components/FolderView'
import Principles from './components/Principles'
import Updates from './components/Updates'
import Footer from './components/Footer'
import type { FolderId } from './data/apps'

function App() {
  const [selectedFolder, setSelectedFolder] = useState<FolderId | null>(null)

  return (
    <div id="top">
      <Header />
      <main>
        <Hero />
        <SearchHub />
        <Favorites />
        {selectedFolder ? (
          <FolderView folderId={selectedFolder} onBack={() => setSelectedFolder(null)} />
        ) : (
          <FolderGrid onSelect={setSelectedFolder} />
        )}
        <Principles />
        <Updates />
      </main>
      <Footer />
    </div>
  )
}

export default App
