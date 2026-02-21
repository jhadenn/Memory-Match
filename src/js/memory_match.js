// ------------------------------------------------------------
// Memory Match (Lab 03 + Bonus Features)
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const boardEl = document.getElementById("board");
    const movesEl = document.getElementById("moves");
    const matchesEl = document.getElementById("matches");
    const matchesTotalEl = document.getElementById("matches-total");
    const timeEl = document.getElementById("time");
    const bestStreakEl = document.getElementById("best-streak");
    const messageEl = document.getElementById("message");
    const newGameBtn = document.getElementById("new-game-btn");
    const resetBtn = document.getElementById("reset-btn");
    const difficultyEl = document.getElementById("difficulty");
    const scoreFormEl = document.getElementById("score-form");
    const playerNameEl = document.getElementById("player-name");
    const saveScoreBtn = document.getElementById("save-score-btn");

    if (
        !boardEl
        || !movesEl
        || !matchesEl
        || !matchesTotalEl
        || !timeEl
        || !bestStreakEl
        || !messageEl
        || !newGameBtn
        || !resetBtn
        || !difficultyEl
        || !scoreFormEl
        || !playerNameEl
        || !saveScoreBtn
    ) {
        return;
    }

    // Face pool uses unicode escapes to avoid encoding issues in source control.
    const facePool = [
        "\uD83C\uDF4E", "\uD83C\uDF4C", "\uD83C\uDF47", "\uD83C\uDF49", "\uD83C\uDF52", "\uD83E\uDD5D",
        "\uD83C\uDF4D", "\uD83C\uDF51", "\uD83C\uDF53", "\uD83C\uDF50", "\uD83C\uDF4A", "\uD83C\uDF4B",
        "\uD83C\uDF45", "\uD83E\uDD51", "\uD83E\uDD55", "\uD83E\uDD54", "\uD83E\uDD52", "\uD83E\uDD53",
    ];

    const scoreStorageKey = "memoryMatchScores";

    let deck = [];
    let firstCard = null;
    let secondCard = null;
    let boardLocked = false;

    let moves = 0;
    let matches = 0;
    let matchesTotal = 8;
    let seconds = 0;
    let currentStreak = 0;
    let bestStreak = 0;
    let timerId = null;
    let timerRunning = false;
    let pendingTimeoutIds = [];
    let pendingScore = null;
    let currentDifficulty = "easy";

    // Shuffle for a new randomized board.
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Stop and clear the timer without touching UI.
    function stopTimer() {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
        timerRunning = false;
    }

    // Clear any delayed flip/match timers when restarting.
    function clearPendingTimeouts() {
        for (const id of pendingTimeoutIds) {
            clearTimeout(id);
        }
        pendingTimeoutIds = [];
    }

    // Start the timer on first interaction.
    function ensureTimerRunning() {
        if (timerRunning) return;
        timerRunning = true;
        timerId = setInterval(() => {
            seconds += 1;
            timeEl.textContent = String(seconds);
        }, 1000);
    }

    // Update the status message area.
    function setMessage(text) {
        messageEl.textContent = text;
    }

    // Hide the score form between games.
    function hideScoreForm() {
        scoreFormEl.classList.remove("is-visible");
        scoreFormEl.setAttribute("aria-hidden", "true");
        playerNameEl.value = "";
        pendingScore = null;
    }

    // Reset counters, timer, and UI values for a fresh start.
    function resetStats() {
        clearPendingTimeouts();
        moves = 0;
        matches = 0;
        seconds = 0;
        currentStreak = 0;
        bestStreak = 0;
        movesEl.textContent = "0";
        matchesEl.textContent = "0";
        timeEl.textContent = "0";
        bestStreakEl.textContent = "0";
        setMessage("");
        stopTimer();
        hideScoreForm();
    }

    // Clear current card selections and allow input again.
    function clearSelection() {
        firstCard = null;
        secondCard = null;
        boardLocked = false;
    }

    // Build the board dynamically from a shuffled face list.
    function buildBoard(faces, size) {
        boardEl.innerHTML = "";
        boardEl.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
        boardEl.style.width = size === 6 ? "min(680px, 100%)" : "min(520px, 100%)";

        for (const face of faces) {
            const card = document.createElement("button");
            card.type = "button";
            card.className = "card";
            card.dataset.face = face;
            card.setAttribute("aria-label", "Card");
            card.setAttribute("aria-pressed", "false");

            const faceEl = document.createElement("span");
            faceEl.className = "card-face";
            faceEl.setAttribute("aria-hidden", "true");
            faceEl.textContent = face;

            card.appendChild(faceEl);
            card.addEventListener("click", () => onCardClicked(card));

            boardEl.appendChild(card);
        }
    }

    // Flip a card face-up.
    function flipUp(card) {
        card.classList.add("flipped");
        card.setAttribute("aria-pressed", "true");
    }

    // Flip a card face-down.
    function flipDown(card) {
        card.classList.remove("flipped");
        card.setAttribute("aria-pressed", "false");
    }

    // Permanently mark a matched card.
    function markMatched(card) {
        card.classList.remove("flipped");
        card.classList.add("matched");
        card.disabled = true;
        card.setAttribute("aria-pressed", "true");
    }

    // Resolve a card click with lockout while pairs are evaluated.
    function onCardClicked(card) {
        if (boardLocked) return;
        if (card.classList.contains("matched")) return;
        if (card.classList.contains("flipped")) return;

        ensureTimerRunning();
        flipUp(card);

        if (!firstCard) {
            firstCard = card;
            return;
        }

        secondCard = card;
        boardLocked = true;

        moves += 1;
        movesEl.textContent = String(moves);

        const isMatch = firstCard.dataset.face === secondCard.dataset.face;

        if (isMatch) {
            matches += 1;
            matchesEl.textContent = String(matches);
            currentStreak += 1;
            if (currentStreak > bestStreak) {
                bestStreak = currentStreak;
                bestStreakEl.textContent = String(bestStreak);
            }

            const a = firstCard;
            const b = secondCard;
            const timeoutId = setTimeout(() => {
                markMatched(a);
                markMatched(b);
                clearSelection();

                if (matches === matchesTotal) {
                    stopTimer();
                    setMessage(`You won! ${moves} moves, ${seconds} seconds.`);
                    pendingScore = {
                        moves,
                        time: seconds,
                        date: new Date().toISOString().slice(0, 10),
                        difficulty: currentDifficulty,
                        size: matchesTotal * 2,
                    };
                    scoreFormEl.classList.add("is-visible");
                    scoreFormEl.setAttribute("aria-hidden", "false");
                    playerNameEl.focus();
                }
            }, 250);
            pendingTimeoutIds.push(timeoutId);
            return;
        }

        const a = firstCard;
        const b = secondCard;
        a.classList.add("wrong");
        b.classList.add("wrong");
        currentStreak = 0;

        const timeoutId = setTimeout(() => {
            a.classList.remove("wrong");
            b.classList.remove("wrong");
            flipDown(a);
            flipDown(b);
            clearSelection();
        }, 900);
        pendingTimeoutIds.push(timeoutId);
    }

    // Convert difficulty to board size/pairs and face set.
    function getConfig() {
        const difficulty = difficultyEl.value;
        const size = difficulty === "hard" ? 6 : 4;
        const pairs = (size * size) / 2;
        const faces = facePool.slice(0, pairs);
        return { difficulty, size, pairs, faces };
    }

    // Save a score entry to localStorage for the high-scores page.
    function saveScoreToStorage(entry) {
        try {
            const existingRaw = localStorage.getItem(scoreStorageKey);
            const existing = existingRaw ? JSON.parse(existingRaw) : [];
            const safeList = Array.isArray(existing) ? existing : [];
            safeList.unshift(entry);
            localStorage.setItem(scoreStorageKey, JSON.stringify(safeList));
        } catch (error) {
            setMessage("Unable to save score in this browser.");
        }
    }

    function startNewGame() {
        resetStats();
        clearSelection();

        const config = getConfig();
        currentDifficulty = config.difficulty;
        matchesTotal = config.pairs;
        matchesTotalEl.textContent = String(matchesTotal);

        deck = shuffle([...config.faces, ...config.faces]);
        buildBoard(deck, config.size);
    }

    function resetSameBoard() {
        if (deck.length === 0) {
            startNewGame();
            return;
        }

        resetStats();
        clearSelection();
        const size = currentDifficulty === "hard" ? 6 : 4;
        matchesTotalEl.textContent = String(matchesTotal);
        buildBoard(deck, size);
    }

    // Persist a score after a win when the player submits a name.
    function onSaveScore() {
        if (!pendingScore) return;
        const playerName = playerNameEl.value.trim() || "Player";
        const entry = { player: playerName, ...pendingScore };
        saveScoreToStorage(entry);
        setMessage(`Score saved for ${playerName}.`);
        hideScoreForm();
    }

    newGameBtn.addEventListener("click", startNewGame);
    resetBtn.addEventListener("click", resetSameBoard);
    saveScoreBtn.addEventListener("click", onSaveScore);
    difficultyEl.addEventListener("change", startNewGame);

    startNewGame();
});
