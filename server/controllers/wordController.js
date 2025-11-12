const { getRandomWords } = require('../utils/wordSearch')

exports.getWords = (req, res) => {
    const { count } = req.query
    const parsedCount = Number.parseInt(count, 10)

    try {
        const words = getRandomWords(Number.isNaN(parsedCount) ? undefined : parsedCount)
        return res.json({ words })
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch words.', detail: error.message })
    }
}