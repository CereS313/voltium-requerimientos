import { useState, useRef, useEffect } from 'react'

// Síntesis de sonido suave de maullido tierno al estirarse con Web Audio API
function reproducirSonido() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    // Maullido tierno ascendente de gato estirándose placenteramente
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.16)
    osc.frequency.exponentialRampToValueAtTime(530, now + 0.38)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.43)
  } catch {
    // Si el navegador bloquea audio antes de interacción, continúa sin problema
  }
}

export default function GatitoAnimado() {
  const [estirando, setEstirando] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function despertarYEstirar() {
    reproducirSonido()
    setEstirando(true)

    if (timerRef.current) clearTimeout(timerRef.current)
    // El gatito se despierta y hace el estiramiento completo durante 2.8s
    timerRef.current = setTimeout(() => {
      setEstirando(false)
    }, 2800)
  }

  return (
    <div
      className={`vt-sleeping-cat ${estirando ? 'vt-cat-stretching' : ''}`}
      onClick={despertarYEstirar}
      onTouchStart={despertarYEstirar}
      role="button"
      tabIndex={0}
      title={estirando ? '¡El gatito se está estirando!' : '¡Tócame para despertarme!'}
      aria-label="Gatito animado de Voltium"
    >
      {/* Zzz flotantes (sólo visibles cuando duerme plácidamente) */}
      {!estirando && (
        <div className="cat-zzz-box">
          <span className="cat-zzz cat-z1">z</span>
          <span className="cat-zzz cat-z2">z</span>
          <span className="cat-zzz cat-z3">Z</span>
        </div>
      )}

      {/* SVG del Gatito: Dormido vs Estiramiento idéntico a la foto de referencia */}
      <svg
        width="66"
        height="40"
        viewBox="0 0 82 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={estirando ? 'cat-svg-stretch' : 'cat-svg-sleep'}
      >
        <defs>
          {/* Degradado cálido del pelaje */}
          <linearGradient id="cat-fur" x1="10" y1="10" x2="75" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="0.6" stopColor="#d97706" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>

          {/* Degradado para la sombra / profundidad */}
          <linearGradient id="cat-fur-dark" x1="15" y1="15" x2="30" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#d97706" />
            <stop offset="1" stopColor="#92400e" />
          </linearGradient>
        </defs>

        {estirando ? (
          /* ============================================================
             ESTIRAMIENTO EXACTO DE LA FOTO (Downward Dog / Cat Bow):
             - Trasero empinado bien alto a la izquierda
             - Patas traseras firmes levantando la pelvis hacia arriba
             - Espalda curvada en tobogán cóncavo pronunciado hacia abajo
             - Pecho y cabeza agachados cerca del piso a la derecha
             - Patas delanteras estiradas larguísimas hacia adelante
             - Cola LEVANTADA verticalmente con el rulito en la punta
             ============================================================ */
          <g className="cat-pose-stretch">
            {/* 1. COLA VERTICAL CON EL RULO CARACTERÍSTICO EN LA PUNTA (igual a la foto) */}
            <g className="cat-tail-curl-group">
              <path
                d="M 18 17 C 17 11, 15 7, 15 4 C 15 1, 20.5 0.5, 22.5 3.5 C 24.5 6.5, 21.5 9, 18.5 8"
                stroke="#b45309"
                strokeWidth="4.2"
                strokeLinecap="round"
                fill="none"
                className="cat-tail-curl-path"
              />
              <path
                d="M 18 17 C 17 11, 15 7, 15 4 C 15 1, 20.5 0.5, 22.5 3.5 C 24.5 6.5, 21.5 9, 18.5 8"
                stroke="#d97706"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* 2. PATA TRASERA IZQUIERDA (FONDO) - Firme en el suelo */}
            <path
              d="M 14 26 L 12 38 C 12 39.5, 14 40, 16 40 L 18 29 Z"
              fill="url(#cat-fur-dark)"
            />

            {/* 3. PATA DELANTERA IZQUIERDA (FONDO) - Estirada hacia adelante */}
            <path
              d="M 52 35 L 72 39 C 74 39.5, 75 40, 73 40.5 L 50 37 Z"
              fill="url(#cat-fur-dark)"
            />

            {/* 4. CUERPO CON CURVATURA PRONUNCIADA DE ESTIRAMIENTO (DEEP CONCAVE SWAYBACK) */}
            {/* Desde cadera alta (18, 16) desciende en curva hasta el pecho bajo (54, 36) */}
            <path
              d="M 17 22 C 16 15, 22 14, 25 17 C 33 25, 42 32, 54 34 C 57 34.5, 58 37, 54 38 C 44 38, 32 36, 23 34 L 20 39 C 19 40, 16 40, 15 39 L 16 26 Z"
              fill="url(#cat-fur)"
            />

            {/* 5. RAYAS ATIGRADAS (TABBY STRIPES) EN EL LOMO COMO EN LA FOTO */}
            <path d="M 23 18 C 22 22, 21 26, 20 29" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 27 20 C 27 24, 26 28, 25 31" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 32 23 C 32 27, 31 30, 31 33" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 38 27 C 38 30, 38 33, 37 35" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 44 30 C 44 33, 44 35, 43 36" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />

            {/* 6. PATA TRASERA DERECHA (PRIMER PLANO) - Firme elevando la cadera */}
            <path
              d="M 20 20 C 23 20, 24 24, 22 29 L 21 39 C 21 40, 18 40, 18 39 L 18 27 Z"
              fill="url(#cat-fur)"
            />
            <ellipse cx="19.5" cy="39.5" rx="2.5" ry="1" fill="#b45309" />

            {/* 7. PATA DELANTERA DERECHA (PRIMER PLANO) - Estirada al máximo hacia adelante */}
            <g className="cat-front-paw-reach">
              <path
                d="M 53 34 L 75 38.5 C 77.5 39, 78.5 40, 76.5 40.5 C 74.5 41, 72 40.5, 68 40 L 51 37 Z"
                fill="url(#cat-fur)"
              />
              {/* Deditos estirados al final de la patita */}
              <ellipse cx="76" cy="39.8" rx="2" ry="1" fill="#fbcfe8" />
              <path d="M 74 39 L 77.5 39.5 M 74 40.5 L 77.5 40.5" stroke="#92400e" strokeWidth="0.6" strokeLinecap="round" />
            </g>

            {/* 8. CABEZA Y ROSTRO AGACHADO ENTRE LOS HOMBROS */}
            {/* Oreja izquierda (fondo) */}
            <path d="M 54 26 L 55 18 L 59 24 Z" fill="#b45309" />
            <path d="M 55.5 24 L 56 19.5 L 58.5 23.5 Z" fill="#fbcfe8" />

            {/* Oreja derecha (primer plano) */}
            <path d="M 59 25 L 62 17 L 65 25 Z" fill="#d97706" />
            <path d="M 60.5 24 L 62.5 19 L 64 24 Z" fill="#fbcfe8" />

            {/* Cabeza agachada mirando al frente */}
            <circle cx="58" cy="31" r="7.5" fill="url(#cat-fur)" />

            {/* Ojos despiertos y brillantes mirando adelante */}
            <circle cx="61" cy="30" r="2.2" fill="#0f172a" />
            <circle cx="61.6" cy="29.3" r="0.75" fill="#ffffff" />

            {/* Naricita rosa */}
            <polygon points="64.5,32 65.5,32 65,32.7" fill="#f43f5e" />
            <path d="M 63.8 33.5 Q 65 34.5 66 33.5" stroke="#78350f" strokeWidth="0.9" strokeLinecap="round" fill="none" />

            {/* Bigotes extendidos */}
            <path d="M 64 31.5 L 68 30.5 M 64 33.5 L 68 34" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round" />
          </g>
        ) : (
          /* ============================================================
             ESTADO DORMIDO: Hecho una bolita descansando plácidamente
             (Con la misma orientación: cabecita a la derecha, cola a la izquierda)
             ============================================================ */
          <g className="cat-pose-sleep" transform="translate(4, 2)">
            {/* Cola acurrucada a la izquierda */}
            <path
              className="cat-sleep-tail"
              d="M 28 28 C 22 28, 17 24, 18 18 C 19 14, 23 15, 23 19 C 23 23, 26 26, 30 27"
              stroke="#b45309"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Cuerpo hecho una bolita */}
            <g className="cat-sleep-body">
              <path
                d="M 24 28 C 24 17, 34 14, 46 14 C 56 14, 60 20, 60 28 C 60 34, 52 37, 40 37 C 28 37, 24 34, 24 28 Z"
                fill="url(#cat-fur)"
              />

              {/* Pancita clara */}
              <path d="M 32 31 C 36 27, 44 27, 48 31 C 44 34, 36 34, 32 31 Z" fill="#fef3c7" opacity="0.9" />

              {/* Rayas atigradas en el lomo durmiendo */}
              <path d="M 33 16 C 34 20, 35 24, 35 27" stroke="#92400e" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
              <path d="M 40 15 C 41 19, 41 23, 41 26" stroke="#92400e" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />
              <path d="M 47 16 C 47 20, 46 23, 46 26" stroke="#92400e" strokeWidth="1.1" strokeLinecap="round" opacity="0.75" />

              {/* Orejas dormido */}
              <path d="M 49 17 L 51 8 L 56 16 Z" fill="#b45309" />
              <path d="M 51 15 L 52 10 L 55 15 Z" fill="#fbcfe8" />
              <path d="M 56 16 L 61 7 L 63 16 Z" fill="#d97706" />
              <path d="M 57 15 L 60 10 L 62 15 Z" fill="#fbcfe8" />

              {/* Cabeza apoyada plácidamente */}
              <circle cx="55" cy="23" r="8" fill="url(#cat-fur)" />

              {/* Ojitos cerrados durmiendo feliz */}
              <path d="M 50.5 23.5 Q 52 25.5 53.5 23.5" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M 56.5 23.5 Q 58 25.5 59.5 23.5" stroke="#78350f" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <polygon points="54.5,25.5 55.5,25.5 55,26.2" fill="#f43f5e" />

              {/* Bigotitos */}
              <path d="M 58 23.5 L 62 23 M 58 25.5 L 62 26.5" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round" />

              {/* Patita recogida bajo el pecho */}
              <path d="M 43 33 C 44 31.5, 46.5 31.5, 47.5 33" stroke="#92400e" strokeWidth="1.1" strokeLinecap="round" fill="none" />
            </g>
          </g>
        )}
      </svg>
    </div>
  )
}
