'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type Props = {
  onClose: () => void;
  labelledBy: string;
  className?: string;
  panelClassName?: string;
  maxWidth: number;
  maxHeight: number;
  children: React.ReactNode;
};

let lockCount = 0;

const DialogShell = forwardRef<HTMLDivElement, Props>(function DialogShell({
  onClose, labelledBy, className = '', panelClassName = '', maxWidth, maxHeight, children,
}: Props, forwardedRef){
  const panel = useRef<HTMLDivElement>(null);
  useImperativeHandle(forwardedRef, () => panel.current as HTMLDivElement);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape'){ e.stopPropagation(); onClose(); return; }
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
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    lockCount += 1;

    return () => {
      document.removeEventListener('keydown', onKey, true);
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0){
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      prevFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className={`dlgShell ${className}`}
      role="presentation"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={panel}
        className={`dlgShell__panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby={labelledBy}
        style={{ ['--dlg-w' as string]: `${maxWidth}px`, ['--dlg-h' as string]: `${maxHeight}px` }}
      >
        {children}
      </div>
    </div>
  );
});

export default DialogShell;
