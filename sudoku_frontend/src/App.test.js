import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders Sudoku title", () => {
  render(<App />);
  const title = screen.getByText(/sudoku/i);
  expect(title).toBeInTheDocument();
});
