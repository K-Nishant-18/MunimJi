import { X } from "lucide-react";
import { createPortal } from "react-dom";

export default function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) {
    return null;
  }

  // Portal to <body> so no transformed/animated ancestor can clip the overlay
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`mt-10 w-full ${wide ? "max-w-3xl" : "max-w-lg"} animate-popIn overflow-hidden
           rounded-2xl bg-white shadow-lift`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-900/[0.07] bg-ink-900/[0.02] px-6 py-4">
          <h3 className="text-base font-extrabold tracking-tight text-ink-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-500 transition hover:bg-ink-900/[0.06] hover:text-ink-900"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
