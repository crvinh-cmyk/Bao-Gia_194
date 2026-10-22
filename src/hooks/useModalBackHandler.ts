import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to manage browser history & back button handling for modals on mobile & desktop.
 * 1. When modal opens (isOpen === true), pushes a state entry to history via window.history.pushState.
 * 2. Listens for 'popstate' (phone physical back button, browser back button, swipe-to-back gesture).
 *    When back is pressed, closes the modal via onClose() without navigating away from the page.
 * 3. When modal closes via UI (close button [X], backdrop click, ESC), automatically calls window.history.back()
 *    to pop the modal history entry and keep the history stack clean and accurate.
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void) {
  const isPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    // Push modal state into browser history when opened
    try {
      window.history.pushState({ modalOpen: true }, '');
      isPushedRef.current = true;
    } catch {
      // In case environment restricts pushState
      isPushedRef.current = false;
    }

    const handlePopState = (event: PopStateEvent) => {
      // User pressed phone/browser back button: browser already popped the state
      isPushedRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal was closed via UI action (button [X] or backdrop click)
      // and the pushed history entry is still present, pop it to clean up history
      if (isPushedRef.current) {
        isPushedRef.current = false;
        try {
          if (window.history.state?.modalOpen) {
            window.history.back();
          }
        } catch {
          // Ignore history errors
        }
      }
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    onCloseRef.current();
  }, []);

  return { handleClose };
}
