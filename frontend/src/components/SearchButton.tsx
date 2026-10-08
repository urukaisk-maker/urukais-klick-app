export function SearchButton() {
  const handleClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full mb-4 flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm text-slate-400 hover:text-white"
    >
      <span className="text-lg">🔍</span>
      <span className="flex-1 text-left">Buscar...</span>
      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] border border-white/10">
        Ctrl K
      </kbd>
    </button>
  );
}