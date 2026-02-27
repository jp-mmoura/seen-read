"use client";

import { useState, useEffect, useId } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type MediaType =
  | "movie"
  | "short"
  | "series"
  | "book"
  | "play"
  | "short_story"
  | "sports";

interface Entry {
  id: string;
  date: string; // "YYYY-MM-DD"
  type: MediaType;
  title: string;
  year?: number;
  author?: string;
  episode?: string;
  teams?: string;
  result?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
// Edit this array to seed your log. All entries are stored in localStorage.

const SEED_ENTRIES: Entry[] = [
  {
    id: "seed-1",
    date: "2026-02-13",
    type: "movie",
    title: "Is This Thing On?",
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const MEDIA_TYPES: { id: MediaType; label: string }[] = [
  { id: "movie",       label: "Movie"        },
  { id: "short",       label: "Short Film"   },
  { id: "series",      label: "TV Series"    },
  { id: "book",        label: "Book"         },
  { id: "play",        label: "Play"         },
  { id: "short_story", label: "Short Story"  },
  { id: "sports",      label: "Sports"       },
];

const MONTHS = [
  "JAN","FEB","MAR","APR","MAY","JUN",
  "JUL","AUG","SEP","OCT","NOV","DEC",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatMonthKey(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${MONTHS[parseInt(m) - 1]} ${y}`;
}

function formatDayDate(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${m}/${d}`;
}

function groupByMonth(entries: Entry[]): [string, [string, Entry[]][]][] {
  const monthMap: Record<string, Record<string, Entry[]>> = {};

  for (const entry of entries) {
    const monthKey = formatMonthKey(entry.date);
    if (!monthMap[monthKey]) monthMap[monthKey] = {};
    if (!monthMap[monthKey][entry.date]) monthMap[monthKey][entry.date] = [];
    monthMap[monthKey][entry.date].push(entry);
  }

  return Object.entries(monthMap)
    .sort(([, daysA], [, daysB]) => {
      const dateA = Object.keys(daysA).sort().pop()!;
      const dateB = Object.keys(daysB).sort().pop()!;
      return dateB.localeCompare(dateA);
    })
    .map(([month, days]) => [
      month,
      Object.entries(days).sort(([a], [b]) => b.localeCompare(a)),
    ]);
}

function entryClassName(type: MediaType): string {
  const map: Record<MediaType, string> = {
    movie:       "movies",
    short:       "shorts",
    series:      "series",
    book:        "books",
    play:        "plays",
    short_story: "short-stories",
    sports:      "sports",
  };
  return map[type];
}

function Stars({ n }: { n: number }) {
  return (
    <span className="entry-stars">
      {"★".repeat(n)}{"☆".repeat(5 - n)}
    </span>
  );
}

function EntryMeta({ entry }: { entry: Entry }) {
  const parts: string[] = [];
  if (entry.year)    parts.push(String(entry.year));
  if (entry.author)  parts.push(entry.author);
  if (entry.episode) parts.push(entry.episode);
  if (entry.teams)   parts.push(entry.teams);
  if (entry.result)  parts.push(entry.result);
  if (!parts.length) return null;
  return <span className="entry-meta">{parts.join(" · ")}</span>;
}

// ─── ADD ENTRY MODAL ──────────────────────────────────────────────────────────

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  type: "movie" as MediaType,
  title: "",
  year: "",
  author: "",
  episode: "",
  teams: "",
  result: "",
  rating: 0,
  notes: "",
};

function AddEntryModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (entry: Entry) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const uid = useId();

  const set = <K extends keyof typeof EMPTY_FORM>(k: K, v: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: form.date,
      type: form.type,
      title: form.title.trim(),
      year:    form.year    ? Number(form.year)  : undefined,
      author:  form.author  || undefined,
      episode: form.episode || undefined,
      teams:   form.teams   || undefined,
      result:  form.result  || undefined,
      rating:  form.rating  ? (form.rating as Entry["rating"]) : undefined,
      notes:   form.notes   || undefined,
    });
    onClose();
  };

  // Preview text
  const previewEntry: Entry = {
    id: "preview",
    date: form.date,
    type: form.type,
    title: form.title || "…",
    year:    form.year    ? Number(form.year) : undefined,
    author:  form.author  || undefined,
    episode: form.episode || undefined,
    teams:   form.teams   || undefined,
    result:  form.result  || undefined,
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-in" role="dialog" aria-modal aria-label="Log new entry">

        <h2 className="modal-title">— Log New Entry —</h2>

        <div className="form-grid">

          {/* Date + Type */}
          <div className="form-row">
            <label className="form-label" htmlFor={`${uid}-date`}>
              <span className="form-label-text">Date</span>
              <input
                id={`${uid}-date`}
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </label>
            <label className="form-label" htmlFor={`${uid}-type`}>
              <span className="form-label-text">Type</span>
              <select
                id={`${uid}-type`}
                value={form.type}
                onChange={(e) => set("type", e.target.value as MediaType)}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Title */}
          <label className="form-label" htmlFor={`${uid}-title`}>
            <span className="form-label-text">Title</span>
            <input
              id={`${uid}-title`}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={
                form.type === "movie"       ? "e.g. Chinatown"           :
                form.type === "book"        ? "e.g. The Maltese Falcon"  :
                form.type === "series"      ? "e.g. The Wire"            :
                form.type === "short"       ? "e.g. Un Chien Andalou"    :
                form.type === "play"        ? "e.g. Death of a Salesman" :
                form.type === "short_story" ? "e.g. The Dead"            :
                "e.g. NBA Finals"
              }
              autoFocus
            />
          </label>

          {/* Conditional fields */}
          {(form.type === "movie" || form.type === "short") && (
            <label className="form-label" htmlFor={`${uid}-year`}>
              <span className="form-label-text">Year</span>
              <input
                id={`${uid}-year`}
                type="number"
                value={form.year}
                onChange={(e) => set("year", e.target.value as "")}
                placeholder="e.g. 1974"
                min={1888}
                max={new Date().getFullYear() + 2}
              />
            </label>
          )}

          {(form.type === "book" || form.type === "play" || form.type === "short_story") && (
            <label className="form-label" htmlFor={`${uid}-author`}>
              <span className="form-label-text">
                {form.type === "play" ? "Playwright" : "Author"}
              </span>
              <input
                id={`${uid}-author`}
                value={form.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="e.g. Raymond Chandler"
              />
            </label>
          )}

          {form.type === "series" && (
            <label className="form-label" htmlFor={`${uid}-episode`}>
              <span className="form-label-text">Episode(s)</span>
              <input
                id={`${uid}-episode`}
                value={form.episode}
                onChange={(e) => set("episode", e.target.value)}
                placeholder="e.g. S1E1–4"
              />
            </label>
          )}

          {form.type === "sports" && (
            <div className="form-row">
              <label className="form-label" htmlFor={`${uid}-teams`}>
                <span className="form-label-text">Teams / Event</span>
                <input
                  id={`${uid}-teams`}
                  value={form.teams}
                  onChange={(e) => set("teams", e.target.value)}
                  placeholder="Lakers vs Celtics"
                />
              </label>
              <label className="form-label" htmlFor={`${uid}-result`}>
                <span className="form-label-text">Result</span>
                <input
                  id={`${uid}-result`}
                  value={form.result}
                  onChange={(e) => set("result", e.target.value)}
                  placeholder="112–108"
                />
              </label>
            </div>
          )}

          {/* Rating */}
          <div className="form-label">
            <span className="form-label-text">Rating</span>
            <div style={{ display: "flex", gap: "0.35rem", alignItems: "center", marginTop: "0.15rem" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className="star-btn"
                  onClick={() => set("rating", form.rating === n ? 0 : n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  style={{ color: n <= form.rating ? "var(--gold)" : "var(--text-mute)" }}
                >
                  {n <= form.rating ? "★" : "☆"}
                </button>
              ))}
              {form.rating > 0 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--text-mute)", marginLeft: "0.25rem" }}>
                  {form.rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Notes */}
          <label className="form-label" htmlFor={`${uid}-notes`}>
            <span className="form-label-text">Notes (optional)</span>
            <textarea
              id={`${uid}-notes`}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Brief thoughts…"
              style={{ resize: "vertical" }}
            />
          </label>

          {/* Live preview */}
          {form.title && (
            <div className="entry-preview">
              <span className="entry-preview-label">Preview</span>
              <span className={`entry-title ${entryClassName(form.type)}`}>
                {previewEntry.title}
                {form.result ? ` — ${form.result}` : ""}
              </span>
              {form.rating > 0 && <Stars n={form.rating} />}
              <EntryMeta entry={previewEntry} />
            </div>
          )}

        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!form.title.trim()}
          >
            Log Entry ✦
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── LEGEND ───────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="legend-grid">
      <span className="legend-item"><strong className="movies">MOVIE</strong></span>
      <span className="legend-item"><strong className="shorts">SHORT</strong></span>
      <span className="legend-item"><span className="series">TV SERIES</span></span>
      <span className="legend-item"><em className="books">Book</em></span>
      <span className="legend-item"><span className="plays">Play</span></span>
      <span className="legend-item"><em className="short-stories">Short Story</em></span>
      <span className="legend-item"><span className="sports">SPORTS — Result</span></span>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "seen-read-entries";

export default function HomePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [filterType, setFilterType] = useState<MediaType | "all">("all");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      } else {
        setEntries(SEED_ENTRIES);
      }
    } catch {
      setEntries(SEED_ENTRIES);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage
  const saveEntries = (updated: Entry[]) => {
    setEntries(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
  };

  const addEntry   = (e: Entry) => saveEntries([e, ...entries]);
  const deleteEntry = (id: string) => saveEntries(entries.filter((e) => e.id !== id));

  const filtered = filterType === "all"
    ? entries
    : entries.filter((e) => e.type === filterType);

  const grouped = groupByMonth(filtered);

  if (!hydrated) return null; // prevent SSR mismatch

  return (
    <main>

      {/* ── TOOLBAR ── */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Log Entry
        </button>

        <button
          className="btn btn-dark"
          onClick={() => setShowLegend((v) => !v)}
        >
          {showLegend ? "Hide Key" : "Key"}
        </button>

        <span className="toolbar-count">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
          {filterType !== "all" && ` · ${MEDIA_TYPES.find((t) => t.id === filterType)?.label}`}
        </span>
      </div>

      {/* ── LEGEND ── */}
      {showLegend && <Legend />}

      {/* ── TYPE FILTERS ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.75rem" }}>
        <button
          className={`filter-chip ${filterType === "all" ? "active" : ""}`}
          onClick={() => setFilterType("all")}
        >
          All
        </button>
        {MEDIA_TYPES.map((t) => (
          <button
            key={t.id}
            className={`filter-chip ${filterType === t.id ? "active" : ""}`}
            onClick={() => setFilterType(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LOG ── */}
      {grouped.length === 0 ? (
        <p className="empty-state">Nothing logged yet. Start the record.</p>
      ) : (
        grouped.map(([month, days]) => (
          <section key={month} className="month-section fade-in">
            <h2 className="month-header">{month}</h2>

            {days.map(([dateStr, dayEntries]) => (
              <div key={dateStr}>
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="entry-row">
                    <span className="entry-date">{formatDayDate(entry.date)}</span>
                    <div className="entry-content">
                      <div>
                        <span className={`entry-title ${entryClassName(entry.type)}`}>
                          {entry.title}
                          {entry.result ? ` — ${entry.result}` : ""}
                        </span>
                        {entry.rating && <Stars n={entry.rating} />}
                      </div>
                      <EntryMeta entry={entry} />
                      {entry.notes && (
                        <span className="entry-notes">{entry.notes}</span>
                      )}
                    </div>
                    <button
                      className="entry-delete"
                      onClick={() => deleteEntry(entry.id)}
                      aria-label={`Remove ${entry.title}`}
                    >
                      × remove
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))
      )}

      {/* ── MODAL ── */}
      {showModal && (
        <AddEntryModal onClose={() => setShowModal(false)} onAdd={addEntry} />
      )}

    </main>
  );
}