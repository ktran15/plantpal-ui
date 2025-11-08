export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--bark)] bg-[var(--wheat)] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
        <a href="#" className="text-[10px] text-[var(--soil)] hover:text-[var(--sprout)] transition-colors">
          PRIVACY
        </a>
        <span className="text-[var(--bark)]">·</span>
        <a href="#" className="text-[10px] text-[var(--soil)] hover:text-[var(--sprout)] transition-colors">
          TERMS
        </a>
      </div>
    </footer>
  );
}
