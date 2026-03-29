const pt = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

export function CardBackVeilMandala() {
  const cx = 100, cy = 140
  const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const isMain = i % 3 === 0
    const rInner = isMain ? 71 : 73
    const p1 = pt(cx, cy, rInner, i * 15)
    const p2 = pt(cx, cy, 78, i * 15)
    return { ...p1, x2: p2.x, y2: p2.y, isMain }
  })

  const spokes = Array.from({ length: 8 }, (_, i) => ({
    inner: pt(cx, cy, 30, i * 45),
    outer: pt(cx, cy, 62, i * 45),
    rune: pt(cx, cy, 88, i * 45),
  }))

  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="c1-bg" cx="50%" cy="43%" r="65%">
          <stop offset="0%" stopColor="#1e0c3c" />
          <stop offset="55%" stopColor="#0e0622" />
          <stop offset="100%" stopColor="#040210" />
        </radialGradient>
        <radialGradient id="c1-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8840e0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8840e0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c1-gold-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8c97a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#e8c97a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="280" rx="4" fill="url(#c1-bg)" />
      <circle cx={cx} cy={cy} r="95" fill="url(#c1-glow)" />
      <circle cx={cx} cy={cy} r="70" fill="url(#c1-gold-glow)" />
      <rect x="5" y="5" width="190" height="270" rx="3" fill="none" stroke="#e8c97a" strokeWidth="0.9" strokeOpacity="0.55" />
      <rect x="9" y="9" width="182" height="262" rx="2" fill="none" stroke="#e8c97a" strokeWidth="0.35" strokeOpacity="0.22" />
      <g stroke="#e8c97a" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeOpacity="0.75">
        <path d="M5 25 L5 5 L25 5" /><path d="M175 5 L195 5 L195 25" />
        <path d="M5 255 L5 275 L25 275" /><path d="M175 275 L195 275 L195 255" />
      </g>
      <circle cx={cx} cy={cy} r="80" fill="none" stroke="#e8c97a" strokeWidth="0.5" strokeOpacity="0.3" />
      {ticks.map((t, i) => (
        <line key={i} x1={t.x} y1={t.y} x2={t.x2} y2={t.y2}
          stroke="#e8c97a" strokeWidth={t.isMain ? 0.9 : 0.4} strokeOpacity={t.isMain ? 0.6 : 0.22} />
      ))}
      <circle cx={cx} cy={cy} r="68" fill="none" stroke="#e8c97a" strokeWidth="0.9" strokeOpacity="0.55" />
      <circle cx={cx} cy={cy} r="50" fill="none" stroke="#d4a8ff" strokeWidth="0.6" strokeOpacity="0.42" />
      <circle cx={cx} cy={cy} r="32" fill="none" stroke="#d4a8ff" strokeWidth="0.8" strokeOpacity="0.52" />
      <circle cx={cx} cy={cy} r="14" fill="none" stroke="#e8c97a" strokeWidth="0.6" strokeOpacity="0.5" />
      {spokes.map((s, i) => (
        <line key={i} x1={s.inner.x} y1={s.inner.y} x2={s.outer.x} y2={s.outer.y}
          stroke="#e8c97a" strokeWidth="0.5" strokeOpacity="0.35" />
      ))}
      {spokes.map((s, i) => {
        const a = (i * 45 * Math.PI) / 180
        const nx = Math.sin(a), ny = -Math.cos(a), tx = Math.cos(a), ty = Math.sin(a), sz = 4.5
        const pts = [[s.outer.x + nx * sz, s.outer.y + ny * sz],[s.outer.x + tx * sz * 0.6, s.outer.y + ty * sz * 0.6],[s.outer.x - nx * sz, s.outer.y - ny * sz],[s.outer.x - tx * sz * 0.6, s.outer.y - ty * sz * 0.6]].map(p => p.join(',')).join(' ')
        return <polygon key={i} points={pts} fill="#e8c97a" fillOpacity="0.35" stroke="#e8c97a" strokeWidth="0.5" strokeOpacity="0.65" />
      })}
      {spokes.map((s, i) => (
        <circle key={i} cx={s.inner.x} cy={s.inner.y} r="2.5" fill="#d4a8ff" fillOpacity="0.12" stroke="#d4a8ff" strokeWidth="0.6" strokeOpacity="0.5" />
      ))}
      {spokes.map((s, i) => (
        <text key={i} x={s.rune.x} y={s.rune.y + 3} textAnchor="middle" fontSize="7" fontFamily="serif" fill="#e8c97a" fillOpacity="0.45">{RUNES[i]}</text>
      ))}
      <polygon
        points={Array.from({ length: 6 }, (_, i) => { const p = pt(cx, cy, 11, i * 60); return `${p.x.toFixed(2)},${p.y.toFixed(2)}` }).join(' ')}
        fill="#d4a8ff" fillOpacity="0.18" stroke="#d4a8ff" strokeWidth="0.9" strokeOpacity="0.6"
      />
      <circle cx={cx} cy={cy} r="2.5" fill="#e8c97a" fillOpacity="0.8" />
      {Array.from({ length: 16 }, (_, i) => { const p = pt(cx, cy, 50, i * 22.5 + 11.25); return <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#d4a8ff" fillOpacity={i % 2 === 0 ? 0.35 : 0.15} /> })}
      {['ᛏ','ᛁ','ᚹ','ᛖ','ᛁ','ᛚ'].map((r, i) => (
        <text key={i} x={74 + i * 9} y={17} textAnchor="middle" fontSize="5.5" fontFamily="serif" fill="#e8c97a" fillOpacity="0.3">{r}</text>
      ))}
      {['ᛏ','ᛁ','ᚹ','ᛖ','ᛁ','ᛚ'].map((r, i) => (
        <text key={i} x={74 + i * 9} y={270} textAnchor="middle" fontSize="5.5" fontFamily="serif" fill="#e8c97a" fillOpacity="0.3">{r}</text>
      ))}
    </svg>
  )
}
