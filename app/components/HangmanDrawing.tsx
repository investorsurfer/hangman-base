export default function HangmanDrawing({ wrong }: { wrong: number }) {
  return (
    <svg viewBox="0 0 200 220" className="w-48 h-48 mx-auto" strokeLinecap="round">
      {/* Gallows */}
      <line x1="20" y1="210" x2="180" y2="210" stroke="#4b5563" strokeWidth="4" />
      <line x1="60" y1="210" x2="60" y2="20" stroke="#4b5563" strokeWidth="4" />
      <line x1="60" y1="20" x2="130" y2="20" stroke="#4b5563" strokeWidth="4" />
      <line x1="130" y1="20" x2="130" y2="45" stroke="#4b5563" strokeWidth="4" />

      {/* Head */}
      {wrong >= 1 && (
        <circle cx="130" cy="58" r="13" stroke="#ef4444" strokeWidth="3" fill="none" />
      )}
      {/* Body */}
      {wrong >= 2 && (
        <line x1="130" y1="71" x2="130" y2="130" stroke="#ef4444" strokeWidth="3" />
      )}
      {/* Left arm */}
      {wrong >= 3 && (
        <line x1="130" y1="85" x2="105" y2="110" stroke="#ef4444" strokeWidth="3" />
      )}
      {/* Right arm */}
      {wrong >= 4 && (
        <line x1="130" y1="85" x2="155" y2="110" stroke="#ef4444" strokeWidth="3" />
      )}
      {/* Left leg */}
      {wrong >= 5 && (
        <line x1="130" y1="130" x2="105" y2="165" stroke="#ef4444" strokeWidth="3" />
      )}
      {/* Right leg */}
      {wrong >= 6 && (
        <line x1="130" y1="130" x2="155" y2="165" stroke="#ef4444" strokeWidth="3" />
      )}
    </svg>
  );
}
