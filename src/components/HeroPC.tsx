export default function HeroPC() {
  return (
    <svg viewBox="0 0 520 560" className="h-full w-full" role="img" aria-label="Ilustração de um computador gamer com iluminação roxa">
      <defs>
        <linearGradient id="hp-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1a1a21" />
          <stop offset="1" stopColor="#0a0a0d" />
        </linearGradient>
        <linearGradient id="hp-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9c5ff" />
          <stop offset=".5" stopColor="#8f4dff" />
          <stop offset="1" stopColor="#521ba3" />
        </linearGradient>
        <radialGradient id="hp-glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#8f4dff" stopOpacity=".55" />
          <stop offset="1" stopColor="#8f4dff" stopOpacity="0" />
        </radialGradient>
        <filter id="hp-blur">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="260" cy="520" rx="200" ry="22" fill="url(#hp-glow)" />
      <circle cx="260" cy="270" r="230" fill="url(#hp-glow)" opacity=".5" />

      <g>
        <rect x="90" y="40" width="340" height="460" rx="28" fill="#121217" stroke="#2e2e39" strokeWidth="2" />
        <rect x="104" y="54" width="312" height="432" rx="20" fill="url(#hp-glass)" stroke="#23232c" />
        <rect x="104" y="54" width="312" height="432" rx="20" fill="none" stroke="url(#hp-brand)" strokeWidth="1.5" opacity=".55" />

        <g stroke="#2e2e39" strokeWidth="1">
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${124 + i * 34} 70V470`} opacity=".4" />
          ))}
        </g>

        <rect x="128" y="86" width="150" height="104" rx="10" fill="#0e0e12" stroke="#2e2e39" />
        <rect x="144" y="100" width="118" height="76" rx="8" fill="#1a1a21" stroke="url(#hp-brand)" strokeWidth="1.4" />
        <text x="203" y="147" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="22" fill="#fff">
          CPU
        </text>
        <circle cx="203" cy="118" r="3" fill="#a974ff" className="animate-pulse-glow" />

        <g transform="translate(340 140)">
          <circle r="58" fill="#0e0e12" stroke="#2e2e39" strokeWidth="2" />
          <g className="animate-spin-slow" style={{ transformOrigin: '0 0' }}>
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d="M0 0C14-10 26-34 14-52C0-44-8-22 0 0Z" fill="#8f4dff" opacity=".85" transform={`rotate(${(360 / 7) * i})`} />
            ))}
          </g>
          <circle r="9" fill="#050507" stroke="#d9c5ff" strokeWidth="1.5" />
        </g>

        <rect x="128" y="214" width="26" height="110" rx="4" fill="#0e0e12" stroke="#2e2e39" />
        <rect x="160" y="214" width="26" height="110" rx="4" fill="#0e0e12" stroke="#2e2e39" />
        {[0, 1].map((n) => (
          <g key={n}>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x={133 + n * 32} y={222 + i * 13} width="16" height="6" rx="2" fill="#8f4dff" opacity={0.25 + (i % 3) * 0.25} className="animate-pulse-glow" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </g>
        ))}

        <g>
          <rect x="128" y="352" width="272" height="86" rx="14" fill="#0e0e12" stroke="url(#hp-brand)" strokeWidth="1.6" />
          <rect x="140" y="366" width="190" height="58" rx="8" fill="#1a1a21" />
          <text x="235" y="402" textAnchor="middle" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="24" fill="#fff">
            GPU
          </text>
          <g transform="translate(364 395)">
            <circle r="26" fill="#0a0a0d" stroke="#2e2e39" />
            <g className="animate-spin-fast" style={{ transformOrigin: '0 0' }}>
              {Array.from({ length: 5 }, (_, i) => (
                <path key={i} d="M0 0C8-6 14-18 8-26C0-22-4-10 0 0Z" fill="#a974ff" transform={`rotate(${72 * i})`} />
              ))}
            </g>
          </g>
        </g>

        <rect x="206" y="198" width="190" height="130" rx="6" fill="none" />
        <g stroke="#8f4dff" strokeWidth="1.6" fill="none" opacity=".75">
          <path d="M290 150H320V128" />
          <path d="M186 270H230V320H300" />
          <path d="M278 190V232H400" />
        </g>
        <rect x="400" y="86" width="6" height="352" rx="3" fill="url(#hp-brand)" className="animate-pulse-glow" />
      </g>

      <g className="animate-float">
        <rect x="14" y="120" width="92" height="46" rx="12" fill="#0a0a0d" stroke="#2e2e39" />
        <circle cx="34" cy="143" r="6" fill="#8f4dff" />
        <text x="48" y="140" fontFamily="Inter, sans-serif" fontSize="9" fill="#9393a3">
          Compatível
        </text>
        <text x="48" y="154" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="12" fill="#fff">
          AM5 + DDR5
        </text>
      </g>
      <g className="animate-float" style={{ animationDelay: '1.5s' }}>
        <rect x="420" y="330" width="96" height="46" rx="12" fill="#0a0a0d" stroke="#2e2e39" />
        <text x="434" y="350" fontFamily="Inter, sans-serif" fontSize="9" fill="#9393a3">
          Consumo
        </text>
        <text x="434" y="367" fontFamily="Space Grotesk, sans-serif" fontWeight="700" fontSize="14" fill="#d9c5ff">
          ~420 W
        </text>
      </g>

      <rect x="130" y="500" width="40" height="14" rx="4" fill="#23232c" />
      <rect x="350" y="500" width="40" height="14" rx="4" fill="#23232c" />
    </svg>
  );
}
