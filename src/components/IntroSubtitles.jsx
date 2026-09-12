import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HADES_LINES = [
  { text: 'Em um mundo tão repleto de sofrimento e impurezas,', start: 4.2,  duration: 3.0 },
  { text: 'nasce sua voz e seu sorriso.',                        start: 8.0,  duration: 1.9 },
  { text: 'Mesmo que eu seja incapaz de vê-lo,',                start: 10.0, duration: 1.3 },
  { text: 'mesmo que você seja incapaz de sentir-me,',          start: 13.0, duration: 3.0 },
  { text: 'eu sei que:',                                         start: 16.0, duration: 1.7 },
  { text: 'Nessa infindável escuridão,',                        start: 18.5, duration: 1.0 },
  { text: 'sua luz iluminará um caminho divergente do meu.',    start: 20.5, duration: 3.5 },
];

const AYA_LINES = [
  { text: 'Todos ainda têm salvação.',          start: 0.2,  duration: 1.6 },
  { text: 'Todos ainda têm esperança;',         start: 2.0,  duration: 3.8 },
  { text: 'e a minha é que você não demore.',   start: 4.0,  duration: 3.2 },
  { text: 'Estarei te esperando.',              start: 7.5, duration: 0.9 },
  { text: 'HADES',                              start: 9.0, duration: 4.0, big: true },
];

export function IntroSubtitles({ phase }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (!phase) return;
    setCurrent(null);
    const lines = phase === 'hades' ? HADES_LINES : AYA_LINES;
    const timers = [];

    lines.forEach((line) => {
      timers.push(setTimeout(() => setCurrent(line),  line.start * 1000));
      timers.push(setTimeout(() => setCurrent(null), (line.start + line.duration) * 1000));
    });

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  return (
    <AnimatePresence mode="wait">
      {current && (
        <motion.div
          key={current.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: current.big ? 'center' : 'flex-end',
            justifyContent: 'center',
            paddingBottom: current.big ? 0 : '10vh',
          }}
        >
          <p style={{
            color: 'white',
            fontFamily: 'serif',
            fontSize: current.big ? '15vw' : '1.4rem',
            fontWeight: current.big ? '900' : '400',
            letterSpacing: current.big ? '0.2em' : '0.05em',
            textAlign: 'center',
            textShadow: '0 0 30px rgba(255,255,255,0.3)',
            margin: 0,
            padding: '0 2rem',
            lineHeight: 1.4,
          }}>
            {current.text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
