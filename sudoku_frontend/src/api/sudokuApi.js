const DEFAULT_BASE_URL = "http://localhost:3001";

/**
 * Note: CRA exposes env vars prefixed with REACT_APP_*
 * Supported:
 * - REACT_APP_API_BASE (preferred)
 */
const API_BASE_URL =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  DEFAULT_BASE_URL;

/**
 * Throws an Error with a useful message if the API request fails.
 * @param {string} path
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function requestJson(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (e) {
    throw new Error(
      `Network error while contacting Sudoku API at ${API_BASE_URL}. Is the backend running?`
    );
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && (data.message || data.detail)) || data;
    throw new Error(
      `Sudoku API error (${res.status}) on ${path}: ${
        typeof detail === "string" ? detail : JSON.stringify(detail)
      }`
    );
  }

  return data;
}

// PUBLIC_INTERFACE
export async function generatePuzzle(difficulty = "easy") {
  /** Generate a new Sudoku puzzle from the backend. */
  const q = difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : "";
  return requestJson(`/generate${q}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function validateBoard(board) {
  /** Validate the current Sudoku board against Sudoku rules. */
  return requestJson("/validate", {
    method: "POST",
    body: JSON.stringify({ board }),
  });
}

// PUBLIC_INTERFACE
export async function solveBoard(board) {
  /** Attempt to solve the current Sudoku board. */
  return requestJson("/solve", {
    method: "POST",
    body: JSON.stringify({ board }),
  });
}

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Return the configured API base URL used by the frontend. */
  return API_BASE_URL;
}
