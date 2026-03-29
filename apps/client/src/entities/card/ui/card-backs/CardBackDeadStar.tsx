const pt = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

const polyPoints = (cx: number, cy: number, outerR: number, innerR: number, points: number) => {
  const verts: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const p = pt(cx, cy, r, (i * 180) / points)
    verts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`)
  }
  return verts.join(' ')
}

export function CardBackDeadStar() {
  const cx = 100, cy = 140
  const starPoints = polyPoints(cx, cy, 55, 24, 8)
  const star2Points = Array.from({ length: 16 }, (_, i) => {
    const p = pt(cx, cy, i % 2 === 0 ? 40 : 18, i * 22.5 + 22.5)
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }).join(' ')

  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="c3-bg" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="#020c16" /><stop offset="55%" stopColor="#010810" /><stop offset="100%" stopColor="#000308" />
        </radialGradient>
        <radialGradient id="c3-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a7870" stopOpacity="0.2" /><stop offset="100%" stopColor="#0a7870" stopOpacity="0" />
        </radialGradient>
        <pattern id="c3-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.7" fill="#0a5848" fillOpacity="0.4" />
        </pattern>
        <filter id="c3-glow-f">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="200" height="280" rx="4" fill="url(#c3-bg)" />
      <rect width="200" height="280" rx="4" fill="url(#c3-dots)" />
      <circle cx={cx} cy={cy} r="90" fill="url(#c3-glow)" />
      <rect x="5" y="5" width="190" height="270" rx="3" fill="none" stroke="#0a7870" strokeWidth="0.8" strokeOpacity="0.5" />
      <rect x="9" y="9" width="182" height="262" rx="2" fill="none" stroke="#0a7870" strokeWidth="0.35" strokeOpacity="0.25" />
      <g stroke="#0a7870" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeOpacity="0.65">
        <path d="M5 22 L5 5 L22 5" /><path d="M178 5 L195 5 L195 22" />
        <path d="M5 258 L5 275 L22 275" /><path d="M178 275 L195 275 L195 258" />
      </g>
      <circle cx={cx} cy={cy} r="82" fill="none" stroke="#0a7870" strokeWidth="0.4" strokeOpacity="0.3" strokeDasharray="2 4" />
      {Array.from({ length: 32 }, (_, i) => {
        const isMain = i % 4 === 0
        const p1 = pt(cx, cy, isMain ? 74 : 76, i * 11.25), p2 = pt(cx, cy, 80, i * 11.25)
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#0a7870" strokeWidth={isMain ? 0.8 : 0.35} strokeOpacity={isMain ? 0.55 : 0.2} />
      })}
      <circle cx={cx} cy={cy} r="72" fill="none" stroke="#0a7870" strokeWidth="0.7" strokeOpacity="0.45" />
      <circle cx={cx} cy={cy} r="58" fill="none" stroke="#c0b898" strokeWidth="0.4" strokeOpacity="0.2" />
      <polygon points={starPoints} fill="#0a3830" fillOpacity="0.25" stroke="#0a7870" strokeWidth="0.9" strokeOpacity="0.6" />
      <polygon points={Array.from({ length: 8 }, (_, i) => { const p = pt(cx, cy, 55, i * 45); return `${p.x.toFixed(2)},${p.y.toFixed(2)}` }).join(' ')} fill="none" stroke="#0a7870" strokeWidth="0.4" strokeOpacity="0.25" />
      <polygon points={`${cx},${cy - 58} ${cx + 58},${cy} ${cx},${cy + 58} ${cx - 58},${cy}`} fill="none" stroke="#c0b898" strokeWidth="0.6" strokeOpacity="0.3" />
      <polygon points={star2Points} fill="#062a24" fillOpacity="0.4" stroke="#0a7870" strokeWidth="0.6" strokeOpacity="0.5" />
      <line x1={cx} y1={cy - 60} x2={cx} y2={cy + 60} stroke="#0a7870" strokeWidth="0.35" strokeOpacity="0.25" />
      <line x1={cx - 60} y1={cy} x2={cx + 60} y2={cy} stroke="#0a7870" strokeWidth="0.35" strokeOpacity="0.25" />
      <circle cx={cx} cy={cy} r="16" fill="#041814" stroke="#0a7870" strokeWidth="0.9" strokeOpacity="0.7" />
      <circle cx={cx} cy={cy} r="10" fill="#062e28" stroke="#0a7870" strokeWidth="0.6" strokeOpacity="0.6" />
      <ellipse cx={cx} cy={cy} rx="3" ry="8" fill="#000a08" />
      <circle cx={cx} cy={cy} r="16" fill="none" stroke="#0a9880" strokeWidth="1.5" strokeOpacity="0.3" filter="url(#c3-glow-f)" />
      {Array.from({ length: 8 }, (_, i) => { const p = pt(cx, cy, 55, i * 45); return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#0a7870" fillOpacity="0.6" stroke="#c0b898" strokeWidth="0.5" strokeOpacity="0.4" /> })}
      {['✦','⋆','✦','⋆','✦','⋆','✦','⋆'].map((s, i) => {
        const p = pt(cx, cy, 91, i * 45 + 22.5)
        return <text key={i} x={p.x} y={p.y + 3} textAnchor="middle" fontSize="6" fill="#0a7870" fillOpacity="0.35">{s}</text>
      })}
    </svg>
  )
}
