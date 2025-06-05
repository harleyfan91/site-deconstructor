# Manual UI Review Checklist

Follow these steps to manually verify the dashboard after changes:

1. Run `npm run dev` and open the app in your browser.
2. Enter a sample URL (e.g. `https://example.com`) and start an analysis.
3. Wait for results and confirm each tab (Overview, UI, Performance, SEO, Technical, Compliance) displays data or `—` for missing values.
4. Confirm color palette, fonts, contrast warnings, social and cookie checks render.
5. Switch between light and dark mode to verify styling.
6. Use the export buttons to download CSV and JSON files and check their content matches the dashboard.
7. Refresh the page and ensure cached analyses load correctly.
8. Test on a mobile viewport to verify responsive layout.

Record any issues found and update tests if needed.
