import { useEffect } from 'react';
import GameShell from '@/mystery/GameShell.jsx';
import Atmosphere from '@/components/chrome/Atmosphere/index.jsx';
import { usePersistMystery } from '@/mystery/state/mystery';

export default function MysteryPage() {
  usePersistMystery();

  useEffect(() => {
    const prev = document.title;
    document.title = 'Tread Office';
    return () => { document.title = prev; };
  }, []);

  return (
    <>
      <GameShell />
      <Atmosphere />
    </>
  );
}
