import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;

  size?:
    | "sm"
    | "md"
    | "lg";
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: Props) {
  const titleId = useId();

  const dialogRef =
    useRef<HTMLDivElement>(
      null,
    );

  const closeButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const onCloseRef =
    useRef(onClose);

  useEffect(() => {
    onCloseRef.current =
      onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused =
      document.activeElement as HTMLElement | null;

    const focusableSelector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        event.preventDefault();

        onCloseRef.current();

        return;
      }

      if (
        event.key !==
          "Tab" ||
        !dialogRef.current
      ) {
        return;
      }

      const focusable =
        Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            focusableSelector,
          ),
        ).filter(
          (element) =>
            !element.hasAttribute(
              "disabled",
            ),
        );

      if (
        focusable.length ===
        0
      ) {
        event.preventDefault();

        dialogRef.current.focus();

        return;
      }

      const first =
        focusable[0];

      const last =
        focusable[
          focusable.length - 1
        ];

      if (
        event.shiftKey &&
        document.activeElement ===
          first
      ) {
        event.preventDefault();

        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement ===
          last
      ) {
        event.preventDefault();

        first.focus();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    const focusFrame =
      window.requestAnimationFrame(
        () =>
          closeButtonRef.current?.focus(),
      );

    return () => {
      window.cancelAnimationFrame(
        focusFrame,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        previousOverflow;

      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const width = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={
            titleId
          }
          tabIndex={-1}
          className={`animate-in relative w-full overflow-hidden rounded-[26px] border border-white/10 bg-[#070707] shadow-[0_32px_100px_rgba(0,0,0,0.70)] ${width}`}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between border-b border-white/8 px-5 py-4 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                ShiftPizza
              </p>

              <h2
                id={titleId}
                className="mt-1 text-base font-semibold tracking-tight text-white"
              >
                {title}
              </h2>
            </div>

            <button
              ref={
                closeButtonRef
              }
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <X
                aria-hidden="true"
                size={16}
              />
            </button>
          </div>

          <div className="relative max-h-[75vh] overflow-y-auto p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
