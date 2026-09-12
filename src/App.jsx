import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GameCanvas } from './components/GameCanvas.jsx'
import { GameMenu } from './components/GameMenu.jsx'
import { Diary } from './components/Diary.jsx'
import { MainMenu } from './components/MainMenu.jsx'
import { CombatScreen } from './components/CombatScreen.jsx'
import { Inventory } from './components/Inventory.jsx'
import { QuickSlotHUD } from './components/QuickSlotHUD.jsx'
import { KeybindGuide } from './components/KeybindGuide.jsx'
import { IntroSubtitles } from './components/IntroSubtitles.jsx'
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
  const [introPhase, setIntroPhase] = useState('idle') // idle | closing | intro | opening
  const [subtitlePhase, setSubtitlePhase] = useState(null) // null | hades | aya
  const gameApiRef = useRef(null)
  const jogadorRef = useRef(null)

  const startGame = () => {
    jogadorRef.current = criarPersonagem('Hades', '3', 'male')
    setIntroPhase('closing')
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
    <div style={{ position: 'relative' }}>
      {subtitlePhase && (
        <IntroSubtitles phase={subtitlePhase} />
      )}

      {/* Vinheta de transição */}
      {(introPhase === 'closing' || introPhase === 'intro') && (
        <motion.div
          key="vignette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeIn' }}
          onAnimationComplete={() => {
            if (introPhase === 'closing') {
              setIntroPhase('intro');
              setPage('game');
            }
          }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 0%, black 70%)',
          }}
        />
      )}
      <AnimatePresence mode="wait">
       {page === 'home' && (
        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <MainMenu onNewGame={startGame} />
        </motion.div>
      )}

        {page === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: introPhase === 'opening' ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeIn' }}
          >
            <div id="game">
              <div className="noise" />
              <GameCanvas
                isPaused={isMenuOpen || isDiaryOpen || isInventoryOpen || !!combatEnemy}
                onReady={(api) => {
                  gameApiRef.current = api;
                  api.setJogador(jogadorRef.current);
                  api.playIntro({
                    onHadesStart: () => setSubtitlePhase('hades'),
                    onAyaStart:   () => setSubtitlePhase('aya'),
                    onComplete:   () => {
                      setSubtitlePhase(null);
                      setIntroPhase('opening');
                      setTimeout(async () => {
                        const game = document.getElementById('game');
                        if (game && !document.fullscreenElement) {
                          try { await game.requestFullscreen(); } catch (e) { console.error(e); }
                        }
                        api.playMusic();
                      }, 0);
                    },
                  });
                }}
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

              <QuickSlotHUD quickSlots={quickSlots} />
              <KeybindGuide />

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
