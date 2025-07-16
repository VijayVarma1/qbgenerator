export function generateRandomPapers(questions, numPapers = 1, questionsPerPaper = 10) {
    const papers = [];

    for (let i = 0; i < numPapers; i++) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, questionsPerPaper);

        papers.push({
            code: `PAPER-${Date.now()}-${i + 1}`,
            questions: selected,
        });
    }

    return papers;
}
