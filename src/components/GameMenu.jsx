import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import './GameMenu.css';

import cinereaLogo from '../assets/images/cinerea-logo.png';
import menuSymbol from '../assets/images/logo-seletor.png';


const ITEMS = [
    { label: 'Continuar', action: 'resume' },
    { label: 'Inventário', action: null },
    { label: 'Mapa', action: null },
    { label: 'Diário', action: 'diary' },
    { label: 'Configurações', action: null },
    { label: 'Salvar', action: null },
    { label: 'Menu Principal', action: 'quit' },
    { label: 'Sair do Jogo', action: null },
];


export function GameMenu({
    onResume,
    onQuit,
    onOpenDiary
}) {
    const [selected, setSelected] = useState(0);


    useEffect(() => {
        const handleKeyDown = (e) => {

            if (e.key === 'ArrowUp') {
                e.preventDefault();

                setSelected((prev) =>
                    (prev - 1 + ITEMS.length) % ITEMS.length
                );
            }


            if (e.key === 'ArrowDown') {
                e.preventDefault();

                setSelected((prev) =>
                    (prev + 1) % ITEMS.length
                );
            }


            if (e.key === 'Enter') {
                e.preventDefault();

                const item = ITEMS[selected];

                if (item.action === 'resume') {
                    onResume?.();
                }

                else if (item.action === 'quit') {
                    onQuit?.();
                }

                else if (item.action === 'diary') {
                    onOpenDiary?.();
                }
            }
        };


        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyDown
            );
        };

    }, [
        selected,
        onResume,
        onQuit,
        onOpenDiary
    ]);


    const handleItemClick = (item, index) => {

        setSelected(index);

        if (item.action === 'resume') {
            onResume?.();
        }

        else if (item.action === 'quit') {
            onQuit?.();
        }

        else if (item.action === 'diary') {
            onOpenDiary?.();
        }
    };


    return (
        <motion.div
            className="cinerea-menu-overlay"

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            exit={{ opacity: 0 }}

            transition={{
                duration: 0.35
            }}
        >

            <div className="cinerea-menu-box">

                {/* LOGO */}

                <div className="cinerea-menu-header">

                    <motion.img
                        className="cinerea-menu-icon"
                        src={cinereaLogo}
                        alt=""

                        animate={{
                            opacity: [0.75, 1, 0.75],
                            scale: [1, 1.015, 1]
                        }}

                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />


                    <h2 className="cinerea-menu-title">
                        Cinérea
                    </h2>


                    <div className="cinerea-menu-inhabitants">
                        Habitantes:
                        <br />

                        <span>
                            2
                        </span>
                    </div>


                    <div className="cinerea-menu-divider" />

                </div>


                {/* OPÇÕES */}

                <div className="cinerea-menu-items">

                    {ITEMS.map((item, index) => (

                        <MenuButton
                            key={item.label}

                            label={item.label}

                            isSelected={
                                index === selected
                            }

                            disabled={
                                !item.action
                            }

                            symbol={menuSymbol}

                            onClick={() =>
                                handleItemClick(
                                    item,
                                    index
                                )
                            }
                        />

                    ))}

                </div>


                {/* VERSÃO */}

                <div className="cinerea-menu-version">
                    v 0.4.2
                </div>

            </div>

        </motion.div>
    );
}



function MenuButton({
    label,
    isSelected,
    disabled,
    symbol,
    onClick
}) {

    return (
        <button
            type="button"

            onClick={onClick}

            className={`
                cinerea-menu-button
                ${isSelected ? 'selected' : ''}
                ${disabled ? 'disabled' : ''}
            `}
        >

            {/* SÍMBOLO ESQUERDO */}

            <img
                className="cinerea-menu-symbol"
                src={symbol}
                alt=""
            />


            {/* TEXTO */}

            <span className="cinerea-menu-label">
                {label}
            </span>


            {/* SÍMBOLO DIREITO */}

            <img
                className="cinerea-menu-symbol"
                src={symbol}
                alt=""
            />


            {/* LINHA */}

            <span className="cinerea-menu-line" />

        </button>
    );
}