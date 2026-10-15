const base = { fill: 'currentColor', 'aria-hidden': true } as const;

export const LinkIcon = () => (
  <svg {...base} width="14" height="14" viewBox="0 0 24 24"><path d="M10.6 13.4a1 1 0 0 1 0-1.4l3-3a1 1 0 1 1 1.4 1.4l-3 3a1 1 0 0 1-1.4 0Zm-1.8 4.6-1.4 1.4a4 4 0 0 1-5.6-5.6l3-3a4 4 0 0 1 5.6 0 1 1 0 1 1-1.4 1.4 2 2 0 0 0-2.8 0l-3 3a2 2 0 1 0 2.8 2.8l1.4-1.4a1 1 0 0 1 1.4 1.4Zm6.4-12-1.4 1.4a1 1 0 0 1-1.4-1.4l1.4-1.4a4 4 0 0 1 5.6 5.6l-3 3a4 4 0 0 1-5.6 0 1 1 0 0 1 1.4-1.4 2 2 0 0 0 2.8 0l3-3a2 2 0 1 0-2.8-2.8Z"/></svg>
);
export const TrashIcon = () => (
  <svg {...base} width="14" height="14" viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Z"/></svg>
);
export const ChevronIcon = () => (
  <svg {...base} width="14" height="14" viewBox="0 0 24 24"><path d="M3 7h18l-9 11L3 7Z"/></svg>
);
export const PlayIcon = () => (
  <svg {...base} width="20" height="20" viewBox="0 0 24 24"><path d="M5 3l16 9-16 9V3Z"/></svg>
);
export const StopIcon = () => (
  <svg {...base} width="20" height="20" viewBox="0 0 24 24"><rect x="5" y="3" width="5" height="18" rx="1"/><rect x="14" y="3" width="5" height="18" rx="1"/></svg>
);
export const LogIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2h8l5 5v7h-2V8h-4V4H6v10H4V4a2 2 0 0 1 2-2Z" fill="currentColor"/>
    <path d="M4 14v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <text x="12" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" fontFamily="Arial">LOG</text>
  </svg>
);
export const PlusIcon = () => (
  <svg {...base} width="14" height="14" viewBox="0 0 24 24"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z"/></svg>
);
