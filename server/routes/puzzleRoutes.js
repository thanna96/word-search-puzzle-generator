const express = require('express')

const { generatePuzzle, solvePuzzle } = require('../controllers/puzzleController')
const { getWords } = require('../controllers/wordController')

const router = express.Router()

router.get('/words', getWords)
router.post('/puzzle/generate', generatePuzzle)
router.post('/puzzle/solve', solvePuzzle)

module.exports = router