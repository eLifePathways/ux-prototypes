export function SearchIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke={color} strokeWidth="1.75" strokeLinecap="round"/>
    </svg>
  )
}

export function ArrowRightIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <line x1="2" y1="8" x2="13" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="9,4 13,8 9,12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

export function CloseIcon({ size = 12, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <line x1="1.5" y1="1.5" x2="10.5" y2="10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10.5" y1="1.5" x2="1.5" y2="10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function CaretDownIcon({ size = 10 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 10 6" aria-hidden="true">
      <path d="M5 6L0 0H10L5 6Z" fill="currentColor" />
    </svg>
  )
}

export function CaretUpIcon({ size = 10 }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 10 6" aria-hidden="true">
      <path d="M5 0L10 6H0L5 0Z" fill="currentColor" />
    </svg>
  )
}

export function ChevronDownIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronUpIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="18 15 12 9 6 15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ArrowUpIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="5 12 12 5 19 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ArrowLeftIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polyline points="12 5 5 12 12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13.6656 0.9375L6.33437 10.6031L2 6.27187L0 8.27188L6.66563 14.9375L16 2.9375L13.6656 0.9375Z" fill="currentColor"/>
    </svg>
  )
}

export function DownloadIcon({ size = 18 }) {
  return (
    <svg width={size} height={Math.round(size * 24 / 18)} viewBox="0 0 18 24" fill="none" aria-hidden="true">
      <path d="M2 21H16V19H2V21ZM16 10H12V4H6V10H2L9 17L16 10Z" fill="currentColor"/>
    </svg>
  )
}

export function QuoteIcon({ size = 23 }) {
  return (
    <svg width={size} height={Math.round(size * 24 / 23)} viewBox="0 0 23 24" fill="none" aria-hidden="true">
      <path d="M2 5H10.5V12.65L6.018 19H3.295L5.961 13H2V5ZM12.5 5H21V12.65L16.518 19H13.795L16.461 13H12.5V5Z" fill="currentColor"/>
    </svg>
  )
}
