# Cyberism: GenAI-Powered Cyberpunk Red RPG Web Application

**Author:** Chris (Coy) Coykendall (chriscoyfish@gmail.com)  
**Live Application:** [https://cyberism.coyfish.tech](https://cyberism.coyfish.tech)

A full-stack, server-side web application port of **Cyberism**, powered by Google Gemini AI, Cyberpunk Red tabletop mechanics, user authentication, and multi-slot persistent state saving.

---

## 🚀 Features

- **Cyberpunk Red RPG AI Game Master**: Immersive, dark & gritty narration driven by Google Gemini with Cyberpunk Red referee rules.
- **Dynamic 5-Choice Tactical Deck**: Generates 5 situational actions per turn with quick 1-click or keyboard (1-5) execution.
- **User Authentication**: Secure operative login & registration using JWT session cookies and bcrypt password hashing.
- **Multi-Slot State Saving**:
  - Cloud database persistence with multi-slot chronicle saves (Slots 1–5).
  - Turn-by-turn local autosaving.
  - JSON Datashard Export & Import for offline backups.
- **Character Dossier (Senna Bladesmith)**: Real-time tracking of HP vitals, Humanity meter, Eurodollars (₢), Cyberpunk Red attributes (REF, INT, TECH, COOL, WILL, EMP, BODY), installed Chrome / Cyberware, and Case Notes.
- **Tactical Terminal HUD**:
  - CRT scanlines filter toggle.
  - Web Audio API retro synthesized sound effects (terminal beeps, dice rolls, warning buzzers).
  - Rich text formatting for dialogue `"speech"`, custom actions `{actions}`, OOC rules queries `<ooc>`, and dice check badges `(d10 + stat vs DV)`.
  - Automatic `GAME OVER` post-mortem detection.

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **AI Engine**: Google Gemini API (`@google/generative-ai`)
- **Database / Storage**: LibSQL / SQLite (supports local file storage or remote Turso/Postgres/serverless)
- **Auth**: JOSE (JWT) + HTTP-only cookies + bcryptjs
- **Styling & Audio**: Cyberpunk CSS Design System + Web Audio API synthesizer

---

## 📦 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/chriscoyfish/cyberism.git
cd cyberism
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini API Key (https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret for Session Auth
JWT_SECRET=your_super_secret_jwt_key_here

# Database URL (Default: local SQLite database file)
DATABASE_URL=file:./cyberism.db
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deploy to Vercel

1. Push your repository to GitHub.
2. Import the repository in the [Vercel Dashboard](https://vercel.com).
3. Add the following **Environment Variables** in project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `JWT_SECRET`: A secure random secret string.
   - `DATABASE_URL` (optional): `file:./cyberism.db` or your Turso connection URL `libsql://your-db.turso.io`.
   - `DATABASE_AUTH_TOKEN` (optional): If using Turso cloud DB.
4. Click **Deploy**.

---

## 🎮 Game Controls & Syntax

- **Choices 1–5**: Press keys `1` to `5` on your keyboard or click any action button.
- **Speech**: Wrap dialogue in quotes `"like this"` to speak to NPCs.
- **Explicit Actions**: Wrap actions in curly braces `{like this}` (e.g. `{Draw pistol and take cover}`).
- **OOC / Rules**: Wrap questions in angle brackets `<like this>` (e.g. `<What is my handgun skill check?>`).
