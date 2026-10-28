import { Link } from 'react-router-dom';

// Figma "Nav/Logo" (119×28) contained no exported asset in get_design_context. Wordmark placeholder; swap for the SVG when provided.
export const Logo = ({ className = '' }: { className?: string }) => (
  <Link to="/" aria-label="Nepbelle home" className={`font-serif text-[30px] font-extrabold leading-7 tracking-[0.18em] text-white ${className}`}>
    NEPBELLE
  </Link>
);
