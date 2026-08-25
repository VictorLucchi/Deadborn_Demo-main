import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import capaUrl from '../assets/Diary/capa do diario.jpg';
import './Diary.css';

const SECTIONS = [
  { id: 'docs', label: 'Documentos', icon: '📜' },
  { id: 'transcripts', label: 'Transcrições', icon: '📻' },
  { id: 'people', label: 'Pessoas', icon: '👥' },
  { id: 'places', label: 'Lugares', icon: '🏰' },
  { id: 'notes', label: 'Anotações', icon: '✍️' },
];

const MOCK_DATA = {
  docs: [
    {
      title: 'Relatório Médico',
      meta: 'Hospital Municipal — Manchado de sangue',
      content:
        'O paciente apresenta sinais severos de desassociação. A névoa parece afetar não apenas a visão, mas a percepção do tempo.',
    },
    {
      title: 'Carta Queimada',
      meta: 'Casa Paroquial — Parcialmente legível',
      content:
        '...eles estão vindo. Não abra a porta. O conhecimento é a luz, mas a luz atrai as mariposas...',
    },
  ],

  transcripts: [
    {
      title: 'Gravação 01: "A Criança"',
      meta: 'Duração: 02:47',
      content:
        '...ela não chorava. Apenas olhava. Seus olhos eram escuros demais. Disseram que era a filha da Mãe, mas eu sei que não.',
    },
  ],

  people: [
    {
      title: 'Carmo da Silva',
      meta: 'Parteira — Desaparecida',
      content:
        'Conhecia os segredos da cidade. Foi vista pela última vez perto do poço.',
    },
    {
      title: 'Hades',
      meta: 'O Protagonista',
      content:
        'Um homem que fechou as portas da humanidade para se proteger dos horrores do conhecimento.',
    },
  ],

  places: [
    {
      title: 'Hospital Municipal',
      meta: 'Fechado desde 1958',
      content:
        'Muitos desaparecimentos ocorreram aqui. O cheiro de ferro e coisas velhas ainda persiste.',
    },
  ],

  notes: [
    {
      title: 'A Névoa',
      meta: 'Observação pessoal',
      content:
        'Ela observa. Mesmo quando você fecha os olhos. Este lugar não quer ser esquecido.',
    },
  ],
};

export function Diary({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('docs');

  const selectedIndex = SECTIONS.findIndex(
    (section) => section.id === activeSection
  );

  /*
   * Navegação pelo teclado
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        const previousIndex =
          (selectedIndex - 1 + SECTIONS.length) % SECTIONS.length;

        setActiveSection(SECTIONS[previousIndex].id);
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();

        const nextIndex =
          (selectedIndex + 1) % SECTIONS.length;

        setActiveSection(SECTIONS[nextIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, selectedIndex, onClose]);

  const activeSectionData =
    SECTIONS.find((section) => section.id === activeSection) ||
    SECTIONS[0];

  const activeContent = MOCK_DATA[activeSection] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="diary-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="diary-container"
            initial={{
              opacity: 0,
              scale: 0.94,
              rotateX: 4,
              y: 15,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              rotateX: 4,
              y: 15,
            }}
            transition={{
              duration: 0.35,
              ease: 'easeOut',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* ==============================
                CAPA
            ============================== */}

            <div className="diary-cover-img">
              <img
                src={capaUrl}
                alt="Capa do Diário"
              />
            </div>

            {/* ==============================
                PÁGINAS
            ============================== */}

            <div className="diary-pages">

              {/* ============================
                  PÁGINA ESQUERDA
              ============================ */}

              <div className="diary-page diary-page-left">

                <div className="diary-left-content">

                  <h2 className="diary-title">
                    Índice
                  </h2>

                  <nav
                    className="diary-menu"
                    aria-label="Índice do diário"
                  >
                    {SECTIONS.map((section) => {
                      const isActive =
                        activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          type="button"
                          className={`diary-menu-item ${
                            isActive ? 'active' : ''
                          }`}
                          onClick={() =>
                            setActiveSection(section.id)
                          }
                          aria-current={
                            isActive ? 'page' : undefined
                          }
                        >
                          <span
                            className="diary-menu-icon"
                            aria-hidden="true"
                          >
                            {section.icon}
                          </span>

                          <span className="diary-menu-label">
                            {section.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                </div>

                <div className="diary-quote">
                  "A verdade sempre se esconde nas entrelinhas."
                </div>

              </div>

              {/* ============================
                  PÁGINA DIREITA
              ============================ */}

              <div className="diary-page diary-page-right">

                <AnimatePresence
                  mode="wait"
                  initial={false}
                >
                  <motion.div
                    key={activeSection}
                    className="diary-section-content"
                    initial={{
                      opacity: 0,
                      x: 10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: -10,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: 'easeOut',
                    }}
                  >

                    <h2 className="diary-title">
                      {activeSectionData.label}
                    </h2>

                    <div className="diary-content-list">

                      {activeContent.map((item, index) => (
                        <motion.article
                          key={`${activeSection}-${index}`}
                          className="diary-card"
                          initial={{
                            opacity: 0,
                            y: 6,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.05,
                          }}
                        >
                          <div className="diary-card-title">
                            {item.title}
                          </div>

                          <div className="diary-card-meta">
                            {item.meta}
                          </div>

                          <div className="diary-card-text">
                            {item.content}
                          </div>
                        </motion.article>
                      ))}

                    </div>

                  </motion.div>
                </AnimatePresence>

              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}