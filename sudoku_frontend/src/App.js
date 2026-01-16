import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import SudokuGrid from "./components/SudokuGrid";
import NumberPad from "./components/NumberPad";
import Controls from "./components/Controls";
import { generatePuzzle, getApiBaseUrl, solveBoard, validateBoard } from "./api/sudokuApi";
import {
  boardToKeySet,
  buildFixedMapFromBoard,
  cloneBoard,
  createEmptyBoard,
  isValidDigitValue,
  updateCell,
} from "./utils/sudokuUtils";

/**
 * Single-page Sudoku app:
 * - Grid selection + keyboard input
 * - Number pad for touch devices
 * - Backend wiring for generate/validate/solve
 */

function formatStatus(kind, message) {
  return { kind, message, id: `${Date.now()}-${Math.random()}` };
}

// PUBLIC_INTERFACE
function App() {
  /** Main entry for Sudoku frontend UI. */
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [fixedMap, setFixedMap] = useState(() => buildFixedMapFromBoard(createEmptyBoard()));
  const [selected, setSelected] = useState({ r: 0, c: 0 });

  const [difficulty, setDifficulty] = useState("easy");
  const [busy, setBusy] = useState(false);

  const [conflicts, setConflicts] = useState(() => new Set());
  const [status, setStatus] = useState(null);

  const historyRef = useRef([]);

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const pushHistory = useCallback(
    (nextBoard) => {
      historyRef.current.push(cloneBoard(nextBoard));
      // Keep memory bounded
      if (historyRef.current.length > 200) {
        historyRef.current.shift();
      }
    },
    []
  );

  const showStatus = useCallback((kind, message) => {
    setStatus(formatStatus(kind, message));
  }, []);

  const clearStatusSoon = useCallback(() => {
    // Auto-clear after 3.5s
    const id = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(id);
  }, []);

  const onSelectCell = useCallback((r, c) => {
    setSelected({ r, c });
  }, []);

  const canEditSelected = useMemo(() => {
    if (!selected) return false;
    return fixedMap?.[selected.r]?.[selected.c] !== true;
  }, [fixedMap, selected]);

  const applyDigitToSelected = useCallback(
    (digitOrZero) => {
      if (!selected) return;
      if (!isValidDigitValue(digitOrZero)) return;

      const { r, c } = selected;
      if (fixedMap?.[r]?.[c]) return;

      pushHistory(board);
      const next = updateCell(board, r, c, digitOrZero);
      setBoard(next);

      // Editing invalidates old conflict highlighting
      setConflicts(new Set());
    },
    [board, fixedMap, pushHistory, selected]
  );

  const onUndo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    setBoard(prev);
    setConflicts(new Set());
  }, []);

  const onClearCell = useCallback(() => {
    applyDigitToSelected(0);
  }, [applyDigitToSelected]);

  const onClearBoard = useCallback(() => {
    // Clear only editable cells; keep fixed clues.
    pushHistory(board);
    const next = board.map((row, r) =>
      row.map((v, c) => (fixedMap?.[r]?.[c] ? v : 0))
    );
    setBoard(next);
    setConflicts(new Set());
    showStatus("info", "Cleared editable cells.");
    clearStatusSoon();
  }, [board, clearStatusSoon, fixedMap, pushHistory, showStatus]);

  const onNewPuzzle = useCallback(async () => {
    setBusy(true);
    setConflicts(new Set());
    try {
      const res = await generatePuzzle(difficulty);
      const nextBoard = res.board;
      pushHistory(board);
      setBoard(nextBoard);
      setFixedMap(buildFixedMapFromBoard(nextBoard));
      setSelected({ r: 0, c: 0 });
      showStatus("success", `New ${difficulty} puzzle generated.`);
      clearStatusSoon();
    } catch (e) {
      showStatus("error", e.message || "Failed to generate puzzle.");
      clearStatusSoon();
    } finally {
      setBusy(false);
    }
  }, [board, clearStatusSoon, difficulty, pushHistory, showStatus]);

  const onValidate = useCallback(async () => {
    setBusy(true);
    try {
      const res = await validateBoard(board);
      if (res.valid) {
        setConflicts(new Set());
        showStatus("success", "Board is valid (no conflicts).");
      } else {
        const set = boardToKeySet(res.conflicts?.cells);
        setConflicts(set);
        showStatus("error", "Conflicts found. Highlighted in red.");
      }
      clearStatusSoon();
    } catch (e) {
      showStatus("error", e.message || "Validation failed.");
      clearStatusSoon();
    } finally {
      setBusy(false);
    }
  }, [board, clearStatusSoon, showStatus]);

  const onSolve = useCallback(async () => {
    setBusy(true);
    try {
      const res = await solveBoard(board);

      // Backend contract: { solvable: boolean, solution?: board }
      if (res.solvable && res.solution) {
        pushHistory(board);
        setBoard(res.solution);
        // Keep fixed cells as they were; solution cells remain editable in UI
        // but we will not update fixedMap to preserve "original clues" lock.
        setConflicts(new Set());
        showStatus("success", "Solved!");
      } else {
        showStatus("error", res.message || "Board is not solvable.");
      }
      clearStatusSoon();
    } catch (e) {
      showStatus("error", e.message || "Solve failed.");
      clearStatusSoon();
    } finally {
      setBusy(false);
    }
  }, [board, clearStatusSoon, pushHistory, showStatus]);

  // Keyboard handling: digits 1-9, backspace/delete/0 clears.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (busy) return;

      const key = e.key;

      // Arrow navigation
      if (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight") {
        e.preventDefault();
        setSelected((prev) => {
          const r = prev?.r ?? 0;
          const c = prev?.c ?? 0;

          if (key === "ArrowUp") return { r: Math.max(0, r - 1), c };
          if (key === "ArrowDown") return { r: Math.min(8, r + 1), c };
          if (key === "ArrowLeft") return { r, c: Math.max(0, c - 1) };
          return { r, c: Math.min(8, c + 1) };
        });
        return;
      }

      // Undo: Ctrl/Cmd+Z
      if ((e.ctrlKey || e.metaKey) && (key === "z" || key === "Z")) {
        e.preventDefault();
        onUndo();
        return;
      }

      if (key === "Backspace" || key === "Delete" || key === "0") {
        e.preventDefault();
        onClearCell();
        return;
      }

      // Digits 1-9
      if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        applyDigitToSelected(Number(key));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [applyDigitToSelected, busy, onClearCell, onUndo]);

  return (
    <div className="App">
      <main className="page">
        <div className="header">
          <div className="titleblock">
            <h1 className="title">Sudoku</h1>
            <p className="subtitle">
              Play, validate, or solve via the backend API.
              <span className="api-hint"> API: {apiBaseUrl}</span>
            </p>
          </div>
        </div>

        {status ? (
          <div className={`toast toast-${status.kind}`} role="status" aria-live="polite">
            {status.message}
          </div>
        ) : null}

        <div className="layout">
          <section className="panel panel-grid" aria-label="Sudoku board panel">
            <SudokuGrid
              board={board}
              fixedMap={fixedMap}
              selected={selected}
              conflicts={conflicts}
              onSelectCell={onSelectCell}
            />

            <div className="hintbar" aria-label="Selected cell info">
              <div className="hint">
                Selected: R{selected.r + 1}C{selected.c + 1}
                {fixedMap?.[selected.r]?.[selected.c] ? (
                  <span className="chip chip-fixed">Fixed</span>
                ) : (
                  <span className="chip chip-editable">Editable</span>
                )}
                {!canEditSelected ? (
                  <span className="chip chip-muted">Locked</span>
                ) : null}
              </div>
              <div className="hint">
                Keyboard: 1–9, Backspace/Delete to clear, Ctrl/Cmd+Z undo, arrows move
              </div>
            </div>
          </section>

          <aside className="panel panel-controls" aria-label="Controls panel">
            <Controls
              difficulty={difficulty}
              onChangeDifficulty={setDifficulty}
              onNewPuzzle={onNewPuzzle}
              onValidate={onValidate}
              onSolve={onSolve}
              onClearBoard={onClearBoard}
              busy={busy}
            />

            <NumberPad
              onInput={(n) => applyDigitToSelected(n)}
              onClearCell={onClearCell}
              onUndo={onUndo}
              disabled={busy || !canEditSelected}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
