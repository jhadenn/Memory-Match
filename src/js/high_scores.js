// ------------------------------------------------------------
// High Scores (Lab 03 + Bonus Features)
// ------------------------------------------------------------

const scoreStorageKey = "memoryMatchScores";

const defaultScores = [
    { player: "Ava", moves: 22, time: 58, date: "2026-01-10" },
    { player: "Noah", moves: 24, time: 63, date: "2026-01-18" },
    { player: "Mia", moves: 20, time: 71, date: "2026-02-02" },
    { player: "Leo", moves: 22, time: 54, date: "2026-02-12" },
    { player: "Zoe", moves: 26, time: 59, date: "2026-02-19" },
];

// Sort by moves, then time, then newest date.
function compareScores(a, b) {
    if (a.moves !== b.moves) return a.moves - b.moves;
    if (a.time !== b.time) return a.time - b.time;
    return String(b.date).localeCompare(String(a.date));
}

// Load persisted scores from localStorage when available.
function loadScores() {
    try {
        const stored = localStorage.getItem(scoreStorageKey);
        const parsed = stored ? JSON.parse(stored) : [];
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
    } catch (error) {
        // Fall back to defaults if parsing fails.
    }
    return defaultScores;
}

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("scores-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const sorted = loadScores().slice().sort(compareScores);
    sorted.forEach((score, index) => {
        const row = document.createElement("tr");

        const rankCell = document.createElement("td");
        rankCell.textContent = String(index + 1);

        const playerCell = document.createElement("td");
        playerCell.textContent = score.player;

        const movesCell = document.createElement("td");
        movesCell.textContent = String(score.moves);

        const timeCell = document.createElement("td");
        timeCell.textContent = String(score.time);

        const dateCell = document.createElement("td");
        dateCell.textContent = score.date;

        row.append(rankCell, playerCell, movesCell, timeCell, dateCell);
        tbody.appendChild(row);
    });
});
