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

export function FiguresIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="20" width="22" height="2" rx="1" fill={color}/>
      <rect x="4" y="8" width="4" height="13" rx="1" fill={color}/>
      <rect x="16" y="13" width="4" height="8" rx="1" fill={color}/>
      <rect x="10" y="3" width="4" height="18" rx="1" fill={color}/>
    </svg>
  )
}

export function DatasetIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M16.692 9.99799C18.2433 9.31732 19.019 8.49099 19.019 7.51899C19.019 6.54699 18.2433 5.72099 16.692 5.04099C15.1407 4.36099 13.2497 4.02032 11.019 4.01899C8.78833 4.01765 6.89433 4.35832 5.337 5.04099C3.779 5.72032 3 6.54632 3 7.51899C3 8.49165 3.779 9.31799 5.337 9.99799C6.895 10.678 8.789 11.0183 11.019 11.019C13.249 11.0197 15.14 10.6793 16.692 9.99799ZM13.476 12.365C14.3153 12.2357 15.104 12.0447 15.842 11.792C16.58 11.5393 17.23 11.2263 17.792 10.853C18.354 10.4797 18.763 10.048 19.019 9.55799V12.519C18.763 13.009 18.354 13.4407 17.792 13.814C17.2307 14.188 16.5807 14.5013 15.842 14.754C15.104 15.0067 14.3153 15.1973 13.476 15.326C12.6367 15.4547 11.8113 15.519 11 15.519C10.1887 15.519 9.36333 15.4547 8.524 15.326C7.68467 15.1973 6.899 15.0067 6.167 14.754C5.435 14.5013 4.78833 14.188 4.227 13.814C3.66567 13.44 3.25667 13.0087 3 12.52V9.55799C3.256 10.0473 3.665 10.479 4.227 10.853C4.78833 11.2263 5.435 11.5397 6.167 11.793C6.899 12.045 7.68467 12.2357 8.524 12.365C9.36333 12.4943 10.1887 12.5587 11 12.558C11.8113 12.5573 12.6367 12.493 13.476 12.365ZM13.476 16.865C14.3147 16.7357 15.1033 16.5447 15.842 16.292C16.5807 16.0393 17.2307 15.7263 17.792 15.353C18.3533 14.9797 18.7623 14.548 19.019 14.058V17C18.763 17.49 18.354 17.9217 17.792 18.295C17.2307 18.6683 16.5807 18.9817 15.842 19.235C15.104 19.4877 14.3153 19.6783 13.476 19.807C12.6367 19.9357 11.8113 20 11 20C10.1887 20 9.36333 19.9357 8.524 19.807C7.68467 19.6783 6.899 19.4877 6.167 19.235C5.435 18.9823 4.78833 18.669 4.227 18.295C3.66567 17.921 3.25667 17.4893 3 17V14.058C3.25667 14.5473 3.66567 14.979 4.227 15.353C4.78833 15.727 5.435 16.0403 6.167 16.293C6.899 16.5457 7.68467 16.7363 8.524 16.865C9.36333 16.9937 10.1887 17.058 11 17.058C11.8113 17.058 12.6367 16.9943 13.476 16.865Z" fill={color}/>
    </svg>
  )
}

// ── OXA design-system icons ──────────────────────────────────
// Source: _assets/OXA/icons/  Hardcoded fills replaced with currentColor.

export function OxaArrowUpIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M13.0001 20H11.0001V8L5.50008 13.5L4.08008 12.08L12.0001 4.16L19.9201 12.08L18.5001 13.5L13.0001 8V20Z" fill={color}/>
    </svg>
  )
}

export function OxaArrowDownIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.92 4H12.92V16L18.42 10.5L19.84 11.92L11.92 19.84L4 11.92L5.42 10.5L10.92 16V4Z" fill={color}/>
    </svg>
  )
}

export function OxaChevronLeftIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z" fill={color}/>
    </svg>
  )
}

export function OxaCloseIcon({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" stroke={color} strokeWidth="2"/>
    </svg>
  )
}

export function SupplementaryIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7.75V6.875C3 6.37772 3.1873 5.90081 3.5207 5.54917C3.8541 5.19754 4.30628 5 4.77778 5H17.2222C17.6937 5 18.1459 5.19754 18.4793 5.54917C18.8127 5.90081 19 6.37772 19 6.875V7.75M3 7.75V13.375M3 7.75H8.33333M19 7.75V13.375M19 7.75H8.33333M3 13.375V17.125C3 17.6223 3.1873 18.0992 3.5207 18.4508C3.8541 18.8025 4.30628 19 4.77778 19H8.33333M3 13.375H8.33333M8.33333 7.75V13.375M19 13.375V17.125C19 17.6223 18.8127 18.0992 18.4793 18.4508C18.1459 18.8025 17.6937 19 17.2222 19H8.33333M19 13.375H8.33333M8.33333 19V13.375M13.6667 7.75V19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 6.5C3 6.10218 3.1873 5.72064 3.5207 5.43934C3.8541 5.15804 4.30628 5 4.77778 5H17.2222C17.6937 5 18.1459 5.15804 18.4793 5.43934C18.8127 5.72064 19 6.10218 19 6.5V8H3V6.5Z" fill={color}/>
    </svg>
  )
}
