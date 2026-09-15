import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import eye1Img from '../assets/intro/Eye1.png';
import eye2Img from '../assets/intro/Eye2.png';
import eye3Img from '../assets/intro/Eye3.png';
import eye4Img from '../assets/intro/Eye4.png';

// Todos nas bordas/cantos, centro livre
const EYES = [
  // canto superior esquerdo
  { src: eye1Img, top: '3%',  left: '2%',   size: '7vw',   delay: 2.0, opacity: 0.50, rotate: 0   },
  { src: eye3Img, top: '14%', left: '-2%',  size: '4vw',   delay: 5.5, opacity: 0.22, rotate: -8  },
  // borda superior
  { src: eye2Img, top: '-1%', left: '22%',  size: '5vw',   delay: 7.0, opacity: 0.18, rotate: 5   },
  { src: eye4Img, top: '2%',  left: '68%',  size: '3.5vw', delay: 9.0, opacity: 0.20, rotate: -3  },
  // canto superior direito
  { src: eye2Img, top: '5%',  left: '88%',  size: '9vw',   delay: 3.5, opacity: 0.45, rotate: 10  },
  { src: eye4Img, top: '18%', left: '93%',  size: '3vw',   delay: 6.0, opacity: 0.20, rotate: 0   },
  // borda esquerda
  { src: eye4Img, top: '38%', left: '-1%',  size: '6vw',   delay: 4.5, opacity: 0.35, rotate: -15 },
  { src: eye1Img, top: '58%', left: '1%',   size: '3.5vw', delay: 8.0, opacity: 0.18, rotate: 5   },
  // borda direita
  { src: eye3Img, top: '42%', left: '94%',  size: '5vw',   delay: 6.5, opacity: 0.30, rotate: 12  },
  { src: eye1Img, top: '62%', left: '91%',  size: '8vw',   delay: 4.0, opacity: 0.40, rotate: -5  },
  // canto inferior esquerdo
  { src: eye2Img, top: '78%', left: '3%',   size: '6vw',   delay: 5.0, opacity: 0.38, rotate: 8   },
  { src: eye4Img, top: '88%', left: '-1%',  size: '3vw',   delay: 10.0,opacity: 0.15, rotate: 0   },
  // borda inferior
  { src: eye1Img, top: '91%', left: '28%',  size: '4vw',   delay: 7.5, opacity: 0.20, rotate: -6  },
  { src: eye3Img, top: '88%', left: '58%',  size: '5.5vw', delay: 8.5, opacity: 0.25, rotate: 4   },
  // canto inferior direito
  { src: eye2Img, top: '80%', left: '86%',  size: '7vw',   delay: 3.0, opacity: 0.42, rotate: -10 },
];

function RainCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops = Array.from({ length: 180 }, () => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      len:     Math.random() * 18 + 8,
      speed:   Math.random() * 4 + 3,
      opacity: Math.random() * 0.22 + 0.06,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drops.forEach(d => {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.len);
        ctx.strokeStyle = `rgba(180,200,220,${d.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        d.y += d.speed;
        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width;
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}
    />
  );
}

export function IntroScene({ showHades }) {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9990,
        background: '#000',
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <RainCanvas />

     {/* Olhos nas bordas */}
{EYES.map((eye, i) => (
  <motion.img
    key={i}
    src={eye.src}
    initial={{
      opacity: 0,
      scale: 0.95,
    }}
    animate={{
      opacity: eye.opacity,
      scale: 1,
    }}
    transition={{
      delay: eye.delay,
      duration: 2.5,
      ease: 'easeIn',
    }}
    style={{
      position: 'absolute',
      top: eye.top,
      left: eye.left,
      width: eye.size,
      objectFit: 'contain',
      filter: 'grayscale(1) contrast(1.3)',
      transform: `rotate(${eye.rotate}deg)`,
      zIndex: 2,
      pointerEvents: 'none',
    }}
  />
))}

      {/* Momento HADES */}
      <AnimatePresence>
        {showHades && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Eye3 roxo atrás */}
            <motion.img
              src={eye3Img}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.55, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: '65vw',
                maxWidth: '700px',
                objectFit: 'contain',
                filter: 'grayscale(0) sepia(1) hue-rotate(240deg) saturate(4) brightness(0.5)',
                zIndex: 6,
              }}
            />

            {/* Texto HADES */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.8em' }}
              animate={{ opacity: 1, letterSpacing: '0.15em' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                position: 'relative',
                zIndex: 7,
                margin: 0,
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 'clamp(6rem, 18vw, 16rem)',
                color: '#fff',
                textShadow: '0 0 40px rgba(100,0,180,0.6), 0 0 80px rgba(60,0,120,0.3)',
                lineHeight: 1,
              }}
            >
              HADES
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}
