# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c7f9c3c6-23fa-43cf-b994-03ed8d11a84f

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c7f9c3c6-23fa-43cf-b994-03ed8d11a84f) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c7f9c3c6-23fa-43cf-b994-03ed8d11a84f) and click on Share -> Publish.

## Authentication & Token Handling

This app is designed to receive an access token after a successful login on an external authentication service. When the user is redirected back to this app, the token can be provided in either the query string or the URL hash.

- Supported patterns on redirect:
  - `?token=...` or `?access_token=...`
  - `#token=...` or `#access_token=...`

How it works in the code:

- `src/App.tsx` includes a top-level `useEffect` that runs on app load:
  - Parses the token from the URL (query and/or hash).
  - Stores it in `localStorage` as `authToken` via `useAuthStore().setToken`.
  - Shows a success toast when stored.
  - Cleans the URL (removes token from the address bar) using `history.replaceState`.
- `src/lib/api.ts` uses an Axios request interceptor to automatically attach `Authorization: Bearer <token>` for all backend requests when `authToken` is present.
- If the backend returns `401`, the response interceptor clears the token and redirects to `/`.

Quick test locally:

1. Start the dev server: `npm run dev`
2. Visit one of the following URLs in your browser:
   - `http://localhost:5173/auth/callback?token=TEST123`
   - `http://localhost:5173/auth/callback#access_token=TEST123`
3. You should see a success toast and the URL will be cleaned to remove the token. The token will be saved as `authToken` in Local Storage.

Note: If you want to navigate to a specific page after capturing the token (e.g., `/dashboard`), add a redirect in the same `useEffect` after storing the token.

## Environment Variables

Create a `.env` file at the project root to configure runtime settings. Variables used in this project include:

- `VITE_RECO_API_BASE`: Base URL for the backend API powering search/recommendations.

Example `.env`:

```env
VITE_RECO_API_BASE=https://your-api.example.com/api/v1
```

## Vercel / SPA Routing Note

If deploying to Vercel (or any static host), ensure SPA-friendly routing so that deep links like `/auth/callback` load your app and client-side routing takes over. On Vercel, configure a rewrite to `index.html` for all paths.

Example `vercel.json` snippet:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
