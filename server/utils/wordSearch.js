const DIRECTIONS = [
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

const DEFAULT_WORD_BANK = [
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

const DEFAULT_WORD_COUNT = DEFAULT_WORD_BANK.length
const MIN_GRID_SIZE = 12

function randomInt(max) {
    return Math.floor(Math.random() * max)
}

function getRandomLetter() {
    return ALPHABET[randomInt(ALPHABET.length)]
}

function computeBaseSize(words) {
    const longestWord = words.reduce((max, word) => Math.max(max, word.length), 0)
    return Math.max(MIN_GRID_SIZE, longestWord + 2)
}

function placeWord(word, grid) {
    const size = grid.length
    const maxAttempts = size * size * DIRECTIONS.length

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const direction = DIRECTIONS[randomInt(DIRECTIONS.length)]
        const startRow = randomInt(size)
        const startCol = randomInt(size)

        const positions = []
        let canPlace = true

        for (let index = 0; index < word.length; index += 1) {
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

function createPuzzle(words, size) {
    const targetSize = size ?? computeBaseSize(words)

    for (let attempt = 0; attempt < 50; attempt += 1) {
        const grid = Array.from({ length: targetSize }, () => Array(targetSize).fill(''))
        const placements = {}
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
            for (let row = 0; row < targetSize; row += 1) {
                for (let col = 0; col < targetSize; col += 1) {
                    if (grid[row][col] === '') {
                        grid[row][col] = getRandomLetter()
                    }
                }
            }

            return { grid, placements }
        }
    }

    return createPuzzle(words, targetSize + 1)
}

function findWord(grid, word) {
    const size = grid.length

    for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
            if (grid[row][col] !== word[0]) {
                continue
            }

            for (const direction of DIRECTIONS) {
                const positions = []
                let matches = true

                for (let index = 0; index < word.length; index += 1) {
                    const nextRow = row + direction.row * index
                    const nextCol = col + direction.col * index

                    if (
                        nextRow < 0 ||
                        nextRow >= size ||
                        nextCol < 0 ||
                        nextCol >= size ||
                        grid[nextRow][nextCol] !== word[index]
                    ) {
                        matches = false
                        break
                    }

                    positions.push({ row: nextRow, col: nextCol })
                }

                if (matches) {
                    return positions
                }
            }
        }
    }

    return null
}

function solvePuzzle(grid, words) {
    const placements = {}

    for (const rawWord of words) {
        const word = rawWord.toUpperCase()
        const positions = findWord(grid, word)
        if (positions) {
            placements[word] = positions
        }
    }

    return placements
}

function normaliseWord(word) {
    return word
        .toString()
        .trim()
        .toUpperCase()
}

function getRandomWords(count = DEFAULT_WORD_COUNT, bank = DEFAULT_WORD_BANK) {
    const uniqueWords = new Set()
    const safeCount = Math.max(1, Math.min(count, bank.length))

    while (uniqueWords.size < safeCount) {
        const candidate = bank[randomInt(bank.length)]
        uniqueWords.add(normaliseWord(candidate))
    }

    return Array.from(uniqueWords)
}

module.exports = {
    ALPHABET,
    DEFAULT_WORD_BANK,
    DEFAULT_WORD_COUNT,
    MIN_GRID_SIZE,
    computeBaseSize,
    createPuzzle,
    getRandomLetter,
    getRandomWords,
    normaliseWord,
    solvePuzzle,
}