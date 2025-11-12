import type { Position, Puzzle } from '../types/puzzle'

const DIRECTIONS: Position[] = [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function randomInt(max: number) {
    return Math.floor(Math.random() * max)
}

function getRandomLetter() {
    return ALPHABET[randomInt(ALPHABET.length)]
}

function placeWord(word: string, grid: string[][]): Position[] | null {
    const size = grid.length
    const maxAttempts = size * size * DIRECTIONS.length

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const direction = DIRECTIONS[randomInt(DIRECTIONS.length)]
        const startRow = randomInt(size)
        const startCol = randomInt(size)

        const positions: Position[] = []
        let canPlace = true

        for (let index = 0; index < word.length; index++) {
            const row = startRow + direction.row * index
            const col = startCol + direction.col * index

            if (row < 0 || row >= size || col < 0 || col >= size) {
                canPlace = false
                break
            }

            const existing = grid[row][col]
            if (existing !== '' && existing !== word[index]) {
                canPlace = false
                break
            }

            positions.push({ row, col })
        }

        if (canPlace) {
            positions.forEach((position, letterIndex) => {
                grid[position.row][position.col] = word[letterIndex]
            })
            return positions
        }
    }

    return null
}

export function createPuzzle(words: string[], size: number): Puzzle {
    for (let attempt = 0; attempt < 50; attempt++) {
        const grid = Array.from({ length: size }, () => Array(size).fill(''))
        const placements: Record<string, Position[]> = {}
        let success = true

        for (const word of words) {
            const result = placeWord(word, grid)
            if (!result) {
                success = false
                break
            }
            placements[word] = result
        }

        if (success) {
            for (let row = 0; row < size; row++) {
                for (let col = 0; col < size; col++) {
                    if (grid[row][col] === '') {
                        grid[row][col] = getRandomLetter()
                    }
                }
            }

            return { grid, placements }
        }
    }

    return createPuzzle(words, size + 1)
}

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
        for (let index = 0; index <= steps; index++) {
            cells.push({ row: start.row + stepRow * index, col: start.col + stepCol * index })
        }
        return cells
    }

    if (Math.abs(rowDiff) !== Math.abs(colDiff)) {
        return null
    }

    const steps = Math.abs(rowDiff)
    const cells: Position[] = []
    for (let index = 0; index <= steps; index++) {
        cells.push({ row: start.row + stepRow * index, col: start.col + stepCol * index })
    }
    return cells
}

export const WORD_BANK = [
    'PUZZLE',
    'SEARCH',
    'LETTER',
    'REACT',
    'LOGIC',
    'RANDOM',
    'SCRIPT',
    'MATRIX',
    'ALGORITHM',
    'CODE',
]

export const BASE_SIZE = Math.max(12, ...WORD_BANK.map((word) => word.length + 2))