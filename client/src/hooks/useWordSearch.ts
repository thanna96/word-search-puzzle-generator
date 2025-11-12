import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import type { Position, Puzzle } from '../types/puzzle'
import { computeLineCells } from '../utils/puzzleGenerator'
import { requestPuzzle, solvePuzzleRequest } from '../utils/api'

type PointerFactory = (row: number, col: number) => (event: ReactPointerEvent<HTMLDivElement>) => void

type PointerHandler = (event: ReactPointerEvent<HTMLDivElement>) => void

type LoadOptions = {
    words?: string[]
    wordCount?: number
}

const EMPTY_PUZZLE: Puzzle = {
    grid: [],
    placements: {},
}

export function useWordSearch() {
    const [puzzle, setPuzzle] = useState<Puzzle>(EMPTY_PUZZLE)
    const [wordBank, setWordBank] = useState<string[]>([])
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
    const [selectedCells, setSelectedCells] = useState<Position[]>([])
    const [isSelecting, setIsSelecting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const startCellRef = useRef<Position | null>(null)
    const activePointerRef = useRef<number | null>(null)
    const selectionRef = useRef<Position[]>([])
    const wordCountRef = useRef<number | undefined>(undefined)

    useEffect(() => {
        selectionRef.current = selectedCells
    }, [selectedCells])

    const resetSelection = useCallback(() => {
        activePointerRef.current = null
        startCellRef.current = null
        selectionRef.current = []
        setSelectedCells([])
        setIsSelecting(false)
    }, [])

    const foundCellSet = useMemo(() => {
        const cells = new Set<string>()
        foundWords.forEach((word) => {
            const positions = puzzle.placements[word]
            positions?.forEach((position) => {
                cells.add(`${position.row}-${position.col}`)
            })
        })
        return cells
    }, [foundWords, puzzle])

    const selectionKeySet = useMemo(() => {
        return new Set(selectedCells.map((cell) => `${cell.row}-${cell.col}`))
    }, [selectedCells])

    const findMatchingWord = useCallback(
        (positions: Position[]): string | null => {
            if (positions.length === 0) {
                return null
            }

            const matchesPath = (target: Position[] | undefined, candidate: Position[]) => {
                if (!target || target.length !== candidate.length) {
                    return false
                }
                return target.every((cell, index) => {
                    const other = candidate[index]
                    return cell.row === other.row && cell.col === other.col
                })
            }

            for (const word of wordBank) {
                const placement = puzzle.placements[word]
                if (!placement) {
                    continue
                }
                if (matchesPath(placement, positions)) {
                    return word
                }
                const reversed = [...placement].reverse()
                if (matchesPath(reversed, positions)) {
                    return word
                }
            }
            return null
        },
        [puzzle, wordBank],
    )

    const finalizeSelection = useCallback(() => {
        const currentSelection = selectionRef.current
        if (currentSelection.length > 0) {
            const matchedWord = findMatchingWord(currentSelection)
            if (matchedWord) {
                setFoundWords((prev) => {
                    if (prev.has(matchedWord)) {
                        return prev
                    }
                    const updated = new Set(prev)
                    updated.add(matchedWord)
                    return updated
                })
            }
        }

        resetSelection()
    }, [findMatchingWord, resetSelection])

    useEffect(() => {
        const handlePointerUp = (event: PointerEvent) => {
            if (activePointerRef.current === event.pointerId) {
                finalizeSelection()
            }
        }

        const handlePointerCancel = (event: PointerEvent) => {
            if (activePointerRef.current === event.pointerId) {
                finalizeSelection()
            }
        }

        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerCancel)

        return () => {
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointercancel', handlePointerCancel)
        }
    }, [finalizeSelection])

    const handlePointerDown: PointerFactory = useCallback((row, col) => {
        return (event) => {
            if (isLoading || puzzle.grid.length === 0) {
                return
            }
            event.preventDefault()
            activePointerRef.current = event.pointerId
            const start = { row, col }
            startCellRef.current = start
            selectionRef.current = [start]
            setSelectedCells([start])
            setIsSelecting(true)
        }
    }, [isLoading, puzzle.grid.length])

    const handlePointerEnter: PointerFactory = useCallback((row, col) => {
        return (event) => {
            if (activePointerRef.current !== event.pointerId) {
                return
            }
            const start = startCellRef.current
            if (!start) {
                return
            }
            const path = computeLineCells(start, { row, col })
            if (path) {
                selectionRef.current = path
                setSelectedCells(path)
            }
        }
    }, [])

    const handlePointerUp: PointerHandler = useCallback(
        (event) => {
            if (activePointerRef.current === event.pointerId) {
                finalizeSelection()
            }
        },
        [finalizeSelection],
    )

    const loadPuzzle = useCallback(
        async (options?: LoadOptions) => {
            setIsLoading(true)
            setError(null)
            try {
                const desiredWordCount = options?.wordCount ?? wordCountRef.current
                const response = await requestPuzzle(desiredWordCount, options?.words)
                setPuzzle(response.puzzle)
                setWordBank(response.words)
                setFoundWords(new Set())
                wordCountRef.current = response.words.length
                resetSelection()
                setHasLoaded(true)
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Unable to generate puzzle.'
                setError(message)
            } finally {
                setIsLoading(false)
            }
        },
        [resetSelection],
    )

    const handleGeneratePuzzle = useCallback(() => {
        void loadPuzzle()
    }, [loadPuzzle])

    const executeSolve = useCallback(async () => {
        if (puzzle.grid.length === 0 || wordBank.length === 0) {
            return
        }
        setIsLoading(true)
        setError(null)
        try {
            const response = await solvePuzzleRequest(puzzle.grid, wordBank)
            setPuzzle((prev) => ({
                ...prev,
                placements: { ...prev.placements, ...response.placements },
            }))
            setFoundWords(new Set(wordBank))
            resetSelection()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to solve puzzle.'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [puzzle.grid, resetSelection, wordBank])

    const handleSolvePuzzle = useCallback(() => {
        void executeSolve()
    }, [executeSolve])

    useEffect(() => {
        void loadPuzzle()
    }, [loadPuzzle])

    const allFound = wordBank.length > 0 && foundWords.size === wordBank.length

    return {
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
    }
}