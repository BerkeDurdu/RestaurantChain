# ChainOps / RestaurantChain

An Express + SQLite-based demo application designed to monitor restaurant chain operations.
The application provides branch statuses, stock tracking, alerts, hourly order charts, date-range reports, user authentication, multi-tenancy, and multi-language support (TR/EN).

## Requirements

- Node.js 18 or newer
- npm

No additional database setup is required. The application creates a local SQLite database on its first launch.

## Installation

1. Navigate to the project folder:

```bash
cd RestaurantChain
```

2. Install dependencies:

```bash
npm install
```

3. Start the application:

```bash
npm start
```

For auto-restart during development:

```bash
npm run dev
```

## Opening the Application

The server runs on `http://localhost:3000` by default.

- Main dashboard: `http://localhost:3000/`
- Login screen: `http://localhost:3000/login.html`

Unauthenticated users attempting to visit the main page are automatically redirected to the login screen.

## First Use

1. Open the `login.html` page.
2. Create a new admin account from the `Register` tab.
3. After registration, the system automatically logs you in and redirects to the main dashboard.

On the first run, the application may also create a bootstrap admin account. In this case, the username and password will be shown in the terminal output.

## Features

- **Multi-language Support (i18n)**: Switch seamlessly between Turkish and English interfaces.
- **Authentication & Security**: JWT-based session management and secure password hashing.
- **Multi-tenant Architecture**: Users can only see, manage, and create branches/products associated with their own accounts.
- **Branch-based Operations Monitoring**: Live view of branch metrics.
- **Live POS and Kitchen Delay Metrics**: Real-time operational data.
- **Stock and Critical Stock List**: Automated stock level warnings.
- **Alert Stream**: Real-time notifications for critical branch issues.
- **Comprehensive Reports**: Daily, weekly, monthly, and yearly aggregated data.
- **Dynamic Data Management**: Adding custom branches and tracking custom stock items per branch.

## Important Notes

- `server/simulator.js` updates order, stock, POS, and alert data in the background every 3 seconds. Because of this, screen values may constantly change during testing.
- The database file is created under `server/chainops.db` and should not be added to the repository.
- Optional environment variables:
  - `PORT`: Port on which the server will run
  - `JWT_SECRET`: Session authentication key

## Project Structure

```text
app.js
i18n.js
index.html
login.css
login.html
login.js
styles.css
package.json
server/
  auth.js
  db.js
  reports.js
  server.js
  simulator.js
```

## Troubleshooting

- If `npm start` does not work, run the `npm install` command again first.
- If the main page does not open after login, clear your browser cookies and try again.
- If data changes unexpectedly, this is due to the live simulator; this behavior is normal.
