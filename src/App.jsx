import { lazy, Suspense, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { GameMenu } from './ui/menus/GameMenu.jsx'
import { Diary } from './ui/diary/Diary.jsx'
import { MainMenu } from './ui/menus/MainMenu.jsx'
import { CombatScreen } from './ui/combat/CombatScreen.jsx'
import { Inventory } from './ui/inventory/Inventory.jsx'
import { QuickSlotHUD } from './ui/hud/QuickSlotHUD.jsx'
import { KeybindGuide } from './ui/menus/KeybindGuide.jsx'
import { IntroSubtitles } from './ui/intro/IntroSubtitles.jsx'
import { IntroScene } from './ui/intro/IntroScene.jsx'
import { CrowDialogueBox } from './ui/dialogue/CrowDialogueBox.jsx'
import diaryWritingSound from './assets/audio/SFX/escrita.mp3'

import { criarPersonagem } from './engine/GameEngine.js'

import './App.css'

const GameCanvas = lazy(() => import('./ui/hud/GameCanvas.jsx').then(({ GameCanvas }) => ({ default: GameCanvas })))

const INITIAL_DIARY_ENTRIES = {
  docs: [],
  transcripts: [],
  creatures: [],
  places: [
    {
      id: 'cinerea',
      title: 'Cinéria',
      meta: 'Local',
      content: 'Cinéria é um lugar difícil de entrar, parece desolado.',
    },
    {
      id: 'energia-cinerea',
      title: 'A energia do lugar',
      meta: 'Observação',
      content: 'Essa energia está quase tão forte quanto a energia vital dos demônios.',
    },
  ],
  notes: [
    {
      id: 'adormecido',
      title: 'O adormecido',
      meta: 'Nota',
      content: 'Ele ainda está adormecido... Preciso acordá-lo.',
    },
    {
      id: 'nevoa',
      title: 'A névoa',
      meta: 'Nota',
      content: 'Essa névoa é diferente, parece que ofusca a passagem da noite para o dia.',
    },
    {
      id: 'demonios',
      title: 'Silêncio',
      meta: 'Nota',
      content: 'Os demônios não podem me escutar aqui.',
    },
  ],
}

function App() {

  const [page, setPage] = useState('home')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDiaryOpen, setIsDiaryOpen] = useState(false)
  const [combatEnemy, setCombatEnemy] = useState(null)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [quickSlots, setQuickSlots] = useState([null, null, null, null])
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)

  const [introPhase, setIntroPhase] = useState('idle')
  const [subtitlePhase, setSubtitlePhase] = useState(null)

  const [showHadesTitle, setShowHadesTitle] = useState(false)
  const [introSceneActive, setIntroSceneActive] = useState(false)

  const [diaryEntries, setDiaryEntries] = useState(INITIAL_DIARY_ENTRIES)
  const [isDiaryUpdated, setIsDiaryUpdated] = useState(false)

  const [crowDialogue, setCrowDialogue] = useState(null)
  const [showCrowPrompt, setShowCrowPrompt] = useState(false)
  const [hasLantern, setHasLantern] = useState(false)

  const gameApiRef = useRef(null)
  const jogadorRef = useRef(null)
  const skipIntroRef = useRef(null)
  const diaryEventsRef = useRef(new Set())
  const diaryNotificationTimerRef = useRef(null)

  const registerDiaryEvent = (eventId, entry) => {
    if (diaryEventsRef.current.has(eventId)) return

    diaryEventsRef.current.add(eventId)
    setDiaryEntries(currentEntries => ({
      ...currentEntries,
      [entry.category]: [...currentEntries[entry.category], entry],
    }))

    const writingSound = new Audio(diaryWritingSound)
    writingSound.volume = 0.65
    writingSound.play().catch(() => {})

    setIsDiaryUpdated(true)
    clearTimeout(diaryNotificationTimerRef.current)
    diaryNotificationTimerRef.current = setTimeout(() => {
      setIsDiaryUpdated(false)
    }, 3500)
  }

  useEffect(() => () => {
    clearTimeout(diaryNotificationTimerRef.current)
  }, [])


  // =========================================================
  // NOVO JOGO
  // =========================================================

  const startGame = () => {
    jogadorRef.current = criarPersonagem('Hades', '3', 'male')

    setIntroPhase('closing')
  }


  // =========================================================
  // CONTINUAR
  // =========================================================

  const continueGame = () => {
    jogadorRef.current = criarPersonagem('Hades', '3', 'male')

    setPage('game')
    setIntroPhase('opening')
  }


  // =========================================================
  // DIÁLOGO DO CORVO
  // =========================================================

  const handleCrowDialogueClose = () => {
    setCrowDialogue(null)
    gameApiRef.current?.crowUnlock()
  }


  const handleCrowOption = (opt) => {

    setCrowDialogue(null)

    if (opt === 'Equipar') {
      gameApiRef.current?.crowPickup()
      setHasLantern(true)
      registerDiaryEvent('CORVO_DESAPARECEU', {
        id: 'corvo-desapareceu',
        category: 'notes',
        title: 'O Corvo',
        meta: 'Novo registro',
        content: 'O corvo me esperava na entrada do vilarejo. Ele carregava uma lanterna e parecia saber que eu chegaria.',
      })
    }

    gameApiRef.current?.crowUnlock()
  }


  // =========================================================
  // COMBATE
  // =========================================================

  const handleCombatTrigger = (enemy) => {
    setCombatEnemy(enemy)
  }


  const handleCombatClose = () => {

    if (combatEnemy) {
      gameApiRef.current?.removeEnemy(combatEnemy)
    }

    setCombatEnemy(null)
  }


  // =========================================================
  // ENTER — PULAR INTRO
  // =========================================================

  useEffect(() => {

    const handleSkip = (e) => {

      if (e.key !== 'Enter') return

      skipIntroRef.current?.()
    }

    window.addEventListener('keydown', handleSkip)

    return () => {
      window.removeEventListener('keydown', handleSkip)
    }

  }, [])


  // =========================================================
  // CONTROLES DO JOGO
  // =========================================================

  useEffect(() => {

    const handleKeyDown = (e) => {

      if (page !== 'game') return
      if (isConsoleOpen) return


      if (e.key === 'Escape') {

        if (crowDialogue) return

        if (isDiaryOpen) {
          setIsDiaryOpen(false)
        }

        else if (isInventoryOpen) {
          setIsInventoryOpen(false)
        }

        else {
          setIsMenuOpen(prev => !prev)
        }
      }


      if (e.key === 'Tab') {

        e.preventDefault()

        if (!isMenuOpen && !isInventoryOpen) {
          setIsDiaryOpen(prev => !prev)
        }
      }


      if (e.key === 'i' || e.key === 'I') {

        if (!isMenuOpen && !isDiaryOpen) {
          setIsInventoryOpen(prev => !prev)
        }
      }


      // saque rápido — teclas 1-4
      const slot = parseInt(e.key) - 1

      if (
        slot >= 0 &&
        slot <= 3 &&
        !isMenuOpen &&
        !isDiaryOpen &&
        !isInventoryOpen &&
        !combatEnemy &&
        !crowDialogue
      ) {

        const item = quickSlots[slot]

        if (item && jogadorRef.current) {

          item.usar?.(jogadorRef.current)

          jogadorRef.current.removerItem?.(item)

          setQuickSlots(prev => {

            const n = [...prev]

            n[slot] = null

            return n
          })
        }
      }
    }


    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }

  }, [
    page,
    isDiaryOpen,
    isMenuOpen,
    isInventoryOpen,
    quickSlots,
    combatEnemy,
    isConsoleOpen,
    crowDialogue
  ])


  // =========================================================
  // TECLA E — CORVO
  // =========================================================

  useEffect(() => {

    const handler = (e) => {

      if (e.key !== 'e' && e.key !== 'E') return
      if (page !== 'game') return

      if (
        isMenuOpen ||
        isDiaryOpen ||
        isInventoryOpen ||
        combatEnemy ||
        crowDialogue
      ) return

      if (showCrowPrompt) {
        gameApiRef.current?.crowInteract()
      }
    }


    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }

  }, [
    page,
    showCrowPrompt,
    isMenuOpen,
    isDiaryOpen,
    isInventoryOpen,
    combatEnemy,
    crowDialogue
  ])


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div style={{ position: 'relative' }}>


      {/* =====================================================
          VINHETA DE TRANSIÇÃO
      ===================================================== */}

      {(introPhase === 'closing' || introPhase === 'intro') && (

        <motion.div

          key="vignette"

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{
            duration: 1.2,
            ease: 'easeIn'
          }}

          onAnimationComplete={() => {

            if (introPhase === 'closing') {

              setIntroPhase('intro')
              setPage('game')
            }

          }}

          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            pointerEvents: 'none',
            background:
              'radial-gradient(ellipse at center, transparent 0%, black 70%)'
          }}

        />

      )}


      {/* =====================================================
          PÁGINAS
      ===================================================== */}

      <AnimatePresence mode="wait">


        {/* ===================== HOME ===================== */}

        {page === 'home' && (

          <motion.div

            key="home"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{ duration: 0.4 }}

          >

            <MainMenu
              onNewGame={startGame}
              onContinue={continueGame}
            />

          </motion.div>

        )}


        {/* ===================== GAME ===================== */}

        {page === 'game' && (

          <motion.div

            key="game"

            initial={{ opacity: 0 }}

            animate={{
              opacity: introPhase === 'opening' ? 1 : 0
            }}

            transition={{
              duration: 1.2,
              ease: 'easeIn'
            }}

            style={{
              position: 'relative',
              zIndex: 1
            }}

          >

            <div id="game">

              <div className="noise" />


              <Suspense fallback={null}>
                <GameCanvas

                isPaused={
                  isMenuOpen ||
                  isDiaryOpen ||
                  isInventoryOpen ||
                  !!combatEnemy ||
                  !!crowDialogue
                }

                hasLantern={hasLantern}


                onReady={(api) => {

                  gameApiRef.current = api

                  api.setJogador(jogadorRef.current)


                  api.setCrowCallbacks({

                    onDialogue: (data) =>
                      setCrowDialogue(data),

                    onPrompt: (v) =>
                      setShowCrowPrompt(v)

                  })


                  // =================================================
                  // CONTINUAR — NÃO EXECUTA A INTRO
                  // =================================================

                  if (introPhase === 'opening') {

                    api.playMusic()

                    return
                  }


                  // =================================================
                  // AQUI A INTRO VISUAL COMEÇA
                  // =================================================

                  setIntroSceneActive(true)


                  // =================================================
                  // FINAL DA INTRO
                  // =================================================

                  const onComplete = () => {

                    skipIntroRef.current = null

                    setSubtitlePhase(null)

                    setIntroSceneActive(false)

                    setShowHadesTitle(false)

                    setIntroPhase('opening')


                    setTimeout(async () => {

                      const game =
                        document.getElementById('game')


                      if (
                        game &&
                        !document.fullscreenElement
                      ) {

                        try {

                          await game.requestFullscreen()

                        }

                        catch (e) {

                          console.error(e)

                        }
                      }


                      api.playMusic()

                    }, 0)
                  }


                  // =================================================
                  // PULAR INTRO
                  // =================================================

                  skipIntroRef.current = () => {

                    api.skipIntro()

                    setIntroSceneActive(false)

                    setShowHadesTitle(false)

                    onComplete()
                  }


                  // =================================================
                  // EXECUTA A INTRO
                  // =================================================

                  api.playIntro({

                    // -----------------------------------------------
                    // HADES
                    // -----------------------------------------------

                    onHadesStart: () => {

                      setSubtitlePhase('hades')

                    },


                    // -----------------------------------------------
                    // AYA
                    // -----------------------------------------------

                    onAyaStart: () => {

                      setSubtitlePhase('aya')


                      setTimeout(() => {

                        setShowHadesTitle(true)

                      }, 9000)


                      setTimeout(() => {

                        setShowHadesTitle(false)

                      }, 13000)

                    },


                    // -----------------------------------------------
                    // FINAL
                    // -----------------------------------------------

                    onComplete

                  })

                }}


                onCombatTrigger={handleCombatTrigger}

                onConsoleToggle={setIsConsoleOpen}

                />
              </Suspense>


              {/* ===================================================
                  MENU
              =================================================== */}

              <AnimatePresence>

                {isMenuOpen && (

                  <GameMenu

                    onResume={() =>
                      setIsMenuOpen(false)
                    }

                    onQuit={() => {

                      setIsMenuOpen(false)

                      setPage('home')

                    }}

                    onOpenDiary={() => {

                      setIsMenuOpen(false)

                      setIsDiaryOpen(true)

                    }}

                  />

                )}

              </AnimatePresence>


              {/* ===================================================
                  DIÁRIO
              =================================================== */}

              <AnimatePresence>

                {isDiaryOpen && (

                  <Diary

                    isOpen={isDiaryOpen}

                    onClose={() =>
                      setIsDiaryOpen(false)
                    }

                    entries={diaryEntries}

                  />

                )}

              </AnimatePresence>


              {/* ===================================================
                  INVENTÁRIO
              =================================================== */}

              <AnimatePresence>

                {isInventoryOpen && (

                  <Inventory

                    jogador={jogadorRef.current}

                    quickSlots={quickSlots}

                    setQuickSlots={setQuickSlots}

                    onClose={() =>
                      setIsInventoryOpen(false)
                    }

                  />

                )}

              </AnimatePresence>


              <QuickSlotHUD
                quickSlots={quickSlots}
              />

              <KeybindGuide />

              {isDiaryUpdated && (
                <div className="diary-update-notification" role="status">
                  DIÁRIO ATUALIZADO
                </div>
              )}


              {/* ===================================================
                  DIÁLOGO DO CORVO
              =================================================== */}

              {crowDialogue && (

                <CrowDialogueBox

                  data={crowDialogue}

                  onClose={handleCrowDialogueClose}

                  onOption={handleCrowOption}

                />

              )}


              {/* ===================================================
                  COMBATE
              =================================================== */}

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


      {/* =========================================================
          INTRO VISUAL

          IMPORTANTE:
          Agora ela é ativada no INÍCIO da intro,
          e não em onHadesStart.
      ========================================================= */}

      <AnimatePresence>

        {introSceneActive && (

          <IntroScene
            key="intro-scene"
            showHades={showHadesTitle}
          />

        )}

      </AnimatePresence>


      {/* =========================================================
          LEGENDAS
      ========================================================= */}

      {subtitlePhase && (

        <IntroSubtitles
          phase={subtitlePhase}
        />

      )}

    </div>

  )
}


export default App
