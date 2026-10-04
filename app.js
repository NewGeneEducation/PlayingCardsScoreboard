* {
  box-sizing: border-box;
}

:root {
  --bg: #0f172a;
  --bg-elevated: #111827;
  --panel: rgba(15, 23, 42, 0.9);
  --panel-strong: rgba(15, 23, 42, 1);
  --surface: rgba(30, 41, 59, 0.9);
  --surface-border: rgba(148, 163, 184, 0.2);
  --text: #e2e8f0;
  --muted: #94a3b8;
  --primary: #38bdf8;
  --primary-strong: #0ea5e9;
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #f87171;
  --shadow: 0 18px 45px rgba(15, 23, 42, 0.25);
}

body[data-theme='light'] {
  --bg: #f8fafc;
  --bg-elevated: #e2e8f0;
  --panel: rgba(255, 255, 255, 0.9);
  --panel-strong: rgba(255, 255, 255, 1);
  --surface: rgba(255, 255, 255, 0.9);
  --surface-border: rgba(148, 163, 184, 0.2);
  --text: #0f172a;
  --muted: #475569;
  --primary: #0284c7;
  --primary-strong: #0369a1;
  --success: #16a34a;
  --warning: #d97706;
  --danger: #dc2626;
  --shadow: 0 18px 45px rgba(148, 163, 184, 0.18);
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background: radial-gradient(circle at top, rgba(56, 189, 248, 0.18), transparent 35%), var(--bg);
  color: var(--text);
  transition: background 0.25s ease, color 0.25s ease;
}

img {
  display: block;
  max-width: 100%;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 1rem;
  margin-top: 0.5rem;
  border: 1px solid var(--surface-border);
  border-radius: 16px;
  background: var(--panel);
  box-shadow: var(--shadow);
  position: sticky;
  top: 0.5rem;
  backdrop-filter: blur(12px);
  z-index: 10;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.brand img {
  width: 34px;
  height: 34px;
  border-radius: 10px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-link {
  text-decoration: none;
  color: var(--muted);
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  transition: 0.2s ease;
  font-weight: 600;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(56, 189, 248, 0.12);
  color: var(--text);
}

.container {
  margin-top: 1.25rem;
}

.panel {
  border: 1px solid var(--surface-border);
  background: var(--panel);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 1.1rem;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.72rem;
  color: var(--primary);
  margin: 0 0 0.35rem;
  font-weight: 700;
}

h1, h2, h3, p {
  margin-top: 0;
}

h1 {
  font-size: clamp(2rem, 3vw, 2.5rem);
  margin-bottom: 0.4rem;
}

.lead {
  color: var(--muted);
  margin-bottom: 0;
  max-width: 48ch;
}

.hero-actions,
.section-actions,
.form-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 0.8rem 1.1rem;
  font-weight: 700;
  transition: transform 0.18s ease, opacity 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.08);
  color: var(--text);
  border: 1px solid var(--surface-border);
}

.btn-danger {
  background: rgba(248, 113, 113, 0.12);
  border: 1px solid rgba(248, 113, 113, 0.25);
  color: var(--danger);
}

.hidden {
  display: none !important;
}

.stats-grid,
.content-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.25rem;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.content-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-card {
  padding: 1rem 1.1rem;
}

.stat-label {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-card h2 {
  margin: 0.5rem 0 0;
  font-size: clamp(1.5rem, 2vw, 2.1rem);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.list-stack {
  display: grid;
  gap: 0.8rem;
}

.leader-row,
.round-row,
.player-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  background: var(--surface);
}

.player-meta,
.round-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.player-score,
.round-score {
  font-weight: 700;
  color: var(--primary);
}

.scoreboard-entries {
  display: grid;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.score-row {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(90px, 120px) minmax(90px, 110px);
  gap: 1rem;
  align-items: center;
  padding: 0.8rem 0.9rem;
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  background: var(--surface);
}

.score-row .player-name {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.score-row .player-score-total {
  font-weight: 700;
  color: var(--success);
  text-align: center;
}

.input-label {
  display: block;
  color: var(--muted);
  font-size: 0.82rem;
  margin-bottom: 0.45rem;
  font-weight: 700;
}

input[type='text'],
input[type='number'] {
  width: 100%;
  border: 1px solid var(--surface-border);
  background: rgba(15, 23, 42, 0.15);
  color: var(--text);
  border-radius: 10px;
  padding: 0.72rem 0.8rem;
}

body[data-theme='light'] input[type='text'],
body[data-theme='light'] input[type='number'] {
  background: rgba(148, 163, 184, 0.08);
}

.score-input {
  max-width: 120px;
  justify-self: end;
}

.inline-form {
  display: flex;
  align-items: end;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.players-list {
  display: grid;
  gap: 0.8rem;
}

.player-card button {
  min-width: 110px;
}

.settings-panel {
  max-width: 700px;
}

.setting-group {
  margin-top: 1rem;
}

.segmented-control {
  display: inline-flex;
  padding: 0.3rem;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--surface-border);
}

.segmented-btn {
  border: none;
  background: transparent;
  color: var(--muted);
  padding: 0.7rem 1rem;
  border-radius: 10px;
  font-weight: 700;
}

.segmented-btn.active {
  background: var(--primary);
  color: white;
}

.empty-state {
  color: var(--muted);
  padding: 1rem 0.25rem;
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav {
    justify-content: flex-start;
  }

  .stats-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .score-row {
    grid-template-columns: 1fr;
  }

  .score-input {
    justify-self: stretch;
    max-width: none;
  }
}
