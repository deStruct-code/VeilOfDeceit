export function CardBackIronWraith() {
  const cx = 100, cy = 140
  return (
    <svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="c4-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0e0e1a" /><stop offset="50%" stopColor="#08080f" /><stop offset="100%" stopColor="#060610" />
        </linearGradient>
        <radialGradient id="c4-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#600010" stopOpacity="0.18" /><stop offset="100%" stopColor="#600010" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="c4-arch-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#787890" stopOpacity="0.1" /><stop offset="50%" stopColor="#787890" stopOpacity="0.06" /><stop offset="100%" stopColor="#787890" stopOpacity="0.1" />
        </linearGradient>
        <filter id="c4-blur-sm"><feGaussianBlur stdDeviation="1.5" /></filter>
        <filter id="c4-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="200" height="280" rx="4" fill="url(#c4-bg)" />
      <circle cx={cx} cy={cy} r="80" fill="url(#c4-center-glow)" />
      <rect x="5" y="5" width="190" height="270" rx="3" fill="none" stroke="#787890" strokeWidth="0.9" strokeOpacity="0.5" />
      <rect x="10" y="10" width="180" height="260" rx="2" fill="none" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.22" />
      <path d={`M 35,240 L 35,110 A 65,65 0 0,1 ${cx},52 A 65,65 0 0,1 165,110 L 165,240 Z`} fill="url(#c4-arch-grad)" stroke="#787890" strokeWidth="0.9" strokeOpacity="0.5" />
      <path d={`M 42,235 L 42,113 A 58,55 0 0,1 ${cx},60 A 58,55 0 0,1 158,113 L 158,235`} fill="none" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.25" />
      <line x1="35" y1="240" x2="165" y2="240" stroke="#787890" strokeWidth="0.8" strokeOpacity="0.4" />
      <g stroke="#787890" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeOpacity="0.65">
        <path d="M5 28 L5 5 L28 5" /><path d="M172 5 L195 5 L195 28" />
        <path d="M5 252 L5 275 L28 275" /><path d="M172 275 L195 275 L195 252" />
      </g>
      <g fill="#787890" fillOpacity="0.45">
        <circle cx="5" cy="5" r="2.5" /><circle cx="195" cy="5" r="2.5" />
        <circle cx="5" cy="275" r="2.5" /><circle cx="195" cy="275" r="2.5" />
      </g>
      {/* Crown */}
      <rect x="70" y="90" width="60" height="12" rx="1" fill="#060612" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.55" />
      <path d="M72,90 L75,70 L82,90" fill="#0c0c1a" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.55" />
      <path d="M84,90 L88,75 L94,90" fill="#0c0c1a" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.55" />
      <path d="M94,90 L100,63 L106,90" fill="#0c0c1a" stroke="#787890" strokeWidth="0.8" strokeOpacity="0.65" />
      <path d="M106,90 L112,75 L118,90" fill="#0c0c1a" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.55" />
      <path d="M118,90 L125,70 L128,90" fill="#0c0c1a" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.55" />
      <circle cx="78" cy="83" r="2.5" fill="#600010" fillOpacity="0.8" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.4" />
      <circle cx={cx} cy="79" r="3" fill="#600010" fillOpacity="0.9" stroke="#787890" strokeWidth="0.5" strokeOpacity="0.5" />
      <circle cx="122" cy="83" r="2.5" fill="#600010" fillOpacity="0.8" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.4" />
      <circle cx={cx} cy="79" r="6" fill="#800018" fillOpacity="0.2" filter="url(#c4-blur-sm)" />
      {/* Crossed swords */}
      <line x1="60" y1="155" x2="137" y2="210" stroke="#9090a8" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="63" y1="158" x2="132" y2="207" stroke="#c8c0d0" strokeWidth="0.4" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="88" y1="167" x2="72" y2="185" stroke="#787890" strokeWidth="2.5" strokeOpacity="0.65" strokeLinecap="round" />
      <circle cx="57" cy="151" r="4" fill="#060612" stroke="#787890" strokeWidth="0.8" strokeOpacity="0.6" />
      <line x1="140" y1="155" x2="63" y2="210" stroke="#9090a8" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
      <line x1="137" y1="158" x2="68" y2="207" stroke="#c8c0d0" strokeWidth="0.4" strokeOpacity="0.3" strokeLinecap="round" />
      <line x1="112" y1="167" x2="128" y2="185" stroke="#787890" strokeWidth="2.5" strokeOpacity="0.65" strokeLinecap="round" />
      <circle cx="143" cy="151" r="4" fill="#060612" stroke="#787890" strokeWidth="0.8" strokeOpacity="0.6" />
      {/* Central sigil */}
      <circle cx={cx} cy="136" r="18" fill="#080812" stroke="#787890" strokeWidth="0.7" strokeOpacity="0.45" />
      <circle cx={cx} cy="136" r="12" fill="none" stroke="#600010" strokeWidth="0.5" strokeOpacity="0.45" />
      <path d="M 88,136 A 12,11 0 0,1 112,136" fill="#0c0c1a" stroke="#9090a8" strokeWidth="0.6" strokeOpacity="0.45" />
      <ellipse cx="95" cy="133" rx="3.5" ry="3" fill="#600010" fillOpacity="0.5" />
      <ellipse cx="105" cy="133" rx="3.5" ry="3" fill="#600010" fillOpacity="0.5" />
      <path d="M 98.5,137 L100,140 L101.5,137" fill="none" stroke="#787890" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d="M 89,140 L89,145 L111,145 L111,140" fill="none" stroke="#9090a8" strokeWidth="0.5" strokeOpacity="0.35" />
      {[93, 97, 103, 107].map(x => <line key={x} x1={x} y1="141" x2={x} y2="145" stroke="#9090a8" strokeWidth="0.4" strokeOpacity="0.3" />)}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="33" y1={120 + i * 15} x2="40" y2={120 + i * 15} stroke="#787890" strokeWidth="0.5" strokeOpacity="0.25" />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="160" y1={120 + i * 15} x2="167" y2={120 + i * 15} stroke="#787890" strokeWidth="0.5" strokeOpacity="0.25" />
      ))}
      <g fill="#787890" fillOpacity="0.28" fontFamily="serif" fontSize="6">
        {['ᛗ','ᛖ','ᛗ','ᛖ','ᚾ','ᛏ','ᛟ'].map((r, i) => <text key={i} x={65 + i * 11} y={265} textAnchor="middle">{r}</text>)}
      </g>
      <polygon points="100,16 103,19 100,22 97,19" fill="#787890" fillOpacity="0.35" />
      <line x1="25" y1="19" x2="94" y2="19" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.25" />
      <line x1="106" y1="19" x2="175" y2="19" stroke="#787890" strokeWidth="0.4" strokeOpacity="0.25" />
    </svg>
  )
}
