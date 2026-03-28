# Notes Client

A simple notes application frontend built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

This app provides:
- User authentication (sign up / sign in)
- Token-based session persistence in localStorage
- Create, read, update, and delete notes
- Protected routes for authenticated users

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## App Flow

- `/` redirects users based on auth state:
	- Authenticated users -> `/notes`
	- Unauthenticated users -> `/sign-in`
- Auth pages:
	- `/sign-in`
	- `/sign-up`
- Notes pages (protected):
	- `/notes` (list notes)
	- `/notes/new` (create note)
	- `/notes/[id]/edit` (edit note)

## API Configuration

The frontend uses `NEXT_PUBLIC_API_URL` as the API base URL.

- If set, it uses that value (without trailing slash).
- If not set, it defaults to:

`https://notes-api-db1i.onrender.com`

Create a `.env.local` file in the project root if you want to use a different backend:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Open the app:

`http://localhost:3000`

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Auth token and user profile are stored in browser `localStorage`.
- API requests to notes endpoints include a Bearer token.
- A `401` response logs the user out and redirects to sign-in.