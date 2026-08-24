import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCanvas } from './components/GameCanvas.jsx'
import { GameMenu } from './components/GameMenu.jsx'
import { Diary } from './components/Diary.jsx'
import { MainMenu } from './components/MainMenu.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const gameApiRef = useRef(null)

  const startGame = async () => {
    setPage('game')

    setTimeout(async () => {
        const game = document.getElementById('game')

        if (game && !document.fullscreenElement) {
            try {
                await game.requestFullscreen()
            } catch (error) {
                console.error('Não foi possível entrar em tela cheia:', error)
            }
        }
    }, 0)
}

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (page !== 'game') return;

      if (e.key === 'Escape') {
        if (isDiaryOpen) setIsDiaryOpen(false);
        else setIsMenuOpen(prev => !prev);
      }
      
      if (e.key === 'Tab') {
        e.preventDefault();
        if (!isMenuOpen) {
          setIsDiaryOpen(prev => !prev);
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [page, isDiaryOpen, isMenuOpen])

  return (
    <div style={{ perspective: '1200px' }}>
      <AnimatePresence mode="wait">
       {page === 'home' && (
    <motion.div
        key="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, rotateY: 90 }}
        transition={{ duration: 0.6, ease: 'easeIn' }}
        style={{ transformStyle: 'preserve-3d' }}
    >
        <MainMenu
    onNewGame={startGame}
      />
    </motion.div>
)}

        {page === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div id="game">
              <div className="noise" />
              <GameCanvas isPaused={isMenuOpen || isDiaryOpen} onReady={(api) => { gameApiRef.current = api; }} />
              <AnimatePresence>
                {isMenuOpen && (
                  <GameMenu 
                    onResume={() => setIsMenuOpen(false)} 
                    onQuit={() => {
                      setIsMenuOpen(false)
                      setPage('home')
                    }}
                    onOpenDiary={() => {
                      setIsMenuOpen(false);
                      setIsDiaryOpen(true);
                    }}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isDiaryOpen && (
                  <Diary 
                    isOpen={isDiaryOpen} 
                    onClose={() => setIsDiaryOpen(false)} 
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
