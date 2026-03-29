const pt = (cx: number, cy: number, r: number, angleDeg: number) => {
  const a = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.sin(a), y: cy - r * Math.cos(a) }
}

export function CardBackBloodpact() {
  const cx = 100, cy = 140
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="c2-bg" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#1a0410" /><stop offset="60%" stopColor="#0c020a" /><stop offset="100%" stopColor="#050105" />
        </radialGradient>
        <radialGradient id="c2-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b0020" stopOpacity="0.22" /><stop offset="100%" stopColor="#8b0020" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="c2-center" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3a0c06" /><stop offset="100%" stopColor="#100208" />
        </radialGradient>
        <pattern id="c2-scales" x="0" y="0" width="20" height="14" patternUnits="userSpaceOnUse">
          <path d="M0,14 A10,8 0 0,1 20,14" fill="none" stroke="#5a0018" strokeWidth="0.55" strokeOpacity="0.7" />
          <path d="M-10,7 A10,8 0 0,1 10,7" fill="none" stroke="#5a0018" strokeWidth="0.55" strokeOpacity="0.7" />
          <path d="M10,7 A10,8 0 0,1 30,7" fill="none" stroke="#5a0018" strokeWidth="0.55" strokeOpacity="0.7" />
        </pattern>
        <radialGradient id="c2-eye" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c8780a" stopOpacity="0.9" /><stop offset="100%" stopColor="#3a0c06" stopOpacity="0" />
        </radialGradient>
        <filter id="c2-glow-f">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="200" height="280" rx="4" fill="url(#c2-bg)" />
      <rect width="200" height="280" rx="4" fill="url(#c2-scales)" />
      <circle cx={cx} cy={cy} r="105" fill="url(#c2-glow)" />
      <rect x="5" y="5" width="190" height="270" rx="3" fill="none" stroke="#c07030" strokeWidth="1" strokeOpacity="0.55" />
      <rect x="9" y="9" width="182" height="262" rx="2" fill="none" stroke="#8b0020" strokeWidth="0.5" strokeOpacity="0.4" />
      <g stroke="#c07030" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeOpacity="0.7">
        <path d="M5 28 L5 5 L28 5" /><path d="M172 5 L195 5 L195 28" />
        <path d="M5 252 L5 275 L28 275" /><path d="M172 275 L195 275 L195 252" />
      </g>
      <g fill="#c07030" fillOpacity="0.5">
        <polygon points="5,5 9,9 5,13 1,9" /><polygon points="195,5 199,9 195,13 191,9" />
        <polygon points="5,275 9,271 5,267 1,271" /><polygon points="195,275 199,271 195,267 191,271" />
      </g>
      <ellipse cx={cx} cy={cy} rx="55" ry="72" fill="url(#c2-center)" stroke="#c07030" strokeWidth="1.2" strokeOpacity="0.65" />
      <ellipse cx={cx} cy={cy} rx="48" ry="63" fill="none" stroke="#8b0020" strokeWidth="0.6" strokeOpacity="0.5" />
      <ellipse cx={cx} cy={cy} rx="38" ry="50" fill="none" stroke="#c07030" strokeWidth="0.8" strokeOpacity="0.45" />
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * 2 * Math.PI
        return <circle key={i} cx={cx + 52 * Math.sin(a)} cy={cy - 70 * Math.cos(a)} r="2.5" fill="none" stroke="#c07030" strokeWidth="0.6" strokeOpacity="0.5" />
      })}
      <ellipse cx={cx} cy={cy} rx="14" ry="20" fill="#c8780a" fillOpacity="0.12" filter="url(#c2-glow-f)" />
      <ellipse cx={cx} cy={cy} rx="14" ry="20" fill="#1a0408" stroke="#c07030" strokeWidth="0.8" strokeOpacity="0.7" />
      <ellipse cx={cx} cy={cy} rx="8" ry="16" fill="#3a0a04" stroke="#c8780a" strokeWidth="0.6" strokeOpacity="0.8" />
      <ellipse cx={cx} cy={cy} rx="2.5" ry="12" fill="#080204" />
      <ellipse cx={cx - 3} cy={cy - 5} rx="2" ry="3" fill="#c8780a" fillOpacity="0.4" />
      {Array.from({ length: 12 }, (_, i) => {
        const p1 = pt(cx, cy, 22, i * 30), p2 = pt(cx, cy, 35, i * 30)
        return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#c07030" strokeWidth="0.4" strokeOpacity="0.35" />
      })}
      {[0, 90, 180, 270].map((deg, i) => {
        const p = { x: cx + 38 * Math.sin((deg * Math.PI) / 180), y: cy - 50 * Math.cos((deg * Math.PI) / 180) }
        return <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c07030" fillOpacity="0.25" stroke="#c07030" strokeWidth="0.6" strokeOpacity="0.6" />
      })}
      <g fill="#c07030" fillOpacity="0.3">
        {['ᛋ','ᛖ','ᚱ','ᛈ','ᛖ','ᚾ','ᛏ'].map((r, i) => <text key={i} x={65 + i * 11} y={17} textAnchor="middle" fontSize="6" fontFamily="serif">{r}</text>)}
        {['ᛋ','ᛖ','ᚱ','ᛈ','ᛖ','ᚾ','ᛏ'].map((r, i) => <text key={i} x={65 + i * 11} y={271} textAnchor="middle" fontSize="6" fontFamily="serif">{r}</text>)}
      </g>
    </svg>
  )
}
