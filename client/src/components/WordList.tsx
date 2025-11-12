interface WordListProps {
    words: string[]
    foundWords: Set<string>
    allFound: boolean
}

export function WordList({ words, foundWords, allFound }: WordListProps) {
    const remaining = words.length - foundWords.size

    return (
        <aside className="word-list">
            <h2>Find these words</h2>
            <ul>
                {words.map((word) => {
                    const isFound = foundWords.has(word)
                    return (
                        <li key={word} className={isFound ? 'word-list__item word-list__item--found' : 'word-list__item'}>
                            {word}
                        </li>
                    )
                })}
            </ul>
            <div className="word-list__status" aria-live="polite">
                {allFound ? 'Great job! You found every word.' : `Words remaining: ${remaining}`}
            </div>
        </aside>
    )
}