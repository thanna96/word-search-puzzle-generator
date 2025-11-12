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
        isLoading,
        hasLoaded,
        error,
        allFound,
        handleGeneratePuzzle,
        handleSolvePuzzle,
        handlePointerDown,
        handlePointerEnter,
        handlePointerUp,
        finalizeSelection,
    } = useWordSearch()

    const puzzleReady = hasLoaded && puzzle.grid.length > 0 && wordBank.length > 0

    return (
        <div className="app">
            <header className="app__header">
                <h1>Word Search Puzzle</h1>
                <p>Select letters by dragging across the grid to highlight each hidden word.</p>
            </header>

            <PuzzleControls
                onGenerate={handleGeneratePuzzle}
                onSolve={handleSolvePuzzle}
                disableSolve={!puzzleReady}
                isLoading={isLoading}
            />

            {error ? <div className="app__status app__status--error">{error}</div> : null}
            {!puzzleReady && isLoading ? <div className="app__status">Loading puzzle…</div> : null}
            {!puzzleReady && hasLoaded && !isLoading && !error ? (
                <div className="app__status app__status--error">Unable to load puzzle.</div>
            ) : null}

            {puzzleReady ? (
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
            ) : null}
        </div>
    )
}