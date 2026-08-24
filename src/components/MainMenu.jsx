import { useEffect, useState } from 'react'
import './MainMenu.css'
import deadbornLogo from '../assets/images/deadborn-logo-oficial.png'

export function MainMenu({ onNewGame }) {

    const [selectedOption, setSelectedOption] = useState(0)

    const options = [
        {
            label: 'Novo Jogo',
            action: onNewGame
        },
        {
            label: 'Continuar',
            action: () => console.log('Continuar')
        },
        {
            label: 'Opções',
            action: () => console.log('Opções')
        },
        {
            label: 'Sair',
            action: () => console.log('Sair')
        }
    ]

    useEffect(() => {

        const handleKeyDown = (e) => {

            if (e.key === 'ArrowUp') {

                setSelectedOption(prev =>
                    prev === 0
                        ? options.length - 1
                        : prev - 1
                )
            }

            if (e.key === 'ArrowDown') {

                setSelectedOption(prev =>
                    prev === options.length - 1
                        ? 0
                        : prev + 1
                )
            }

            if (e.key === 'Enter') {
                options[selectedOption].action()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }

    }, [selectedOption])

    return (
        <div id="main-menu">

            <div className="main-menu-background" />

            <div className="noise" />

            <div className="main-menu-content">

           
                <img
                className="main-menu-logo" 
                src={deadbornLogo} 
                alt="DEADBORN" 
                />

                <nav>
                    {options.map((option, index) => (

                        <button
                            key={option.label}
                            className={
                                selectedOption === index
                                    ? 'selected'
                                    : ''
                            }
                            onMouseEnter={() => setSelectedOption(index)}
                            onClick={option.action}
                        >
                            {option.label}
                        </button>

                    ))}
                </nav>

                    </div>
            </div>
    )
}