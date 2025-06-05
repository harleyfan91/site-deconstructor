
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3a4c0dbb-697f-4cc3-8786-dfa109c5a225

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3a4c0dbb-697f-4cc3-8786-dfa109c5a225) and start prompting.

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
- Material-UI
- Tailwind CSS
- Supabase (Backend & Database)

## Tech Stack Detection

This application uses **Wappalyzer** for accurate technology detection on analyzed websites. Wappalyzer is an open-source tool that identifies technologies used on websites including:

- JavaScript frameworks (React, Vue, Angular, etc.)
- CSS frameworks (Bootstrap, Tailwind, etc.)
- Content Management Systems
- Analytics tools
- E-commerce platforms
- Web servers and hosting solutions
- And much more...

The integration provides comprehensive technology fingerprinting without requiring API keys or external dependencies beyond the Wappalyzer npm package.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3a4c0dbb-697f-4cc3-8786-dfa109c5a225) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Continuous Integration and Testing

Automated tests cover the analysis utilities, export functions and UI helpers.
Every pull request runs these tests via GitHub Actions using the workflow at
`.github/workflows/ci.yml`.

Run tests locally with:

```sh
npm run test
npx tsc -p tsconfig.json --noEmit
```

## Manual UI Review

For changes that affect the dashboard, follow the
[Manual UI Review Checklist](docs/Manual_UI_Checklist.md). It walks through
loading the app locally, verifying each tab, testing export features and checking
responsive layout.
