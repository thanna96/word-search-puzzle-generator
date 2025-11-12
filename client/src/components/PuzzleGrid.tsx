import type { PointerEvent as ReactPointerEvent } from 'react'

interface PuzzleGridProps {
    grid: string[][]
    foundCellSet: Set<string>
    selectionKeySet: Set<string>
    onCellPointerDown: (row: number, col: number) => (event: ReactPointerEvent<HTMLDivElement>) => void
    onCellPointerEnter: (row: number, col: number) => (event: ReactPointerEvent<HTMLDivElement>) => void
    onCellPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void
    onPointerLeave: () => void
    isSelecting: boolean
}

export function PuzzleGrid({
                               grid,
                               foundCellSet,
                               selectionKeySet,
                               onCellPointerDown,
                               onCellPointerEnter,
                               onCellPointerUp,
                               onPointerLeave,
                               isSelecting,
                           }: PuzzleGridProps) {
    return (
        <div className="puzzle" onPointerLeave={isSelecting ? onPointerLeave : undefined}>
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="puzzle__row">
                    {row.map((letter, colIndex) => {
                        const cellKey = `${rowIndex}-${colIndex}`
                        const isFound = foundCellSet.has(cellKey)
                        const isHighlighted = selectionKeySet.has(cellKey)
                        const cellClasses = ['puzzle__cell']

                        if (isFound) {
                            cellClasses.push('puzzle__cell--found')
                        }

                        if (isHighlighted) {
                            cellClasses.push('puzzle__cell--highlighted')
                        }

                        return (
                            <div
                                key={cellKey}
                                role="button"
                                tabIndex={0}
                                className={cellClasses.join(' ')}
                                onPointerDown={onCellPointerDown(rowIndex, colIndex)}
                                onPointerEnter={onCellPointerEnter(rowIndex, colIndex)}
                                onPointerUp={onCellPointerUp}
                            >
                                {letter}
                            </div>
                        )
                    })}
                </div>
            ))}
        </div>
    )
}