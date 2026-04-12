# SmartShelf

SmartShelf is a mini Goodreads-style book recommendation system with a Spring Boot backend and a React frontend. It uses Google Books for discovery, MySQL for persistence, Spring Data JPA for CRUD flows, and JDBC for analytics plus recommendation queries.

## Stack

- Backend: Spring Boot 3, Spring Security, JWT, Spring Data JPA, JDBC, MySQL
- Frontend: React 18, Vite, Axios, React Router
- External API: Google Books API

## Project Structure

- [backend](C:/Projects/SmartShelf/backend)
- [frontend](C:/Projects/SmartShelf/frontend)
- [docs/sql/schema.sql](C:/Projects/SmartShelf/docs/sql/schema.sql)

## Environment Files

Your credentials have been added to:

- [backend/.env](C:/Projects/SmartShelf/backend/.env)
- [frontend/.env](C:/Projects/SmartShelf/frontend/.env)

Safe templates for GitHub/deployment:

- [backend/.env.example](C:/Projects/SmartShelf/backend/.env.example)
- [frontend/.env.example](C:/Projects/SmartShelf/frontend/.env.example)

Backend variables:

- `MYSQL_URL`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `GOOGLE_BOOKS_API_KEY`
- `JWT_SECRET`
- `JWT_EXPIRATION`
- `FRONTEND_ORIGIN`

Frontend variables:

- `VITE_API_URL`

## Backend Features

- JWT-based register/login at `/api/auth`
- Google Books search and book import at `/api/books`
- Library shelves for `READ`, `WISHLIST`, and `FAVORITE`
- Ratings and reviews at `/api/reviews`
- JDBC recommendations and analytics at `/api/recommendations`

## Frontend Pages

- `/` Home with trending and analytics-driven shelves
- `/search` Google Books search with infinite scroll
- `/books/:googleBookId` details, shelf actions, and reviews
- `/dashboard` user shelves and genre recommendations
- `/auth` login/register

## Run Locally

### Backend

This repo includes a Maven `pom.xml`, but Maven is not installed in the current machine session, so I could scaffold the backend but not build it yet here.

1. Install Maven, or generate/use a Maven Wrapper.
2. From `C:\Projects\SmartShelf\backend`, run:

```powershell
mvn spring-boot:run
```

The API will start on `http://localhost:8080`.

### Frontend

1. From `C:\Projects\SmartShelf\frontend`, install dependencies:

```powershell
npm install
```

2. Start the app:

```powershell
npm run dev
```

The UI will start on `http://localhost:5173`.

## Deployment

### Railway Backend

- Create a new Railway project from the GitHub repo.
- Set the service root directory to `backend`.
- Railway can use the included [backend/Dockerfile](C:/Projects/SmartShelf/backend/Dockerfile).
- Add environment variables from [backend/.env.example](C:/Projects/SmartShelf/backend/.env.example).
- Set `FRONTEND_ORIGIN` to your final Vercel URL.

### Vercel Frontend

- Import the same GitHub repo into Vercel.
- Set the project root directory to `frontend`.
- Add `VITE_API_URL` and point it to your Railway backend URL plus `/api`.
- Redeploy after the backend URL is live.

## Notes

- Hibernate is configured with `ddl-auto: update`, so Spring Boot can create tables automatically.
- A normalized SQL schema is also included in [docs/sql/schema.sql](C:/Projects/SmartShelf/docs/sql/schema.sql) if you want manual setup.
- The recommendation engine uses JDBC for genre suggestions, "also liked", and analytics queries.
- If you want, the next step can be adding tests, Docker support, seed data, and a Maven Wrapper so the backend runs with one command.

## Copyright

Copyright (c) 2026 Vaibhav Parab. All rights reserved.
