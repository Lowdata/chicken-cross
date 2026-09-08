'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { setFrozen } from '../../../lib/landing/freeze.js';

type Props = {
  open: boolean;
  onClose: () => void;
  onExited?: () => void;
  labelledBy: string;
  className?: string;
  panelClassName?: string;
  maxWidth: number;
  maxHeight: number;
  children: React.ReactNode;
};

let lockCount = 0;
let freezeCount = 0;

const DialogShell = forwardRef<HTMLDivElement, Props>(function DialogShell({
  open, onClose, onExited, labelledBy, className = '', panelClassName = '', maxWidth, maxHeight, children,
}: Props, forwardedRef){
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const onExitedRef = useRef(onExited);
  const [rendered, setRendered] = useState(open);
  const [state, setState] = useState<'open' | 'closing' | 'closed'>(open ? 'open' : 'closed');
  useImperativeHandle(forwardedRef, () => panel.current as HTMLDivElement);

  useEffect(() => {
    onCloseRef.current = onClose;
    onExitedRef.current = onExited;
  }, [onClose, onExited]);

  const finishExit = useCallback(() => {
    setState('closed');
    setRendered(false);
    onExitedRef.current?.();
  }, []);

  useEffect(() => {
    if (open){
      setRendered(true);
      setState('open');
      return;
    }
    if (!rendered) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      finishExit();
      return;
    }
    setState('closing');
    const fallback = window.setTimeout(finishExit, 280);
    return () => window.clearTimeout(fallback);
  }, [finishExit, open, rendered]);

  useEffect(() => {
    if (!rendered) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape'){ e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !panel.current) return;
      const focusables = Array.from(
        panel.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);

    if (lockCount === 0){
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    freezeCount += 1;
    setFrozen(true);

    return () => {
      document.removeEventListener('keydown', onKey, true);
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0){
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
      freezeCount = Math.max(0, freezeCount - 1);
      if (freezeCount === 0) setFrozen(false);
      prevFocus?.focus?.();
    };
  }, [rendered]);

  if (!rendered) return null;

  return (
    <div
      className={`dlgShell ${className}`}
      data-state={state}
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget) onCloseRef.current(); }}
    >
      <div
        ref={panel}
        className={`dlgShell__panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={labelledBy}
        style={{ ['--dlg-w' as string]: `${maxWidth}px`, ['--dlg-h' as string]: `${maxHeight}px` }}
        onAnimationEnd={e => {
          if (state === 'closing' && e.target === e.currentTarget) finishExit();
        }}
      >
        {children}
      </div>
    </div>
  );
});

export default DialogShell;
