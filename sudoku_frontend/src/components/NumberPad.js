import React from "react";

// PUBLIC_INTERFACE
export default function NumberPad({ onInput, onClearCell, onUndo, disabled }) {
  /** On-screen number pad for Sudoku input. */
  return (
    <div className="numberpad" aria-label="Number pad">
      <div className="numberpad-grid" role="group" aria-label="Digits 1 to 9">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className="np-btn"
            onClick={() => onInput(n)}
            disabled={disabled}
            aria-label={`Enter ${n}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="numberpad-actions" role="group" aria-label="Cell actions">
        <button
          type="button"
          className="np-btn np-btn-secondary"
          onClick={onClearCell}
          disabled={disabled}
          aria-label="Clear cell"
        >
          Clear
        </button>
        <button
          type="button"
          className="np-btn np-btn-secondary"
          onClick={onUndo}
          disabled={disabled}
          aria-label="Undo"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
