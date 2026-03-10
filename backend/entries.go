package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

// Entry mirrors the frontend type.
type Entry struct {
	ID      string `json:"id"`
	Date    string `json:"date"`
	Type    string `json:"type"`
	Title   string `json:"title"`
	Year    *int   `json:"year,omitempty"`
	Author  *string `json:"author,omitempty"`
	Episode *string `json:"episode,omitempty"`
	Teams   *string `json:"teams,omitempty"`
	Result  *string `json:"result,omitempty"`
	Rating  *int    `json:"rating,omitempty"`
	Notes   *string `json:"notes,omitempty"`
}

func handleGetEntries(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query(`
		SELECT id, date, type, title, year, author, episode, teams, result, rating, notes
		FROM entries
		ORDER BY date DESC, created_at DESC
	`)
	if err != nil {
		http.Error(w, `{"error":"server error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	entries := []Entry{}
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.Date, &e.Type, &e.Title, &e.Year, &e.Author, &e.Episode, &e.Teams, &e.Result, &e.Rating, &e.Notes); err != nil {
			continue
		}
		entries = append(entries, e)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

func handleCreateEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var e Entry
	if err := json.NewDecoder(r.Body).Decode(&e); err != nil {
		http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(e.Title) == "" || e.Date == "" || e.Type == "" {
		http.Error(w, `{"error":"title, date, and type are required"}`, http.StatusBadRequest)
		return
	}

	e.ID = generateID()
	e.Title = strings.TrimSpace(e.Title)

	_, err := db.Exec(`
		INSERT INTO entries (id, date, type, title, year, author, episode, teams, result, rating, notes)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, e.ID, e.Date, e.Type, e.Title, e.Year, e.Author, e.Episode, e.Teams, e.Result, e.Rating, e.Notes)
	if err != nil {
		http.Error(w, `{"error":"server error"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(e)
}

func handleDeleteEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	// Extract ID from path: /api/entries/{id}
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 || parts[3] == "" {
		http.Error(w, `{"error":"entry ID required"}`, http.StatusBadRequest)
		return
	}
	id := parts[3]

	res, err := db.Exec("DELETE FROM entries WHERE id = ?", id)
	if err != nil {
		http.Error(w, `{"error":"server error"}`, http.StatusInternalServerError)
		return
	}

	n, _ := res.RowsAffected()
	if n == 0 {
		http.Error(w, `{"error":"entry not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"ok": true})
}
