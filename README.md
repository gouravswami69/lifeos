# lifeOS — Personal + College Life Dashboard

A dark, mobile-first personal workspace for college updates, tasks, dates, notes and simple expense tracking.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal (usually http://localhost:5173). The API server runs on http://localhost:8787 and Vite proxies `/api` requests to it.

## College update monitor

The backend checks the public Dronacharya College of Engineering website:

- https://ggnindia.dronacharya.info/

It reads relevant linked text from the official homepage and returns the original source links. The dashboard checks on opening and every six hours while it remains open; the College Hub also has a manual refresh button.

**Important:** This first version is a best-effort public-page reader, not an official college integration. Website redesigns, blocked requests, or notices published only in department pages/PDFs may not be detected. Always open and verify important notices at the original source.

## Data and privacy

Tasks, calendar events, notes and expense entries are stored in this browser's localStorage. They are not synced between devices and are not backed up. Do not enter sensitive financial or personal information. Cross-device sync, login and push notifications can be added in a later phase using a database and authentication.

## Phone installation

After deploying over HTTPS, open the website in your phone browser and choose **Add to Home Screen** / **Install app**. A web manifest is included. A lightweight service worker caches the app shell. Live college updates still require an internet connection.

## Production build

```bash
npm run build
npm start
```

The Express server serves the `dist` folder and the college update API.
