import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import capaUrl from '../assets/Diary/capa do diario.jpg';
import './Diary.css';

const SECTIONS = [
  { id: 'docs',        label: 'Documentos',   icon: '📜' },
  { id: 'transcripts', label: 'Transcrições', icon: '📻' },
  { id: 'people',      label: 'Pessoas',      icon: '👥' },
  { id: 'places',      label: 'Lugares',      icon: '🏰' },
  { id: 'notes',       label: 'Anotações',    icon: '✍️' },
];

const MOCK_DATA = {
  docs: [
    { title: 'Relatório Médico', meta: 'Hospital Municipal - Manchado de sangue', content: 'O paciente apresenta sinais severos de desassociação. A névoa parece afetar não apenas a visão, mas a percepção do tempo.' },
    { title: 'Carta Queimada', meta: 'Casa Paroquial - Parcialmente legível', content: '...eles estão vindo. Não abra a porta. O conhecimento é a luz, mas a luz atrai as mariposas...' }
  ],
  transcripts: [
    { title: 'Gravação 01: "A Criança"', meta: 'Duração: 02:47', content: '...ela não chorava. Apenas olhava. Seus olhos eram escuros demais. Disseram que era a filha da Mãe, mas eu sei que não.' }
  ],
  people: [
    { title: 'Carmo da Silva', meta: 'Parteira - Desaparecida', content: 'Conhecia os segredos da cidade. Foi vista pela última vez perto do poço.' },
    { title: 'Hades', meta: 'O Protagonista', content: 'Um homem que fechou as portas da humanidade para se proteger dos horrores do conhecimento.' }
  ],
  places: [
    { title: 'Hospital Municipal', meta: 'Fechado desde 1958', content: 'Muitos desaparecimentos ocorreram aqui. O cheiro de ferro e coisas velhas ainda persiste.' }
  ],
  notes: [
    { title: 'A Névoa', meta: 'Observação pessoal', content: 'Ela observa. Mesmo quando você fecha os olhos. Este lugar não quer ser esquecido.' }
  ]
};

export function Diary({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('docs');
  const selectedIndex = SECTIONS.findIndex(s => s.id === activeSection);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSection(SECTIONS[(selectedIndex - 1 + SECTIONS.length) % SECTIONS.length].id);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSection(SECTIONS[(selectedIndex + 1) % SECTIONS.length].id);
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="diary-overlay" onClick={onClose}>
      <motion.div
        className="diary-container"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Capa */}
        <div className="diary-cover-img">
          <img src={capaUrl} alt="Capa do Diário" />
        </div>

        {/* Páginas */}
        <div className="diary-pages">
          {/* Esquerda: índice */}
          <div className="diary-page diary-page-left">
            <h2 className="diary-title">Índice</h2>
            <div className="diary-menu">
              {SECTIONS.map((section) => (
                <div
                  key={section.id}
                  className={`diary-menu-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <span>{section.icon}</span>
                  {section.label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'auto', fontSize: '12px', fontStyle: 'italic', opacity: 0.6 }}>
              "A verdade sempre se esconde nas entrelinhas."
            </div>
          </div>

          {/* Direita: conteúdo */}
          <div className="diary-page diary-page-right">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h2 className="diary-title">{SECTIONS.find(s => s.id === activeSection).label}</h2>
                <div className="diary-content-list">
                  {MOCK_DATA[activeSection].map((item, index) => (
                    <div key={index} className="diary-card">
                      <div className="diary-card-title">{item.title}</div>
                      <div className="diary-card-meta">{item.meta}</div>
                      <div className="diary-card-text">{item.content}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
