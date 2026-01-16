import React, { useMemo } from "react";

/**
 * SudokuGrid renders the 9x9 grid.
 * Styling is driven by CSS classes in App.css.
 */

// PUBLIC_INTERFACE
export default function SudokuGrid({
  board,
  fixedMap,
  selected,
  conflicts,
  onSelectCell,
}) {
  /** Render the Sudoku board with selection/highlighting and conflict styles. */
  const conflictSet = useMemo(() => conflicts || new Set(), [conflicts]);

  return (
    <div
      className="sudoku-grid"
      role="grid"
      aria-label="Sudoku grid"
      aria-rowcount={9}
      aria-colcount={9}
    >
      {board.map((row, r) =>
        row.map((val, c) => {
          const isSelected = selected && selected.r === r && selected.c === c;
          const inSelectedRow = selected && selected.r === r;
          const inSelectedCol = selected && selected.c === c;

          const isFixed = fixedMap?.[r]?.[c] === true;
          const hasConflict = conflictSet.has(`${r},${c}`);

          const blockRight = c === 2 || c === 5;
          const blockBottom = r === 2 || r === 5;

          const className = [
            "cell",
            isFixed ? "cell-fixed" : "cell-editable",
            inSelectedRow || inSelectedCol ? "cell-highlight" : "",
            isSelected ? "cell-selected" : "",
            hasConflict ? "cell-conflict" : "",
            blockRight ? "cell-block-right" : "",
            blockBottom ? "cell-block-bottom" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              className={className}
              role="gridcell"
              aria-rowindex={r + 1}
              aria-colindex={c + 1}
              aria-selected={isSelected ? "true" : "false"}
              aria-label={`Row ${r + 1} Column ${c + 1}${
                val ? ` value ${val}` : " empty"
              }${isFixed ? ", fixed" : ""}${hasConflict ? ", conflict" : ""}`}
              onClick={() => onSelectCell(r, c)}
            >
              <span className="cell-value">{val === 0 ? "" : val}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
