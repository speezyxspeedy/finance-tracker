# SmartSpend — Smart Expense Tracker

> A modern, portfolio-quality personal expense tracker and financial management dashboard built as **Day 2 of my 365 Days Coding Challenge**.

![SmartSpend Banner](https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80)

---

## 📌 Day 2/365 — Building in Public

Welcome to **Day 2** of my journey to build 365 real-world, production-quality web projects in 365 days.

The mission of **SmartSpend** is to deliver a sleek, modern Software-as-a-Service (SaaS) financial management dashboard using **strictly vanilla web technologies** — demonstrating how much power, polish, and elegance can be achieved without heavy frameworks or external dependencies.

---

## 🚀 Overview

**SmartSpend** is a full-featured personal expense tracking application designed for professionals and developers who demand clarity and control over their finances. 

With a dark-mode-first aesthetic, glassmorphism design accents, real-time dynamic budget threshold warnings, and hand-crafted pure SVG analytics charts, SmartSpend feels like a real digital finance product you can rely on every single day.

---

## ✨ Features

### 📊 Real-Time Financial Dashboard
* **Dynamic Metric Cards**:
  * **Total Balance**: Real-time net balance across all inflows and outflows.
  * **Total Income**: Current month total with month-over-month percentage growth indicator.
  * **Total Expenses**: Current month spending with comparative trend tracking.
  * **Savings Rate**: Calculates what percentage of income is retained.
* **Monthly Spending Limit Bar**:
  * Set a customized monthly budget limit (e.g., ₹20,000 / $2,000).
  * Dynamic visual progress bar showing exact utilization and remaining headroom.
  * **Smart Warning**: Triggers amber warning at **80%** threshold.
  * **Danger Alert**: Triggers rose alert when **100%** limit is exceeded.
* **Monthly Overview Comparison**:
  * Head-to-head comparison between **Current Month** and **Previous Month** for Income, Expense, Net Savings, and Savings Rate.
* **Quick Actions**:
  * One-click shortcuts to add expenses, add income, or jump directly to analytics.

### 💳 Complete Transaction Management
* **Instant Inflow & Outflow Logging**: Income and Expense tracking with custom amounts, descriptions, categories, and dates.
* **Predefined Categories**: Food 🍔, Travel 🚗, Education 📚, Shopping 🛍️, Bills 💡, Entertainment 🎬, Health 💊, Salary 💼, Freelance 💻, and Other 📦.
* **Live Search**: Debounced search by description, category, or monetary amount.
* **Multi-filter & Sort**: Filter by type (Income/Expense), filter by category, and sort by newest, oldest, highest, or lowest amount.
* **Full CRUD**: Add, Edit (with prefilled modal), and Delete (with confirmation dialog).
* **CSV Export**: Export your complete transaction ledger directly to a `.csv` spreadsheet file with a single click.

### 📈 Zero-Dependency SVG Analytics
* **Monthly Income vs. Expense Bar Chart**:
  * Custom 6-month comparative dual-bar chart built with mathematical SVG coordinate projection.
  * Includes dotted grid lines, formatted currency labels, and hover tooltips.
* **Category Spending Donut & Progress Breakdown**:
  * Custom SVG Donut chart using calibrated `stroke-dasharray` and `stroke-dashoffset` circles.
  * Category distribution percentage bars sorted by highest spend.
* **Recent Spending Velocity Trend**:
  * Smooth SVG line & area chart displaying daily expense trajectory over the last 14 active days with gradient fills and data nodes.

### ⚙️ Preferences & Customization
* **Currency Selector**: Seamlessly switch between **₹ (INR)**, **$ (USD)**, **€ (EUR)**, and **£ (GBP)** across all cards, charts, and tables.
* **Theme Switcher**: Instant toggle between Dark Mode (deep sapphire/slate) and Clean Light Mode.
* **Personalized Greeting**: Dynamic time-based greeting ("Good morning / afternoon / evening") displaying your custom username.
* **Data Management**:
  * LocalStorage persistence: Survives browser reloads and tab closures.
  * Realistic sample data generator for immediate exploration.
  * Safe data wipe with confirmation dialog.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **HTML5** | Semantic structure, accessible modal dialogs, responsive tables |
| **CSS3** | Custom design system, CSS variables, glassmorphism, responsive grid, flexbox |
| **Vanilla JavaScript (ES6+)** | State management, dynamic financial calculations, DOM rendering, SVG generation |
| **LocalStorage API** | Browser-native offline data persistence |
| **Inline SVG** | Crisp vector icons and programmatic data visualizations |

> **Constraint Met**: 0 External Frameworks (No React/Vue/Tailwind/Bootstrap), 0 Chart Libraries (No Chart.js), 0 Icon CDNs, 0 Backend APIs.

---

## 📸 Screenshots

*(Add your high-resolution screenshots here for GitHub / LinkedIn showcase)*

| Desktop Dashboard (Dark Mode) | Analytics & Category Breakdown |
| :---: | :---: |
| `![Dashboard Screenshot](screenshots/dashboard-dark.png)` | `![Analytics Screenshot](screenshots/analytics.png)` |

| Mobile Responsive Cards | Transaction Modal & Search |
| :---: | :---: |
| `![Mobile View](screenshots/mobile-view.png)` | `![Transactions View](screenshots/transactions.png)` |

---

## 🏃 How to Run Locally

Because SmartSpend is built with zero build steps or bundlers, running it is instantaneous:

1. **Clone or Download the Repository**:
   ```bash
   git clone https://github.com/your-username/smartspend.git
   cd smartspend
   ```

2. **Open directly in any modern browser**:
   * Simply double-click `index.html`, OR
   * Use VS Code extension **Live Server**, OR
   * Run with Python:
     ```bash
     python -m http.server 3000
     ```
   * Open `http://localhost:3000` in your browser.

---

## 💾 Data Storage Explanation

All financial data and preferences are saved locally on the client machine via the HTML5 **Web Storage API (`localStorage`)**:

* `smartspend_transactions`: JSON array of transaction objects containing `id`, `type`, `amount`, `description`, `category`, and `date`.
* `smartspend_settings`: User configuration holding `currency`, `monthlyLimit`, `username`, `theme`, and `initialized` flag.
* `smartspend_theme`: Active color theme mode (`dark` or `light`).

Your data remains 100% private, stays on your device, and is never transmitted to any external server.

---

## 🧠 What I Learned on Day 2

1. **Building Custom Charts from Scratch with Pure SVG**:
   * Calculating dynamic viewbox coordinates, SVG `<rect>`, `<path>`, and arc dashes without third-party chart libraries.
   * Ensuring responsive SVG scaling using `viewBox` and `preserveAspectRatio`.
2. **Robust Financial Calculations**:
   * Handling month-over-month percentage changes safely, including zero division edges and negative delta representations.
   * Calculating savings rates and real-time budget threshold warnings.
3. **Responsive Table vs. Card Architecture**:
   * Designing responsive tables on wide screens that gracefully transform into touch-friendly cards on mobile devices.
4. **Clean Component-like Separation in Vanilla JS**:
   * Structuring modular functions (`initApp`, `renderDashboard`, `filterTransactions`, `saveSettings`, etc.) to maintain a readable, scalable codebase.

---

## 🔮 Future Improvements

- [ ] Recurring transaction scheduler (e.g., auto-log monthly rent / subscriptions).
- [ ] Multi-month date range picker filter for deep-dive audits.
- [ ] Export transactions as PDF receipt report.
- [ ] Multiple wallet/account support (Cash, Bank Account, Credit Card).

---

## 👨‍💻 Author

Built with pride by a developer committed to continuous improvement.  
**Day 2/365 — Building in Public.**
