interface PuzzleControlsProps {
    onGenerate: () => void
    onSolve: () => void
}

export function PuzzleControls({ onGenerate, onSolve }: PuzzleControlsProps) {
    return (
        <div className="app__controls">
            <button type="button" onClick={onGenerate}>
                Generate New Puzzle
            </button>
            <button type="button" onClick={onSolve}>
                Solve Puzzle
            </button>
        </div>
    )
}