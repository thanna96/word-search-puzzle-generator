export type Position = {
    row: number
    col: number
}

export type Puzzle = {
    grid: string[][]
    placements: Record<string, Position[]>
}