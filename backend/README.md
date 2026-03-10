# Go Authentication Backend

## Architecture

```
Next.js (:3000)  ──/api/*──▶  Go backend (:8080)
                                 │
                              SQLite (entries.db)
```

Single-user auth with bcrypt + JWT session cookies. Public read, private write.

## Files

| File | Purpose |
|---|---|
| `main.go` | HTTP server, CORS middleware, route registration |
| `auth.go` | JWT generation/validation, login/logout/change-password handlers, auth middleware |
| `entries.go` | Entry CRUD: GET (public), POST/DELETE (protected) |
| `db.go` | SQLite setup, schema migration, default password seeding |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/entries` | Public | List all entries |
| `POST` | `/api/entries` | Required | Create entry |
| `DELETE` | `/api/entries/{id}` | Required | Delete entry |
| `POST` | `/api/login` | — | Login with password |
| `POST` | `/api/logout` | — | Clear session |
| `POST` | `/api/change-password` | Required | Change password |
| `GET` | `/api/auth-status` | — | Check if authenticated |

## How to Run

```bash
# Terminal 1 — Go backend
cd backend
go build -o seen-read-backend .
DB_PATH=entries.db ./seen-read-backend
# → Listening on :8080

# Terminal 2 — Next.js frontend
npm run dev
# → http://localhost:3000
```

> **⚠ Default password is `changeme`** — change it after first login:
> ```bash
> curl -X POST -H 'Content-Type: application/json' \
>   -b cookies.txt \
>   -d '{"current":"changeme","new":"your-secure-password"}' \
>   http://localhost:8080/api/change-password
> ```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8080` | Server listen port |
| `DB_PATH` | `./entries.db` | Path to SQLite database file |
| `JWT_SECRET` | *(random)* | Secret for signing JWT tokens. Set this in production for persistent sessions across restarts. |
