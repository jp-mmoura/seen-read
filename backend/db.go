package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
	"golang.org/x/crypto/bcrypt"
)

var db *sql.DB

func initDB() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		exe, _ := os.Executable()
		dbPath = filepath.Join(filepath.Dir(exe), "entries.db")
	}
	// If DB_PATH is relative, resolve from working directory
	if !filepath.IsAbs(dbPath) {
		wd, _ := os.Getwd()
		dbPath = filepath.Join(wd, dbPath)
	}

	var err error
	db, err = sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	// Enable WAL mode for better concurrent read performance
	db.Exec("PRAGMA journal_mode=WAL")

	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS entries (
			id         TEXT PRIMARY KEY,
			date       TEXT NOT NULL,
			type       TEXT NOT NULL,
			title      TEXT NOT NULL,
			year       INTEGER,
			author     TEXT,
			episode    TEXT,
			teams      TEXT,
			result     TEXT,
			rating     INTEGER,
			notes      TEXT,
			created_at TEXT DEFAULT (datetime('now'))
		);

		CREATE TABLE IF NOT EXISTS settings (
			key   TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
	`)
	if err != nil {
		log.Fatalf("failed to create tables: %v", err)
	}

	// Seed default password if none exists
	var count int
	db.QueryRow("SELECT COUNT(*) FROM settings WHERE key = 'password_hash'").Scan(&count)
	if count == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("changeme"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("failed to hash default password: %v", err)
		}
		db.Exec("INSERT INTO settings (key, value) VALUES ('password_hash', ?)", string(hash))
		fmt.Println("⚠  Default password set to 'changeme' — please change it after first login.")
	}

	log.Printf("Database ready: %s", dbPath)
}

func getPasswordHash() (string, error) {
	var hash string
	err := db.QueryRow("SELECT value FROM settings WHERE key = 'password_hash'").Scan(&hash)
	return hash, err
}

func setPasswordHash(hash string) error {
	_, err := db.Exec("UPDATE settings SET value = ? WHERE key = 'password_hash'", hash)
	return err
}
