import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import paginaDuplaUrl from '../assets/Diary/diario.png';

import './Diary.css';


/* =========================================================
   SEÇÕES DO DIÁRIO
   ========================================================= */

const SECTIONS = [
    {
        id: 'docs',
        label: 'Docs',
    },
    {
        id: 'transcripts',
        label: 'Record',
    },
    {
        id: 'creatures',
        label: 'Creature',
    },
    {
        id: 'places',
        label: 'Places',
    },
    {
        id: 'notes',
        label: 'Notes',
    },
];


/* =========================================================
   CONTEÚDO
   ========================================================= */

const EMPTY_ENTRIES = { docs: [], transcripts: [], creatures: [], places: [], notes: [] };


/* =========================================================
   COMPONENTE
   ========================================================= */

export function Diary({ isOpen, onClose, entries = EMPTY_ENTRIES }) {

    const [activeSection, setActiveSection] = useState('creatures');


    /* -------------------------------------------------------
       NAVEGAÇÃO POR TECLADO
       ------------------------------------------------------- */

    const selectedIndex = SECTIONS.findIndex(
        (section) => section.id === activeSection
    );


    useEffect(() => {

        if (!isOpen) return;


        const handleKeyDown = (e) => {

            if (e.key === 'Escape') {

                e.preventDefault();

                onClose?.();

                return;
            }


            if (e.key === 'ArrowUp') {

                e.preventDefault();

                const previousIndex =
                    (selectedIndex - 1 + SECTIONS.length) %
                    SECTIONS.length;

                setActiveSection(
                    SECTIONS[previousIndex].id
                );
            }


            if (e.key === 'ArrowDown') {

                e.preventDefault();

                const nextIndex =
                    (selectedIndex + 1) %
                    SECTIONS.length;

                setActiveSection(
                    SECTIONS[nextIndex].id
                );
            }
        };


        window.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };

    }, [isOpen, selectedIndex, onClose]);


    /* -------------------------------------------------------
       FECHADO
       ------------------------------------------------------- */

    if (!isOpen) {
        return null;
    }


    /* -------------------------------------------------------
       SEÇÃO ATUAL
       ------------------------------------------------------- */

    const currentSection = SECTIONS.find(
        (section) => section.id === activeSection
    );


    /* -------------------------------------------------------
       CRIATURA ATUAL
       ------------------------------------------------------- */

    const currentCreature = entries.creatures[0];


    return (

        <div
            className="diary-overlay"
            onClick={onClose}
        >

            <motion.div
                className="diary-container"

                initial={{
                    opacity: 0,
                    scale: 0.96,
                }}

                animate={{
                    opacity: 1,
                    scale: 1,
                }}

                exit={{
                    opacity: 0,
                    scale: 0.96,
                }}

                transition={{
                    duration: 0.25,
                }}

                onClick={(e) =>
                    e.stopPropagation()
                }
            >

                <div className="diary-book">


                    {/* =================================================
                       PÁGINA DUPLA
                       ================================================= */}

                    <img
                        className="diary-page-background"
                        src={paginaDuplaUrl}
                        alt=""
                        draggable="false"
                    />


                    {/* =================================================
                       PÁGINA ESQUERDA
                       ================================================= */}

                    <div className="diary-left-content">

                        <AnimatePresence
                            mode="wait"
                        >

                            <motion.div
                                key={activeSection}

                                initial={{
                                    opacity: 0,
                                    x: -6,
                                }}

                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    x: 6,
                                }}

                                transition={{
                                    duration: 0.18,
                                }}
                            >


                                {/* -----------------------------------------
                                   TÍTULO
                                   ----------------------------------------- */}

                                <h2 className="diary-title">
                                    {currentSection.label}
                                </h2>


                                {/* =========================================
                                   CRIATURAS
                                   ========================================= */}

                                {activeSection === 'creatures' && (
                                    currentCreature ? (
                                        <div className="diary-creature">

                                            <div className="diary-creature-polaroid">
                                                <div className="diary-polaroid-image">
                                                    <img
                                                        src={currentCreature.image}
                                                        alt={currentCreature.name}
                                                        draggable="false"
                                                    />
                                                </div>
                                                <div className="diary-polaroid-caption">
                                                    {currentCreature.name.toUpperCase()}
                                                </div>
                                            </div>

                                            <div className="diary-creature-description">
                                                <h3>{currentCreature.name}</h3>
                                                <div className="diary-creature-subtitle">{currentCreature.subtitle}</div>
                                                <p>{currentCreature.description}</p>
                                            </div>

                                        </div>
                                    ) : (
                                        <p className="diary-empty">Nenhuma criatura registrada ainda.</p>
                                    )
                                )}


                                {/* =========================================
                                   OUTRAS SEÇÕES
                                   ========================================= */}

                                {activeSection !== 'creatures' && (

                                    <div className="diary-section-content">

                                        <div className="diary-content-list">

                                            {entries[activeSection]?.length > 0
                                                ? entries[activeSection].map((item, index) => (
                                                    <div key={index} className="diary-card">
                                                        <div className="diary-card-title">{item.title}</div>
                                                        <div className="diary-card-meta">{item.meta}</div>
                                                        <div className="diary-card-text">{item.content}</div>
                                                    </div>
                                                ))
                                                : <p className="diary-empty">Nenhuma entrada ainda.</p>
                                            }

                                        </div>

                                    </div>
                                )}

                            </motion.div>

                        </AnimatePresence>

                    </div>


                    {/* =================================================
                       PÁGINA DIREITA
                       ================================================= */}

                    <div className="diary-right-content">

                        <AnimatePresence
                            mode="wait"
                        >

                            <motion.div
                                key={`right-${activeSection}`}

                                initial={{
                                    opacity: 0,
                                    x: 6,
                                }}

                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    x: -6,
                                }}

                                transition={{
                                    duration: 0.18,
                                }}
                            >

                                {/* =========================================
                                   OBSERVAÇÕES DA CRIATURA
                                   ========================================= */}

                                {activeSection === 'creatures' && currentCreature && (

                                    <div className="diary-creature-observations">

                                        <h4>
                                            Observações
                                        </h4>


                                        <ul>

                                            {currentCreature.observations.map(
                                                (observation, index) => (

                                                    <li key={index}>
                                                        {observation}
                                                    </li>

                                                )
                                            )}

                                        </ul>

                                    </div>
                                )}


                                {/* =========================================
                                   ESPAÇO DIREITO PARA OUTRAS SEÇÕES
                                   ========================================= */}

                                {activeSection !== 'creatures' && (

                                    <div className="diary-right-empty">

                                        {/* 
                                         * A página direita fica livre
                                         * para futuras informações,
                                         * imagens, anotações etc.
                                         */}

                                    </div>
                                )}

                            </motion.div>

                        </AnimatePresence>

                    </div>


                    {/* =================================================
                       MARCADORES
                       ================================================= */}

                    <nav
                        className="diary-tabs"
                        aria-label="Seções do diário"
                    >

                        {SECTIONS.map((section) => (

                            <button
                                key={section.id}

                                type="button"

                                className={
                                    `diary-tab ${
                                        activeSection === section.id
                                            ? 'active'
                                            : ''
                                    }`
                                }

                                onClick={() =>
                                    setActiveSection(section.id)
                                }

                                aria-label={section.label}

                                title={section.label}
                            >

                                <span className="diary-tab-label">
                                    {section.label}
                                </span>

                            </button>

                        ))}

                    </nav>

                </div>

            </motion.div>

        </div>
    );
}