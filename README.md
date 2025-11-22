#  Rent Management - Search and Filter Frontend

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black?logo=shadcn-ui)](https://ui.shadcn.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://vercel.com)

This repository contains the frontend for the Rent Management System's property search, filtering, and display functionality. It is a modern, responsive, and user-friendly interface designed to provide a seamless experience for tenants, landlords, and brokers.

The application allows users to browse property listings, apply advanced filters, view property details, and get AI-powered recommendations. It is built with a focus on performance, accessibility, and a clean user experience.

## ✨ Key Features

-   **Advanced Property Search:** Quickly find properties with a powerful keyword search.
-   **Comprehensive Filtering:** Narrow down results by location, price range, property type, number of bedrooms/bathrooms, and more.
-   **AI Recommendations:** A dedicated form to get personalized property suggestions based on user preferences.
-   **Interactive Property Cards:** Clean and informative cards to display key property details at a glance.
-   **Responsive Design:** Fully functional and visually appealing on all devices, from mobile phones to desktops.
-   **Modern UI/UX:** Built with the sleek and accessible **shadcn/ui** component library and styled with **Tailwind CSS**.
-   **Internationalization:** Multi-language support to cater to a diverse user base (powered by `i18next`).
-   **User Authentication Flow:** Includes components for user menus and authentication callbacks.
-   **Client-Side Routing:** Fast and smooth navigation between pages using `react-router-dom`.
-   **Efficient Data Fetching:** Uses `TanStack Query` to manage server state, providing a robust and performant data-fetching experience.

## 🛠️ Technologies Used

-   **Framework:** [React](https://reactjs.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
-   **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query/latest) & [Axios](https://axios-http.com/)
-   **Forms:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
-   **Internationalization:** [i18next](https://www.i18next.com/)
-   **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
-   [Bun](https://bun.sh/) (or `npm`/`yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/rent-management-system/search-and-filter-frontend.git
cd search-and-filter-frontend
```

### 2. Install Dependencies

Using `bun` (recommended):
```bash
bun install
```

Or using `npm`:
```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project by copying the example file:

```bash
cp .env.example .env
```

Now, open the `.env` file and add the base URL for the backend API:

```ini
# .env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Run the Application

Start the development server:

```bash
bun run dev
```

Or using `npm`:
```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

## 📂 Project Structure

The project follows a standard Vite + React structure, with key directories organized as follows:

```
/src
├── App.tsx           # Main application component with routing
├── main.tsx          # Application entry point
├── index.css         # Global styles
│
├── components/       # Reusable UI components
│   ├── ui/           # Unstyled components from shadcn/ui
│   ├── properties/   # Property-specific components (e.g., AIRecommendationForm)
│   ├── Footer.tsx
│   ├── Header.tsx
│   └── PropertyCard.tsx
│
├── hooks/            # Custom React hooks
│
├── lib/              # Core logic and utilities
│   ├── api.ts        # Axios instance and API call functions
│   ├── i18n.ts       # Internationalization setup
│   ├── store.ts      # Zustand store for global state
│   └── utils.ts      # Utility functions (e.g., cn for classnames)
│
└── pages/            # Top-level page components
    ├── Dashboard.tsx
    ├── Index.tsx
    └── AuthCallback.tsx
```

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements or want to report a bug, please feel free to open an issue or submit a pull request.

1.  **Fork** the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  **Commit** your changes (`git commit -m 'Add some feature'`).
5.  **Push** to the branch (`git push origin feature/your-feature-name`).
6.  Open a **Pull Request**.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.