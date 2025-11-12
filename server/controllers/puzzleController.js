const {
    computeBaseSize,
    createPuzzle,
    getRandomWords,
    normaliseWord,
    solvePuzzle: solveWordSearch,
} = require('../utils/wordSearch')

function parseWords(inputWords) {
    if (Array.isArray(inputWords) && inputWords.length > 0) {
        const uniqueWords = Array.from(
            new Set(
                inputWords
                    .map((word) => normaliseWord(word))
                    .filter((word) => word.length > 0),
            ),
        )

        if (uniqueWords.length > 0) {
            return uniqueWords
        }
    }

    return null
}

exports.generatePuzzle = (req, res) => {
    try {
        const { words: providedWords, size, wordCount } = req.body ?? {}

        const parsedWords = parseWords(providedWords)
        const fallbackCount = typeof wordCount === 'number' ? wordCount : undefined
        const words = parsedWords ?? getRandomWords(fallbackCount)

        if (!Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ message: 'No words available to generate a puzzle.' })
        }

        const puzzleSize = typeof size === 'number' ? Math.max(size, computeBaseSize(words)) : computeBaseSize(words)

        const puzzle = createPuzzle(words, puzzleSize)

        return res.json({
            words,
            puzzle,
        })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to generate puzzle.', detail: error.message })
    }
}

exports.solvePuzzle = (req, res) => {
    const { grid, words } = req.body ?? {}

    if (!Array.isArray(grid) || grid.length === 0) {
        return res.status(400).json({ message: 'A valid grid is required to solve the puzzle.' })
    }

    if (!Array.isArray(words) || words.length === 0) {
        return res.status(400).json({ message: 'A list of words is required to solve the puzzle.' })
    }

    const normalisedWords = words.map((word) => normaliseWord(word)).filter((word) => word.length > 0)

    try {
        const placements = solveWordSearch(grid, normalisedWords)
        return res.json({ placements })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to solve puzzle.', detail: error.message })
    }
}