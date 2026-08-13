import { useEffect, useRef, type RefObject } from 'react';

export function RefreshIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M21 3v6h-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64L3 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 21v-6h6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v4M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoadingSpinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function useDialogFocus(
  open: boolean,
  onClose: () => void,
  dialogRef: RefObject<HTMLDivElement | null>,
  initialFocusRef: RefObject<HTMLButtonElement | null>,
) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const selector =
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(selector),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        dialogRef.current.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() =>
      initialFocusRef.current?.focus(),
    );

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, [dialogRef, initialFocusRef, open]);
}

export function ResetModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  useDialogFocus(open, onClose, dialogRef, cancelButtonRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-demo-title"
        tabIndex={-1}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] p-7 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent" />

        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
          <WarningIcon className="h-7 w-7 text-red-400" />
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-red-400/80">
          Ação irreversível
        </p>
        <h2 id="reset-demo-title" className="mt-2 text-2xl font-black tracking-tight text-white">
          Resetar demo?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Isso vai restaurar o sistema para o estado original de demonstração.
        </p>

        <ul className="mt-4 space-y-2">
          {[
            'Funcionários adicionados depois do seed',
            'Fotos salvas localmente dos funcionários',
            'Alterações na escala e faltas registradas',
            'Histórico de ações do sistema',
            'Dados de sessão salvos no navegador',
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 text-sm text-slate-400"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-400/10 text-[10px] font-bold text-red-400">
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/8 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_30px_rgba(239,68,68,0.3)] transition-all hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Resetando...
              </>
            ) : (
              <>
                <RefreshIcon className="h-4 w-4" />
                Resetar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function WelcomeModal({
  open,
  onContinue,
}: {
  open: boolean;
  onContinue: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  useDialogFocus(open, onContinue, dialogRef, continueButtonRef);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-demo-title"
        tabIndex={-1}
        className="relative w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] p-7 shadow-[0_40px_100px_rgba(0,0,0,0.82)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/30 to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-[-54px] h-36 w-36 rounded-full bg-orange-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-[-56px] h-28 w-28 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <WarningIcon className="h-7 w-7 text-orange-300" />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-300/80">
            Atenção
          </p>
        </div>

        <h2 id="welcome-demo-title" className="mt-5 text-2xl font-black tracking-tight text-white sm:text-[2rem] leading-tight">
          Antes de iniciar e após concluir a experiência, clique no botão{' '}
          <span className="text-orange-300">Resetar demo</span> para reiniciar o
          sistema.
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Ao reiniciar o sistema, você garante a experiência conforme ela foi
          originalmente projetada. Além disso, ao realizar o reset após o uso,
          assegura a remoção dos dados inseridos no site.
        </p>

        <div className="mt-7 flex justify-end">
          <button
            ref={continueButtonRef}
            type="button"
            onClick={onContinue}
            className="flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 px-6 text-sm font-bold uppercase tracking-[0.1em] text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(249,115,22,0.34)]"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
