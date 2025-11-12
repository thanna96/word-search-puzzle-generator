import { PuzzleControls } from '../components/PuzzleControls'
import { PuzzleGrid } from '../components/PuzzleGrid'
import { WordList } from '../components/WordList'
import { useWordSearch } from '../hooks/useWordSearch'

export default function WordSearchPage() {
    const {
        puzzle,
        wordBank,
        foundWords,
        foundCellSet,
        selectionKeySet,
        isSelecting,
        allFound,
        handleGeneratePuzzle,
        handleSolvePuzzle,
        handlePointerDown,
        handlePointerEnter,
        handlePointerUp,
        finalizeSelection,
    } = useWordSearch()

    return (
        <div className="app">
            <header className="app__header">
                <h1>Word Search Puzzle</h1>
                <p>Select letters by dragging across the grid to highlight each hidden word.</p>
            </header>

            <PuzzleControls onGenerate={handleGeneratePuzzle} onSolve={handleSolvePuzzle} />

            <div className="app__content">
                <PuzzleGrid
                    grid={puzzle.grid}
                    foundCellSet={foundCellSet}
                    selectionKeySet={selectionKeySet}
                    onCellPointerDown={handlePointerDown}
                    onCellPointerEnter={handlePointerEnter}
                    onCellPointerUp={handlePointerUp}
                    onPointerLeave={finalizeSelection}
                    isSelecting={isSelecting}
                />
                <WordList words={wordBank} foundWords={foundWords} allFound={allFound} />
            </div>
        </div>
    )
}