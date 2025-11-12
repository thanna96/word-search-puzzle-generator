import type { Position } from '../types/puzzle'

export function computeLineCells(start: Position, end: Position): Position[] | null {
    const rowDiff = end.row - start.row
    const colDiff = end.col - start.col

    if (rowDiff === 0 && colDiff === 0) {
        return [start]
    }

    const stepRow = Math.sign(rowDiff)
    const stepCol = Math.sign(colDiff)

    if (stepRow === 0 && stepCol === 0) {
        return null
    }

    if (stepRow === 0 || stepCol === 0) {
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff))
        const cells: Position[] = []
        for (let index = 0; index <= steps; index += 1) {
            cells.push({ row: start.row + stepRow * index, col: start.col + stepCol * index })
        }
        return cells
    }

    if (Math.abs(rowDiff) !== Math.abs(colDiff)) {
        return null
    }

    const steps = Math.abs(rowDiff)
    const cells: Position[] = []
    for (let index = 0; index <= steps; index += 1) {
        cells.push({ row: start.row + stepRow * index, col: start.col + stepCol * index })
    }
    return cells
}