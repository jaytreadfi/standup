import { useEffect, useRef } from 'react';

/**
 * Modal-dialog focus management for the overlays.
 *
 * On mount, moves focus into the panel (its first focusable control, e.g. the
 * CLOSE button); on unmount, restores focus to whatever was focused before the
 * overlay opened (the triggering F-key / button). Combined with the background
 * `.shell` being marked `inert` while an overlay is open (see GameShell), this
 * satisfies the aria-modal contract: Tab is confined to the dialog and focus
 * returns to the trigger on close.
 *
 * @returns {import('react').MutableRefObject<HTMLElement|null>} ref for the panel
 */
export function useDialogFocus() {
  const panelRef = useRef(null);

  useEffect(() => {
    const prevActive = document.activeElement;
    const panel = panelRef.current;
    if (panel) {
      const focusable = panel.querySelector(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (focusable ?? panel).focus?.();
    }
    return () => {
      if (prevActive && typeof prevActive.focus === 'function') {
        prevActive.focus();
      }
    };
  }, []);

  return panelRef;
}
