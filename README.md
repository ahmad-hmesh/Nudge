# Nudge

A full-stack task manager built from scratch — designed, coded, and deployed entirely without a formal coding background, starting on a phone (Termux + Acode) and later moved to a full desktop dev environment.

🔗 **Live app:** https://nudge-mnip.onrender.com/

## Features

- Full CRUD task management — create, edit, complete, and delete tasks
- Priority levels, due dates/times, and optional categories
- Search and filter through tasks
- Installable as a PWA — works offline and installs like a native app on desktop or mobile
- Browser notifications to remind you of upcoming tasks

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** SQLite (via better-sqlite3)
- **Frontend:** Vanilla HTML/CSS/JavaScript — no framework
- **PWA:** Web App Manifest + Service Worker for offline support and installability
- **Deployment:** Render

## Running it locally

```bash
git clone https://github.com/ahmad-hmesh/Nudge.git
cd Nudge
npm install
npm start
```

Then open `http://localhost:3000` in your browser.

## Project background

Nudge started as a simple to-do list API built to learn backend fundamentals — routing, validation, and databases — before growing into a complete task manager with a custom-designed frontend and, later, offline support and notifications. It's part of a personal portfolio built alongside [Tarot Match](https://github.com/ahmad-hmesh/ahmad-hmesh), a tarot-themed memory game.

## Author

**Ahmad Hmesh**
📧 ahmad.hmesh.04@gmail.com
💻 [github.com/ahmad-hmesh](https://github.com/ahmad-hmesh)
