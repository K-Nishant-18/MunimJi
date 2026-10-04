import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} /> Previous
      </button>
      <span className="text-sm font-semibold text-ink-500">
        Page <span className="text-ink-900">{page + 1}</span> of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        className="btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight size={15} />
      </button>
    </div>
  );
}
