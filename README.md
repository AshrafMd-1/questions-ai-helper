# Sanfoundry AI Answer Helper

A Tampermonkey userscript for [Sanfoundry](https://www.sanfoundry.com/) MCQ pages that hides the answer, lets you select your answer, and - when wrong - fetches an AI-generated explanation via the Google Gemini API. Incorrect answers are automatically logged (question + correct answer + AI explanation) to a personal Express.js + MongoDB backend for later review.

---

## Features

- Replaces the "View Answer" toggle with a clean dropdown select + submit button
- Instantly shows a green checkmark on correct answers
- On incorrect answers:
  - Fetches a concise AI explanation from Gemini 1.5 Flash
  - Displays the explanation in a collapsible box
  - Logs the question, correct answer, and explanation to your backend
- Backend deduplicates entries - the same question is never logged twice
- `/show` dashboard displays all logged entries in a styled UI (Tailwind + DaisyUI)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Userscript | Vanilla JS (Tampermonkey) |
| AI | Google Gemini 1.5 Flash (via REST API) |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose) |
| View | EJS + Tailwind CSS + DaisyUI |

---

## How It Works

```
Sanfoundry MCQ page
      │
      ▼
Tampermonkey userscript injects UI (dropdown + button)
      │
      ├── Correct → ✅ green check, done
      │
      └── Incorrect
            ├── POST to Gemini API → explanation text
            └── POST /send → Express server → MongoDB
                                    │
                                    └── GET /show → styled dashboard
```

1. The userscript scans every `.entry-content p` element on the page for MCQ blocks.
2. It strips the original collapsible answer span and hidden answer div.
3. A `<select>` (options a–d) and a Submit button are injected in their place.
4. On submit:
   - **Correct:** locks the controls and shows ✅.
   - **Incorrect:** calls Gemini, renders an expandable explanation box, and POSTs to your server.

---

## Project Structure

```
questions-ai-helper/
├── app.js           # Express server (API + view routes)
├── userscript.js    # Tampermonkey userscript
├── views/
│   └── show.ejs     # Dashboard to browse logged entries
├── package.json
└── .env             # MONGODB_URI (not committed)
```

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A MongoDB instance (local or Atlas)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- [Tampermonkey](https://tampermonkey.net/) browser extension

---

### 1. Backend

```bash
git clone https://github.com/yourusername/questions-ai-helper.git
cd questions-ai-helper
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname
```

Start the server:

```bash
npm start          # production
npm run dev        # development (nodemon)
```

The server runs at `http://localhost:3000`.

---

### 2. Userscript

1. Open Tampermonkey → **Create a new script**.
2. Paste the contents of [`userscript.js`](./userscript.js).
3. Fill in your credentials at the top of the script:

```js
const API_KEY   = "<YOUR_GEMINI_API_KEY>";
const serverUrl = "http://localhost:3000/send";  // or your deployed URL
```

4. Save and enable the script.
5. Navigate to any MCQ page on `sanfoundry.com`.

> **Note:** The `logging` flag in the script can be set to `false` if you only want AI explanations without saving to the backend.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/` | Health check - returns `"Server is working!"` |
| `POST` | `/send` | Save a Q&A entry. Body: `{ question, answer, info }` |
| `GET` | `/show` | HTML dashboard of all logged entries |

### POST `/send` - Request Body

```json
{
  "question": "Which command lists files in Linux?",
  "answer": "ls",
  "info": "The `ls` command lists directory contents. ..."
}
```

Returns `409 Conflict` if the question already exists in the database.

---

## Dashboard (`/show`)

Browse all logged entries at `http://localhost:3000/show`. Each card shows:

- The question
- The correct answer
- The AI-generated explanation

---

## Configuration

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGODB_URI` | `.env` | MongoDB connection string |
| `API_KEY` | `userscript.js` | Gemini API key (set locally, never commit) |
| `serverUrl` | `userscript.js` | URL of your Express backend's `/send` endpoint |
| `logging` | `userscript.js` | `true` to log to backend, `false` to disable |
| `PORT` | `app.js` | Server port (default: `3000`) |

---

## License

ISC
