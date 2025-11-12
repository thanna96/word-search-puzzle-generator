interface PuzzleControlsProps {
    onGenerate: () => void
    onSolve: () => void
    disableGenerate?: boolean
    disableSolve?: boolean
    isLoading?: boolean
}

export function PuzzleControls({
                                   onGenerate,
                                   onSolve,
                                   disableGenerate = false,
                                   disableSolve = false,
                                   isLoading = false,
                               }: PuzzleControlsProps) {
    const generateDisabled = disableGenerate || isLoading
    const solveDisabled = disableSolve || isLoading

    return (
        <div className="app__controls">
            <button type="button" onClick={onGenerate} disabled={generateDisabled}>
                {isLoading ? 'Loading Puzzle…' : 'Generate New Puzzle'}
            </button>
            <button type="button" onClick={onSolve} disabled={solveDisabled}>
                Solve Puzzle
            </button>
        </div>
    )
}