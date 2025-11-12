import type { Position, Puzzle } from '../types/puzzle'

const DEFAULT_HEADERS: HeadersInit = {
    'Content-Type': 'application/json',
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export type GeneratePuzzleResponse = {
    words: string[]
    puzzle: Puzzle
}

export type SolvePuzzleResponse = {
    placements: Record<string, Position[]>
}

function buildUrl(path: string) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path
    }
    return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const message = payload?.message ?? `Request failed with status ${response.status}`
        throw new Error(message)
    }
    return (await response.json()) as T
}

export async function requestPuzzle(wordCount?: number, words?: string[]): Promise<GeneratePuzzleResponse> {
    const body: Record<string, unknown> = {}

    if (typeof wordCount === 'number') {
        body.wordCount = wordCount
    }

    if (Array.isArray(words) && words.length > 0) {
        body.words = words
    }

    const response = await fetch(buildUrl('/puzzle/generate'), {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(body),
    })

    return handleResponse<GeneratePuzzleResponse>(response)
}

export async function solvePuzzleRequest(grid: string[][], words: string[]): Promise<SolvePuzzleResponse> {
    const response = await fetch(buildUrl('/puzzle/solve'), {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ grid, words }),
    })

    return handleResponse<SolvePuzzleResponse>(response)
}

export async function fetchRandomWords(count?: number): Promise<string[]> {
    const query = typeof count === 'number' ? `?count=${count}` : ''
    const response = await fetch(buildUrl(`/words${query}`))
    const payload = await handleResponse<{ words: string[] }>(response)
    return payload.words
}