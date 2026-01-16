import React from "react";

// PUBLIC_INTERFACE
export default function Controls({
  difficulty,
  onChangeDifficulty,
  onNewPuzzle,
  onValidate,
  onSolve,
  onClearBoard,
  busy,
}) {
  /** Controls row for puzzle lifecycle and API calls. */
  return (
    <div className="controls" aria-label="Sudoku controls">
      <div className="controls-row">
        <div className="difficulty">
          <label className="label" htmlFor="difficulty">
            Difficulty
          </label>
          <select
            id="difficulty"
            className="select"
            value={difficulty}
            onChange={(e) => onChangeDifficulty(e.target.value)}
            disabled={busy}
            aria-label="Select puzzle difficulty"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onNewPuzzle}
          disabled={busy}
        >
          New Puzzle
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onValidate}
          disabled={busy}
        >
          Validate
        </button>

        <button
          type="button"
          className="btn btn-success"
          onClick={onSolve}
          disabled={busy}
        >
          Solve
        </button>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={onClearBoard}
          disabled={busy}
        >
          Clear Board
        </button>
      </div>
    </div>
  );
}
