# Rent Management — Landlord Frontend

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Architecture](#architecture)
- [Technologies Used](#technologies-used)
- [Setup Guide](#setup-guide)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [Build & Preview](#build--preview)
- [API Endpoints](#api-endpoints)
  - [Properties](#properties)
  - [Approvals & Payments (Chapa)](#approvals--payments-chapa)
  - [Reserve / Unreserve](#reserve--unreserve)
  - [Auth Callback](#auth-callback)
- [Micro-Frontend](#micro-frontend)
- [Logging & Error Handling](#logging--error-handling)
- [Security & CORS](#security--cors)
- [Planned: Gebeta Map](#planned-gebeta-map)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

## Introduction
The Landlord Frontend is a modern, production-ready single-page application for managing property listings, approvals, and payments within the Rent Management System. It integrates with the backend Property Listing Service and can interoperate with an AI Recommendations service. The UI is built with React, TypeScript, Tailwind, and shadcn/ui with strong internationalization support.

This codebase is also capable of reading an access token from the URL after external authentication and automatically authenticating backend requests.

## Features
- Create and manage property listings (with photos, amenities, details)
- Edit property (title, description, price, amenities)
- Approve & Pay: initiate approval and redirect to Chapa checkout (500 BIRR)
- Reserve / Unreserve property status
- View property details and landlord-only listings
- AI-powered search/recommendations (optional, if backend supports it)
- Multilingual UI (Amharic, English, Afan Oromo)
- Error boundary-friendly design and production toasts

## Architecture
```mermaid
flowchart TD
  subgraph UI[UI Layer]
    Landlord[Landlord Page]
    Cards[Property Cards]
    Dialogs[Dialogs: Edit / Approve\nReserve/Unreserve]
    Details[Property Details]
  end


  subgraph Services[Service Layer]
    API[propertyService / api.ts]
  end


  subgraph Backend[Backend API]
    Submit[/POST /properties/submit/]
    List[/GET /properties/]
    ById[/GET /properties/{id}/]
    MyProps[/GET /properties/my-properties/]
    Metrics[/GET /properties/metrics/]
    ApprovePay[/PATCH /properties/{id}/approve-and-pay]
    Reserve[/PATCH /properties/{id}/reserve]
    Unreserve[/PATCH /properties/{id}/unreserve]
    Update[/PUT /properties/{id}]
    Delete[/DELETE /properties/{id}]
  end


  Landlord --> Cards
  Landlord --> Dialogs
  Landlord --> Details


  Cards -->|actions| API
  Dialogs -->|actions| API
  Details -->|load| API


  API --> Submit & List & ById & MyProps & Metrics & ApprovePay & Reserve & Unreserve & Update & Delete
```

## Technologies Used
- React 18, TypeScript, Vite
- TailwindCSS, shadcn/ui (Radix primitives)
- i18next + http-backend + language detector
- Sonner + shadcn toaster
- TanStack Query (QueryClientProvider is set up)

## Setup Guide

### Prerequisites
- Node.js 18+ and npm

### Environment Variables
Create a `.env` file in the project root (never commit secrets). Supported variables include:

```
# Property/Recommendation API base (used by src/lib/api.ts)
VITE_RECO_API_BASE="https://your-api.example.com/api/v1"

# Alternatively, if you are using a Property Listing Service:
# VITE_API_BASE_URL="https://property-listing-service.onrender.com/api/v1/properties"
```

### Installation
```
npm install
```

### Running the Application
```
npm run dev
```
- Dev server starts (e.g., http://localhost:5173 or assigned port).

### Build & Preview
```
npm run build
npm run preview
```

## API Endpoints
This frontend is prepared to call both a Property Listing Service and an AI Recommendation service depending on configuration.

When using `VITE_RECO_API_BASE` (as seen in `src/lib/api.ts`):
- GET `/search` — property search (feature-flagged via `HAS_PROPERTY_SEARCH`)
- POST `/recommendations` — generate AI recommendations
- GET `/recommendations/mine` — list my generated recommendations
- GET `/recommendations/latest` — get latest recommendations
- POST `/recommendations/feedback` — send like/dislike feedback

When using a Property Listing Service (example mapping from the architecture diagram):
- POST `/api/v1/properties/submit` — submit listing (FormData; photos supported)
- GET `/api/v1/properties/` — public list (filters supported)
- GET `/api/v1/properties/{id}` — details
- GET `/api/v1/properties/my-properties` — landlord’s listings
- GET `/api/v1/properties/metrics` — basic metrics
- PUT `/api/v1/properties/{id}` — update listing
- DELETE `/api/v1/properties/{id}` — delete listing (returns 204)

### Approvals & Payments (Chapa)
- PATCH `/api/v1/properties/{id}/approve-and-pay` — returns `checkout_url`; UI redirects to Chapa

### Reserve / Unreserve
- PATCH `/api/v1/properties/{id}/reserve` — mark reserved (body: `{ reserved: true }`)
- PATCH `/api/v1/properties/{id}/unreserve` — remove reserved status

### Auth Callback
- GET `/auth/callback?token=...` or `#access_token=...` — stored to `localStorage` as `authToken` client-side, used for Authorization headers automatically.

How it works:
- `src/App.tsx` parses `token` or `access_token` from both query string and hash on app load, stores to `localStorage` via `useAuthStore().setToken`, shows a toast, and cleans the URL.
- `src/lib/api.ts` attaches `Authorization: Bearer <token>` to all requests. On `401`, it clears the token and redirects to `/`.

## Micro-Frontend
This repository can be embedded as a micro-frontend (route-level mount or MF/iframe integration) providing the landlord feature set.

## Logging & Error Handling
- Non-blocking toast notifications for most errors; `401` triggers token clear and redirect.
- Query retries are limited; window focus does not auto-refetch by default.

## Security & CORS
- Authorization: Bearer token read from `localStorage` as `authToken`.
- GET requests use standard headers; avoid unnecessary preflight where possible.
- `401` responses clear tokens and redirect to `/`.
- Vercel SPA routing: ensure deep links like `/auth/callback` load the SPA.

Vercel `vercel.json` essentials:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

## Planned: Gebeta Map
The UI is map-ready. Gebeta Map integration will display property geolocation (using `lat/lon` fields) on details and list views.

## Contributing
We welcome issues and PRs! Please:
- Open a descriptive issue
- Keep PRs focused and small
- Include screenshots/screencasts for UI changes

Standard workflow:
```
fork → feature branch → commit → open PR → review → merge
```

## Maintainers
- NEHAMIYA — UI Developer
- DAGMAI TEFERI — UI updates and integrations
  - Email: dagiteferi2011@gmail.com
  - WhatsApp: +251920362324
- ABENEZER — Developer

## License
Open source. See repository for license or open an issue if missing.
