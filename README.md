# XpensePro - Production Ready Expense Tracker

XpensePro is a high-performance, mobile-first expense tracking dashboard. It is designed to simulate a professional Flutter application experience using React and Tailwind CSS, featuring robust data management, secure session persistence, and advanced reporting.

## 🚀 Features

### 🔐 Authentication & Security
- **Secure Persistence**: User sessions and JWT-like tokens are stored securely in `localStorage`.
- **Protected Routes**: Navigation and API interactions are restricted based on authentication state.
- **Session Management**: Full logout flow that clears sensitive data and resets the application state.

### 📊 Dashboard & Analytics
- **Visual Reporting**: Real-time spending distribution using `recharts` (Pie charts).
- **Summary Cards**: Quick overview of total spending with dynamic currency support.
- **Recent Activity**: Glanceable list of the latest transactions.

### 💸 Expense Management
- **Full CRUD**: Create, Read, Update, and Delete expenses with sub-second UI feedback.
- **Infinite Scrolling**: Optimized list rendering that loads transactions in batches of 10 for performance.
- **Advanced Filtering**: 
  - Filter by Category.
  - Filter by specific Date Ranges (From/To).
  - Quick-clear functionality to reset view state.

### 🏷️ Category Management
- **Customization**: Add new categories with a custom name and color palette.
- **Inline Editing**: Modify existing categories without leaving the settings context.
- **Safety Logic**: Deleting a category automatically reassigns its associated expenses to a safe default, preventing data loss.

### ⚙️ User Profile & Settings
- **Profile Editing**: Real-time updates for user name and email.
- **Preferences**: 
  - **Currency**: Switch between INR, USD, EUR, GBP, and JPY.
  - **Notifications**: Toggle for push notification simulation.

## 🛠️ Tech Stack
- **Frontend**: React 19 (ESM)
- **Styling**: Tailwind CSS
- **Icons/UI**: Custom SVG set + Lucide-style aesthetics.
- **Charts**: Recharts
- **Storage**: LocalStorage via a simulated Async Mock API Service.

## 📥 Getting Started

### Prerequisites
- A modern web browser.
- A local development server (like VS Code Live Server) or simply open `index.html`.

### Installation
1. Clone the repository or download the source files.
2. Ensure `index.html`, `App.tsx`, `index.tsx`, and the `services/` folder are in the same directory.
3. No `npm install` is required for basic viewing as dependencies are mapped via `importmap` to `esm.sh`.

### Local Development
To run the app in a development environment:
```bash
# If using a simple static server
npx serve .
```

## 📝 Guidelines

### UI/UX Principles
- **Mobile First**: The app is strictly optimized for a max-width of `512px` (standard mobile portrait).
- **Feedback**: Every action (save, delete, sync) triggers a visual loading state or "Syncing" overlay.
- **Aesthetics**: Use of high-border-radius (`2.5rem`), soft shadows, and indigo-centric palettes.

### Data Structure
- **Expenses**: Linked to categories via `categoryId`.
- **Categories**: Independent entities with `name` and `hex color`.
- **Consistency**: All dates are handled in ISO 8601 format.

## 🧪 Testing the App
1. **Login**: Use the default credentials (already filled: `demo@xpense.com` / `password`).
2. **Add Data**: Use the "+" button or "Add Expense" on the dashboard.
3. **Manage**: Go to Settings -> Manage Categories to see the reassignment logic in action.
