#!/bin/bash
cd /home/kavia/workspace/code-generation/sudoku-solver-and-play-52391/sudoku_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

