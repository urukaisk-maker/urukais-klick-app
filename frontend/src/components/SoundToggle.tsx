import { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';

export function SoundToggle() {
  const { toggleSound, isSoundEnabled, play } = useFeedback();
  const [enabled, setEnabled] = useState(isSoundEnabled());

  const handleToggle = () => {
    const newState = toggleSound();
    setEnabled(newState);
    if (newState) {
      // Feedback del toggle
      setTimeout(() => play('click'), 50);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
      title={enabled ? 'Silenciar sonidos' : 'Activar sonidos'}
    >
      <span className="text-lg">{enabled ? '🔊' : '🔇'}</span>
    </button>
  );
}