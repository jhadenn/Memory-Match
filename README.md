# Lab 01-03 - Memory Match (Starter Code)

This starter package supports Labs 01-03 for CSCI3230U Web App Development.

You will build a two-page web app:

- `memory_match.html` - the game page
- `high_scores.html` - the high scores page

Over three labs you will add:

- Lab 01: HTML structure and content
- Lab 02: Styling with Bulma + custom CSS (responsive layout)
- Lab 03: JavaScript logic (dynamic board, events, dynamic scores table)

Bonus features implemented:

- Difficulty selector (4x4 easy, 6x6 hard)
- Best streak counter (longest consecutive matches in a game)
- High scores persisted with `localStorage`
- Name entry shown after a win to save scores

## How to Run

Clone the repo.

Open the game page in your browser:

- `src/pages/memory_match.html`

If links are correct, the page will load:

- `../css/memory_match.css`
- `../js/memory_match.js`

Open the high scores page:

- `src/pages/high_scores.html`


## Notes

- If you see missing script/style errors, check your relative paths from `src/pages/`.
- If you use features like `fetch()` later, you may need to run a local server (e.g., VS Code Live Server).
- High scores are stored in `localStorage` under the key `memoryMatchScores`.
