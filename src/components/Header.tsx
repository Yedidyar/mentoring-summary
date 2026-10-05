import type { NavId } from '../types/resource';

type HeaderProps = {
  activeNav: NavId;
  onNav: (nav: NavId) => void;
};

export function Header({ activeNav, onNav }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="header-brand">
        <button type="button" className="brand-btn" onClick={() => onNav('home')} aria-label="דף הבית">
          <span className="brand-title">מנטורינג</span>
          <span className="brand-sub">מרכז הידע</span>
        </button>
      </div>
      <nav className="header-nav" aria-label="ניווט ראשי">
        <button
          type="button"
          className={`nav-link ${activeNav === 'all' ? 'active' : ''}`}
          onClick={() => onNav('all')}
        >
          כל המשאבים
        </button>
        <button
          type="button"
          className={`nav-link ${activeNav === 'recent' ? 'active' : ''}`}
          onClick={() => onNav('recent')}
        >
          חדש
        </button>
        <button
          type="button"
          className={`nav-link ${activeNav === 'favorites' ? 'active' : ''}`}
          onClick={() => onNav('favorites')}
        >
          מועדפים
        </button>
        <button
          type="button"
          className={`nav-link ${activeNav === 'about' ? 'active' : ''}`}
          onClick={() => onNav('about')}
        >
          על המאגר
        </button>
      </nav>
    </header>
  );
}
