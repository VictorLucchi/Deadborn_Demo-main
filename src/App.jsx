import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCanvas } from './components/GameCanvas.jsx'
import { GameMenu } from './components/GameMenu.jsx'
import { Diary } from './components/Diary.jsx'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const gameApiRef = useRef(null)

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
  }, [page])

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
            <div id="home">
              <div className="noise" />
              <h1 className="logo">DEADBORN</h1>
              <div className="prologue">
                <p>
                  {/* O mundo não morreu de vez. O silêncio que sucedeu o estrondo foi somente o começo. */}
                  {/* O começo de uma abominação. Horrores caminham por todo o lugar e você já nem sabe */}
                  {/* onde inicia e onde termina a sanidade. */}
                  O mundo não morreu repentinamente. Aos poucos a humanidade esqueceu o que a torna
                  mortal e tão perigosa. A curiosidade é o maior mal da humanidade que um dia a preservou,
                  e agora, foi seu fim. Onde inicia a insanidade e termina a conciecia?
                </p>
                <p>
                  Você fechou a porta da humanidade há muito tempo, e se fechou para se proteger dos
                  Horrores do conhecimento. A ignorância é a escuridão. Conhecimento é a luz.
                  Curiosidade é a porta...
                </p>
              </div>
              <button className="open-door" onClick={() => { setPage('game'); setTimeout(() => gameApiRef.current?.playMusic(), 650); }}>
                ⬡ Abrir
              </button>
            </div>
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
