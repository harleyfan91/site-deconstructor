# Website Analysis Tool

## Project info

A comprehensive website analysis tool that provides insights into performance, SEO, accessibility, and design elements.

## How can I edit this code?

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

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

* Navigate to the desired file(s).
* Click the "Edit" button (pencil icon) at the top right of the file view.
* Make your changes and commit the changes.

**Use GitHub Codespaces**

* Navigate to the main page of your repository.
* Click on the "Code" button (green button) near the top right.
* Select the "Codespaces" tab.
* Click on "New codespace" to launch a new Codespace environment.
* Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

* **React**
* **Vite**
* **Tailwind CSS**
* **Material-UI**
* **Radix UI**
* **Emotion**
* **Express.js**
* **Drizzle ORM**
* **Drizzle Zod**
* **Supabase JS Client**
* **Wappalyzer**
* **Neon Database**

*For a complete list of all frameworks and libraries (including package names and versions), see [docs/TECH\_STACK.md](docs/TECH_STACK.md).*

## Tech Stack Detection

This application uses **Wappalyzer** for accurate technology detection on analyzed websites. Wappalyzer now runs server-side to provide real-time technology identification including:

* JavaScript frameworks (React, Vue, Angular, etc.)
* CSS frameworks (Bootstrap, Tailwind, etc.)
* Content Management Systems
* Analytics tools
* E-commerce platforms
* Web servers and hosting solutions
* And much more...

The integration provides comprehensive technology fingerprinting without requiring API keys or external dependencies beyond the Wappalyzer npm package.

## Supabase Setup

Copy `.env.example` to `.env` in the project root and fill in your Supabase credentials. The required environment variables are:

```sh
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
PSI_API_KEY=<your-google-psi-key>
```

* `VITE_SUPABASE_URL`: Your Supabase project URL
* `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side operations
* `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side operations (optional)
* `PSI_API_KEY`: Google PageSpeed Insights API key (optional but recommended)

To enable color palette extraction with `node-vibrant`, install the optional dependency pinned to version `^4.0.3`:

```sh
npm install node-vibrant@^4
```

The library now includes its own TypeScript definitions.

## How can I deploy this project?

Deploy using your preferred hosting platform that supports Node.js applications.

## Continuous Integration and Testing

Automated tests cover the analysis utilities, export functions and UI helpers.
Every pull request runs these tests via GitHub Actions using the workflow at
`.github/workflows/ci.yml`.

Run tests locally with:

```sh
npm test
```

## Manual UI Review

For changes that affect the dashboard, follow the
[Manual UI Review Checklist](docs/Manual_UI_Checklist.md). It walks through
loading the app locally, verifying each tab, testing export features and checking
responsive layout.

// Run your usual "lint" and "tsc --noEmit" commands.
// All remaining errors should be unrelated to colour extraction.
