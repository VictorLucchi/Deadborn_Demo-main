import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCanvas } from './components/GameCanvas.jsx'
import { GameMenu } from './components/GameMenu.jsx'
import { Diary } from './components/Diary.jsx'
import { MainMenu } from './components/MainMenu.jsx'
import { CombatScreen } from './components/CombatScreen.jsx'
import { Inventory } from './components/Inventory.jsx'
import { criarPersonagem } from './engine/GameEngine.js'
import './App.css'

function App() {
  const [page, setPage] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const [combatEnemy, setCombatEnemy] = useState(null)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [quickSlots, setQuickSlots] = useState([null, null, null, null])
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const gameApiRef = useRef(null)
  const jogadorRef = useRef(null)

  const startGame = async () => {
    // Cria um jogador padrão ao iniciar o jogo
    jogadorRef.current = criarPersonagem('Hades', '3', 'male')
    setPage('game')

    setTimeout(async () => {
        const game = document.getElementById('game')
        if (game && !document.fullscreenElement) {
            try { await game.requestFullscreen() } catch (error) { console.error(error) }
        }
    }, 0)
  }

  const handleCombatTrigger = (enemy) => {
    // Pausa o canvas e abre o combate
    setCombatEnemy(enemy)
  }

  const handleCombatClose = () => {
    // Remove o hunter do mapa e retoma o jogo
    if (combatEnemy) gameApiRef.current?.removeEnemy(combatEnemy)
    setCombatEnemy(null)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (page !== 'game') return;
      if (isConsoleOpen) return;

      if (e.key === 'Escape') {
        if (isDiaryOpen) setIsDiaryOpen(false);
        else if (isInventoryOpen) setIsInventoryOpen(false);
        else setIsMenuOpen(prev => !prev);
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (!isMenuOpen && !isInventoryOpen) setIsDiaryOpen(prev => !prev);
      }

      if (e.key === 'i' || e.key === 'I') {
        if (!isMenuOpen && !isDiaryOpen) setIsInventoryOpen(prev => !prev);
      }

      // saque rápido — teclas 1-4 só funcionam fora de qualquer overlay
      const slot = parseInt(e.key) - 1;
      if (slot >= 0 && slot <= 3 && !isMenuOpen && !isDiaryOpen && !isInventoryOpen && !combatEnemy) {
        const item = quickSlots[slot];
        if (item && jogadorRef.current) {
          item.usar?.(jogadorRef.current);
          jogadorRef.current.removerItem?.(item);
          setQuickSlots(prev => { const n = [...prev]; n[slot] = null; return n; });
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [page, isDiaryOpen, isMenuOpen, isInventoryOpen, quickSlots, combatEnemy, isConsoleOpen])

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
              <GameCanvas
                isPaused={isMenuOpen || isDiaryOpen || isInventoryOpen || !!combatEnemy}
                onReady={(api) => { gameApiRef.current = api; api.playMusic(); api.setJogador(jogadorRef.current); }}
                onCombatTrigger={handleCombatTrigger}
                onConsoleToggle={setIsConsoleOpen}
              />
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

              <AnimatePresence>
                {isInventoryOpen && (
                  <Inventory
                    jogador={jogadorRef.current}
                    quickSlots={quickSlots}
                    setQuickSlots={setQuickSlots}
                    onClose={() => setIsInventoryOpen(false)}
                  />
                )}
              </AnimatePresence>

              {combatEnemy && (
                <CombatScreen
                  jogador={jogadorRef.current}
                  enemyType="hunter"
                  onClose={handleCombatClose}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
