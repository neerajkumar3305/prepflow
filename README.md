# PrepFlow

A static web app (no build step, no server) for daily checklists, syllabus, goals, fitness and budget tracking.

## Files
- `index.html`: page shell and navigation
- `styles.css`: layout and theme (light and dark, follows your device setting)
- `data.js`: default syllabus (Nov 4, 2026 to Jan 10, 2027), default goals, budget categories
- `app.js`: all app logic (tasks, photo import, reminders, streaks, syllabus editor, goals, fitness, budget, backup)
- `sw.js`, `manifest.webmanifest`, `icon.svg`: offline support and "install as app"

## Run locally
From this folder:

    python3 -m http.server 8080

Open http://localhost:8080

## Deploy (pick one)
- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder onto the page. You get a public HTTPS link in seconds.
- **GitHub Pages:** create a repository, upload these files, then Settings > Pages > deploy from the main branch.
- **Vercel:** install the Vercel CLI and run `vercel` in this folder, or import the repository on vercel.com. Choose "Other" as the framework preset.

HTTPS matters: notifications and the service worker only work on HTTPS (or localhost).

## Install on your phone
Open the link in Chrome (Android) or Safari (iOS), then choose "Add to Home Screen". It opens full screen like an app.

## Your data
Everything is stored in the browser on that device (localStorage). Clearing browser data erases it, so use Home > Backup > Download backup now and then. Restore the file on any device with Backup > Restore.

## Reminders: what works and what does not
- Hourly pending-task reminders, daily gym, cardio, meal and expense reminders fire while the app is open in a tab.
- Browser notifications need permission (the app asks when you turn on hourly reminders). They also need the page to be running.
- When the app is fully closed, no reminder can fire. True background push reminders need a server-side push service, which this static app does not include.

## Editing the syllabus and goals
- **Syllabus:** Plan > Syllabus. Pick a day and press "Edit this day", or open the full table and press the pencil icon. "Reset to original plan" restores the default.
- **Goals:** Plan > Goals. Add, edit or delete any goal. Count goals can track automatically (gym, cardio, diet, expense days). Competitions have their own list where you add the ones you enter.

## Changing the defaults
Edit `data.js` before deploying to change the starting syllabus, goals or budget categories. Once someone has used the app, their saved edits in the browser take priority over these defaults.

## Google Drive sync (one-time setup)
1. Go to console.cloud.google.com, create a project, and enable the **Google Drive API**.
2. Under APIs & Services > OAuth consent screen, set it up as External and add your Google account as a test user.
3. Under Credentials, create an **OAuth client ID** of type **Web application**. Add your app's web address (for example, your Netlify or GitHub Pages link, and http://localhost:8080 for local testing) as an authorised JavaScript origin.
4. Paste the Client ID into `data.js` in place of `PASTE_YOUR_GOOGLE_CLIENT_ID...`.
5. Open the app, go to Home > Google Drive > Connect Google Drive, and allow access.

After that, changes save to a file called `prepflow-backup.json` in your Drive. Google sign-in does not persist across a page reload, so reconnect after reloading. The app only accesses the file it creates (drive.file scope).

## Offline use
- The app works without internet once it has loaded once. All app files are cached by `sw.js`.
- Progress is always saved on the device first. Drive sync happens when you are online.
- If Drive sync fails or you are offline, the app keeps the changes and sends them when the connection returns.
- To install on a laptop: open the app in Chrome or Edge, then choose "Install PrepFlow" from the address bar menu.
- To install on a phone: use "Add to Home Screen".
- Google Drive sign-in needs internet. Connect once from Home after opening the app.

## Run it
- Put the folder on a secure (https) address, or run `python3 -m http.server 8080` and open http://localhost:8080.
- Offline use starts after the first load. Do the first load while online.
