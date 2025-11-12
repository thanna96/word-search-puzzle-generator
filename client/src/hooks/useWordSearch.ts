import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'

import type { Position, Puzzle } from '../types/puzzle'
import { BASE_SIZE, WORD_BANK, computeLineCells, createPuzzle } from '../utils/puzzleGenerator'

type PointerFactory = (row: number, col: number) => (event: ReactPointerEvent<HTMLDivElement>) => void

type PointerHandler = (event: ReactPointerEvent<HTMLDivElement>) => void

export function useWordSearch() {
    const [puzzle, setPuzzle] = useState<Puzzle>(() => createPuzzle(WORD_BANK, BASE_SIZE))
    const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
    const [selectedCells, setSelectedCells] = useState<Position[]>([])
    const [isSelecting, setIsSelecting] = useState(false)

    const startCellRef = useRef<Position | null>(null)
    const activePointerRef = useRef<number | null>(null)
    const selectionRef = useRef<Position[]>([])

    useEffect(() => {
        selectionRef.current = selectedCells
    }, [selectedCells])

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

            const matchesPath = (target: Position[], candidate: Position[]) => {
                if (!target || target.length !== candidate.length) {
                    return false
                }
                return target.every((cell, index) => {
                    const other = candidate[index]
                    return cell.row === other.row && cell.col === other.col
                })
            }

            for (const word of WORD_BANK) {
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
        [puzzle],
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

        activePointerRef.current = null
        startCellRef.current = null
        selectionRef.current = []
        setSelectedCells([])
        setIsSelecting(false)
    }, [findMatchingWord])

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
            event.preventDefault()
            activePointerRef.current = event.pointerId
            const start = { row, col }
            startCellRef.current = start
            selectionRef.current = [start]
            setSelectedCells([start])
            setIsSelecting(true)
        }
    }, [])

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

    const handleGeneratePuzzle = useCallback(() => {
        const nextPuzzle = createPuzzle(WORD_BANK, BASE_SIZE)
        setPuzzle(nextPuzzle)
        setFoundWords(new Set())
        setSelectedCells([])
        setIsSelecting(false)
        startCellRef.current = null
        activePointerRef.current = null
        selectionRef.current = []
    }, [])

    const handleSolvePuzzle = useCallback(() => {
        setFoundWords(new Set(WORD_BANK))
        setSelectedCells([])
        setIsSelecting(false)
        selectionRef.current = []
        startCellRef.current = null
        activePointerRef.current = null
    }, [])

    const allFound = foundWords.size === WORD_BANK.length

    return {
        puzzle,
        wordBank: WORD_BANK,
        foundWords,
        foundCellSet,
        selectionKeySet,
        isSelecting,
        allFound,
        handleGeneratePuzzle,
        handleSolvePuzzle,
        handlePointerDown,
        handlePointerEnter,
        handlePointerUp,
        finalizeSelection,
    }
}