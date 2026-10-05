/**
 * ============================================================================
 * SMARTSPEND — SMART EXPENSE TRACKER
 * Day 2 of 365 Days Coding Challenge
 * Vanilla JavaScript (ES6+) — Clean Architecture & Modular Structure
 * ============================================================================
 */

// Application State
const state = {
  transactions: [],
  filteredTransactions: [],
  settings: {
    currency: '₹',
    monthlyLimit: 20000,
    username: 'Developer',
    theme: 'dark',
    initialized: false
  },
  activeTab: 'dashboard',
  editingTxId: null,
  pendingDeleteId: null
};

// Storage Keys
const STORAGE_KEYS = {
  TRANSACTIONS: 'smartspend_transactions',
  SETTINGS: 'smartspend_settings',
  THEME: 'smartspend_theme'
};

// Category Icons & Color Mapping
const CATEGORY_META = {
  Food: { icon: '🍔', color: '#f59e0b' },
  Travel: { icon: '🚗', color: '#0ea5e9' },
  Education: { icon: '📚', color: '#8b5cf6' },
  Shopping: { icon: '🛍️', color: '#ec4899' },
  Bills: { icon: '💡', color: '#eab308' },
  Entertainment: { icon: '🎬', color: '#a855f7' },
  Health: { icon: '💊', color: '#14b8a6' },
  Salary: { icon: '💼', color: '#10b981' },
  Freelance: { icon: '💻', color: '#06b6d4' },
  Other: { icon: '📦', color: '#64748b' }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initializes the entire application
 */
function initApp() {
  loadSettings();
  loadTransactions();
  setupEventListeners();
  updateGreeting();
  updateTopbarDate();

  // Render initial tab
  switchTab(state.activeTab);
  updateDashboardLimitWidget();
}

/**
 * Loads user settings and theme from localStorage
 */
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
    }

    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || state.settings.theme || 'dark';
    setTheme(savedTheme);

    // Sync settings UI inputs
    const currencySelect = document.getElementById('setting-currency');
    const limitInput = document.getElementById('setting-limit');
    const usernameInput = document.getElementById('setting-username');
    const limitCurrencySymbol = document.getElementById('limit-currency-symbol');
    const modalCurrencySymbol = document.getElementById('modal-currency-symbol');

    if (currencySelect) currencySelect.value = state.settings.currency;
    if (limitInput) limitInput.value = state.settings.monthlyLimit;
    if (usernameInput) usernameInput.value = state.settings.username;
    if (limitCurrencySymbol) limitCurrencySymbol.textContent = state.settings.currency;
    if (modalCurrencySymbol) modalCurrencySymbol.textContent = state.settings.currency;

    updateProfileDisplay();
  } catch (error) {
    console.error('Failed to load settings from storage:', error);
  }
}

/**
 * Saves current settings to localStorage
 */
function saveSettings() {
  try {
    const currencySelect = document.getElementById('setting-currency');
    const limitInput = document.getElementById('setting-limit');
    const usernameInput = document.getElementById('setting-username');

    if (currencySelect) state.settings.currency = currencySelect.value;
    if (limitInput && limitInput.value > 0) state.settings.monthlyLimit = parseFloat(limitInput.value);
    if (usernameInput && usernameInput.value.trim()) state.settings.username = usernameInput.value.trim();

    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    
    // Update symbols in form prefixes
    document.getElementById('limit-currency-symbol').textContent = state.settings.currency;
    document.getElementById('modal-currency-symbol').textContent = state.settings.currency;

    updateProfileDisplay();
    updateGreeting();
    renderDashboard();
    renderTransactions();
    renderAnalytics();

    showToast('Preferences updated successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showToast('Failed to save settings.', 'error');
  }
}

/**
 * Sets dark or light theme
 */
function setTheme(theme) {
  state.settings.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEYS.THEME, theme);

  // Update settings page theme buttons
  const darkBtn = document.getElementById('theme-btn-dark');
  const lightBtn = document.getElementById('theme-btn-light');
  if (darkBtn && lightBtn) {
    if (theme === 'dark') {
      darkBtn.classList.add('active');
      lightBtn.classList.remove('active');
    } else {
      lightBtn.classList.add('active');
      darkBtn.classList.remove('active');
    }
  }
}

/**
 * Loads transactions from localStorage or creates realistic samples on first launch
 */
function loadTransactions() {
  try {
    const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const hasInitialized = state.settings.initialized;

    if (savedTx) {
      state.transactions = JSON.parse(savedTx);
    } else if (!hasInitialized) {
      // First launch only: populate realistic sample data
      populateSampleData();
      state.settings.initialized = true;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(state.settings));
    } else {
      state.transactions = [];
    }

    state.filteredTransactions = [...state.transactions];
    updateTransactionCounter();
  } catch (error) {
    console.error('Failed to load transactions:', error);
    state.transactions = [];
    state.filteredTransactions = [];
  }
}

/**
 * Saves transactions to localStorage
 */
function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
    updateTransactionCounter();
  } catch (error) {
    console.error('Failed to save transactions to localStorage:', error);
    showToast('Error saving data to local storage.', 'error');
  }
}

/**
 * Populates realistic sample data spanning current month and previous month
 */
function populateSampleData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Format dates relative to current and previous months
  const formatSampleDate = (year, month, day) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  state.transactions = [
    // Current month transactions
    {
      id: generateId(),
      type: 'income',
      amount: 25000,
      description: 'Monthly Salary',
      category: 'Salary',
      date: formatSampleDate(currentYear, currentMonth, 1)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 250,
      description: 'Lunch with colleagues',
      category: 'Food',
      date: formatSampleDate(currentYear, currentMonth, 3)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 800,
      description: 'Monthly Bus Pass',
      category: 'Travel',
      date: formatSampleDate(currentYear, currentMonth, 4)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 999,
      description: 'Online Coding Course',
      category: 'Education',
      date: formatSampleDate(currentYear, currentMonth, 5)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 1500,
      description: 'Weekend Shopping',
      category: 'Shopping',
      date: formatSampleDate(currentYear, currentMonth, 6)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 1200,
      description: 'Electricity & Wifi Bill',
      category: 'Bills',
      date: formatSampleDate(currentYear, currentMonth, 7)
    },
    {
      id: generateId(),
      type: 'income',
      amount: 8500,
      description: 'Freelance UI Design',
      category: 'Freelance',
      date: formatSampleDate(currentYear, currentMonth, 8)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 450,
      description: 'Movie Night & Popcorn',
      category: 'Entertainment',
      date: formatSampleDate(currentYear, currentMonth, 10)
    },

    // Previous month transactions (for meaningful month-over-month comparisons & charts)
    {
      id: generateId(),
      type: 'income',
      amount: 24000,
      description: 'Previous Month Salary',
      category: 'Salary',
      date: formatSampleDate(currentYear, currentMonth - 1, 1)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 3200,
      description: 'Groceries & Mart',
      category: 'Food',
      date: formatSampleDate(currentYear, currentMonth - 1, 5)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 1800,
      description: 'Fuel & Commute',
      category: 'Travel',
      date: formatSampleDate(currentYear, currentMonth - 1, 12)
    },
    {
      id: generateId(),
      type: 'expense',
      amount: 2400,
      description: 'Gadget Accessories',
      category: 'Shopping',
      date: formatSampleDate(currentYear, currentMonth - 1, 18)
    }
  ];

  saveTransactions();
}

// ============================================================================
// CALCULATIONS & FINANCIAL LOGIC
// ============================================================================

/**
 * Calculates total net balance
 */
function calculateBalance(transactions = state.transactions) {
  const income = calculateIncome(transactions);
  const expenses = calculateExpenses(transactions);
  return income - expenses;
}

/**
 * Calculates total income
 */
function calculateIncome(transactions = state.transactions) {
  return transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
}

/**
 * Calculates total expenses
 */
function calculateExpenses(transactions = state.transactions) {
  return transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
}

/**
 * Calculates savings rate percentage
 */
function calculateSavingsRate(income, expenses) {
  if (!income || income <= 0) return 0;
  const net = income - expenses;
  if (net <= 0) return 0;
  return Math.min(100, Math.round((net / income) * 100));
}

/**
 * Gets transactions for a specific month and year
 */
function getTransactionsForMonth(year, month) {
  return state.transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getFullYear() === year && txDate.getMonth() === month;
  });
}

/**
 * Formats monetary amounts with currency symbol and localization
 */
function formatCurrency(amount) {
  const currency = state.settings.currency || '₹';
  const num = Math.abs(Number(amount) || 0);
  
  // Format with commas
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return amount < 0 ? `-${currency}${formatted}` : `${currency}${formatted}`;
}

// ============================================================================
// DASHBOARD VIEW RENDERING
// ============================================================================

/**
 * Renders the primary dashboard view
 */
function renderDashboard() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Current month transactions
  const currentMonthTxs = getTransactionsForMonth(currentYear, currentMonth);
  // Previous month transactions
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevMonthTxs = getTransactionsForMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

  // 1. Overall Balance
  const totalBalance = calculateBalance(state.transactions);
  const statBalanceEl = document.getElementById('stat-balance');
  if (statBalanceEl) statBalanceEl.textContent = formatCurrency(totalBalance);

  // 2. Total Income (Current Month)
  const currentIncome = calculateIncome(currentMonthTxs);
  const prevIncome = calculateIncome(prevMonthTxs);
  const statIncomeEl = document.getElementById('stat-income');
  if (statIncomeEl) statIncomeEl.textContent = formatCurrency(currentIncome);

  const incomeTrendEl = document.getElementById('stat-income-trend');
  if (incomeTrendEl) {
    if (prevIncome > 0) {
      const incDiff = Math.round(((currentIncome - prevIncome) / prevIncome) * 100);
      const sign = incDiff >= 0 ? '+' : '';
      incomeTrendEl.className = incDiff >= 0 ? 'stat-trend trend-positive' : 'stat-trend trend-negative';
      incomeTrendEl.innerHTML = `<span>${sign}${incDiff}% vs last mo</span>`;
    } else {
      incomeTrendEl.className = 'stat-trend trend-neutral';
      incomeTrendEl.innerHTML = `<span>Active</span>`;
    }
  }

  // 3. Total Expenses (Current Month)
  const currentExpenses = calculateExpenses(currentMonthTxs);
  const prevExpenses = calculateExpenses(prevMonthTxs);
  const statExpensesEl = document.getElementById('stat-expenses');
  if (statExpensesEl) statExpensesEl.textContent = formatCurrency(currentExpenses);

  const expensesTrendEl = document.getElementById('stat-expenses-trend');
  if (expensesTrendEl) {
    if (prevExpenses > 0) {
      const expDiff = Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100);
      const sign = expDiff >= 0 ? '+' : '';
      // For expense, higher is usually negative trend
      expensesTrendEl.className = expDiff <= 0 ? 'stat-trend trend-positive' : 'stat-trend trend-negative';
      expensesTrendEl.innerHTML = `<span>${sign}${expDiff}% vs last mo</span>`;
    } else {
      expensesTrendEl.className = 'stat-trend trend-neutral';
      expensesTrendEl.innerHTML = `<span>Active</span>`;
    }
  }

  // 4. Savings Rate
  const currentSavingsRate = calculateSavingsRate(currentIncome, currentExpenses);
  const statSavingsRateEl = document.getElementById('stat-savings-rate');
  if (statSavingsRateEl) statSavingsRateEl.textContent = `${currentSavingsRate}%`;

  const statSavingsStatusEl = document.getElementById('stat-savings-status');
  if (statSavingsStatusEl) {
    if (currentSavingsRate >= 20) {
      statSavingsStatusEl.className = 'stat-trend trend-positive';
      statSavingsStatusEl.textContent = 'Healthy (20%+)';
    } else if (currentSavingsRate > 0) {
      statSavingsStatusEl.className = 'stat-trend trend-neutral';
      statSavingsStatusEl.textContent = 'Moderate';
    } else {
      statSavingsStatusEl.className = 'stat-trend trend-negative';
      statSavingsStatusEl.textContent = 'Deficit';
    }
  }

  // 5. Update Monthly Spending Limit Widget
  updateDashboardLimitWidget(currentExpenses);

  // 6. Render Recent Transactions List (top 5)
  renderRecentTransactionsList();

  // 7. Render Monthly Overview Comparison Card
  renderMonthlyOverviewCard(currentIncome, currentExpenses, prevIncome, prevExpenses);
}

/**
 * Updates the Monthly Budget limit bar and triggers threshold warnings
 */
function updateDashboardLimitWidget(currentExpenses = null) {
  if (currentExpenses === null) {
    const now = new Date();
    const currentMonthTxs = getTransactionsForMonth(now.getFullYear(), now.getMonth());
    currentExpenses = calculateExpenses(currentMonthTxs);
  }

  const limit = state.settings.monthlyLimit || 20000;
  const spentPct = limit > 0 ? (currentExpenses / limit) * 100 : 0;
  const clampedPct = Math.min(100, Math.round(spentPct));

  // Main dashboard card
  const spentValEl = document.getElementById('dashboard-spent-val');
  const limitValEl = document.getElementById('dashboard-limit-val');
  const barEl = document.getElementById('dashboard-budget-bar');
  const pctEl = document.getElementById('dashboard-budget-pct');
  const leftEl = document.getElementById('dashboard-budget-left');
  const alertBox = document.getElementById('budget-alert-box');
  const alertMsg = document.getElementById('budget-alert-msg');

  if (spentValEl) spentValEl.textContent = formatCurrency(currentExpenses);
  if (limitValEl) limitValEl.textContent = `/ ${formatCurrency(limit)}`;
  if (barEl) barEl.style.width = `${clampedPct}%`;
  if (pctEl) pctEl.textContent = `${spentPct.toFixed(1)}% used`;

  const remaining = limit - currentExpenses;
  if (leftEl) {
    if (remaining >= 0) {
      leftEl.textContent = `${formatCurrency(remaining)} remaining`;
      leftEl.className = 'progress-remaining text-muted';
    } else {
      leftEl.textContent = `${formatCurrency(Math.abs(remaining))} over limit!`;
      leftEl.className = 'progress-remaining text-danger';
    }
  }

  // Progress Bar styling & Alert box logic
  if (barEl && alertBox && alertMsg) {
    barEl.classList.remove('warning-fill', 'danger-fill');
    alertBox.classList.remove('alert-warning', 'alert-danger');

    if (spentPct >= 100) {
      barEl.classList.add('danger-fill');
      alertBox.classList.remove('hidden');
      alertBox.classList.add('alert-danger');
      alertMsg.textContent = 'Monthly spending limit exceeded!';
    } else if (spentPct >= 80) {
      barEl.classList.add('warning-fill');
      alertBox.classList.remove('hidden');
      alertBox.classList.add('alert-warning');
      alertMsg.textContent = "You're approaching your monthly spending limit.";
    } else {
      alertBox.classList.add('hidden');
    }
  }

  // Sidebar mini progress bar sync
  const sideBar = document.getElementById('sidebar-limit-bar');
  const sideSpent = document.getElementById('sidebar-spent');
  const sideLimit = document.getElementById('sidebar-limit');
  const sidePct = document.getElementById('sidebar-limit-percent');

  if (sideBar) sideBar.style.width = `${clampedPct}%`;
  if (sideSpent) sideSpent.textContent = formatCurrency(currentExpenses);
  if (sideLimit) sideLimit.textContent = `/ ${formatCurrency(limit)}`;
  if (sidePct) sidePct.textContent = `${Math.round(spentPct)}%`;
}

/**
 * Renders recent transactions preview list on dashboard
 */
function renderRecentTransactionsList() {
  const container = document.getElementById('dashboard-recent-list');
  if (!container) return;

  const sorted = [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2rem 1rem;">
        <p class="text-muted">No transactions recorded yet.</p>
        <button class="btn btn-primary mt-2" onclick="openAddModal()">Add Your First Transaction</button>
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(tx => {
    const meta = CATEGORY_META[tx.category] || CATEGORY_META.Other;
    const isIncome = tx.type === 'income';
    const amountSign = isIncome ? '+' : '-';
    const amountClass = isIncome ? 'text-success' : 'text-danger';

    return `
      <div class="tx-item-row" data-id="${tx.id}">
        <div class="tx-item-left">
          <div class="tx-cat-icon" title="${escapeHtml(tx.category)}">${meta.icon}</div>
          <div class="tx-item-meta">
            <span class="tx-desc">${escapeHtml(tx.description)}</span>
            <div class="tx-sub-info">
              <span>${escapeHtml(tx.category)}</span>
              <span>•</span>
              <span>${formatDate(tx.date)}</span>
            </div>
          </div>
        </div>
        <div class="tx-amount ${amountClass}">
          ${amountSign}${formatCurrency(tx.amount)}
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renders Current Month vs Previous Month comparison box
 */
function renderMonthlyOverviewCard(currentIncome, currentExpenses, prevIncome, prevExpenses) {
  const currentNet = currentIncome - currentExpenses;
  const prevNet = prevIncome - prevExpenses;
  const currentRate = calculateSavingsRate(currentIncome, currentExpenses);
  const prevRate = calculateSavingsRate(prevIncome, prevExpenses);

  // Helper for percentage delta
  const getDeltaBadge = (curr, prev) => {
    if (!prev || prev === 0) return '+0%';
    const diff = Math.round(((curr - prev) / Math.abs(prev)) * 100);
    return diff >= 0 ? `+${diff}%` : `${diff}%`;
  };

  // Income
  const curIncEl = document.getElementById('comp-current-income');
  const prevIncEl = document.getElementById('comp-prev-income');
  const incDeltaEl = document.getElementById('comp-income-delta');
  if (curIncEl) curIncEl.textContent = formatCurrency(currentIncome);
  if (prevIncEl) prevIncEl.textContent = `Prev: ${formatCurrency(prevIncome)}`;
  if (incDeltaEl) incDeltaEl.textContent = getDeltaBadge(currentIncome, prevIncome);

  // Expenses
  const curExpEl = document.getElementById('comp-current-expense');
  const prevExpEl = document.getElementById('comp-prev-expense');
  const expDeltaEl = document.getElementById('comp-expense-delta');
  if (curExpEl) curExpEl.textContent = formatCurrency(currentExpenses);
  if (prevExpEl) prevExpEl.textContent = `Prev: ${formatCurrency(prevExpenses)}`;
  if (expDeltaEl) expDeltaEl.textContent = getDeltaBadge(currentExpenses, prevExpenses);

  // Net Savings
  const curNetEl = document.getElementById('comp-current-net');
  const prevNetEl = document.getElementById('comp-prev-net');
  const netDeltaEl = document.getElementById('comp-savings-delta');
  if (curNetEl) {
    curNetEl.textContent = formatCurrency(currentNet);
    curNetEl.className = currentNet >= 0 ? 'comp-value text-accent' : 'comp-value text-danger';
  }
  if (prevNetEl) prevNetEl.textContent = `Prev: ${formatCurrency(prevNet)}`;
  if (netDeltaEl) netDeltaEl.textContent = getDeltaBadge(currentNet, prevNet);

  // Rate
  const curRateEl = document.getElementById('comp-current-rate');
  const prevRateEl = document.getElementById('comp-prev-rate');
  const rateDeltaEl = document.getElementById('comp-rate-delta');
  if (curRateEl) curRateEl.textContent = `${currentRate}%`;
  if (prevRateEl) prevRateEl.textContent = `Prev: ${prevRate}%`;
  if (rateDeltaEl) {
    const rateDiff = currentRate - prevRate;
    rateDeltaEl.textContent = rateDiff >= 0 ? `+${rateDiff}%` : `${rateDiff}%`;
  }

  // Visual Bars
  const barCur = document.getElementById('comp-bar-current');
  const barCurPct = document.getElementById('comp-bar-current-pct');
  const barPrev = document.getElementById('comp-bar-prev');
  const barPrevPct = document.getElementById('comp-bar-prev-pct');

  if (barCur && barCurPct) {
    barCur.style.width = `${Math.min(100, Math.max(0, currentRate))}%`;
    barCurPct.textContent = `${currentRate}%`;
  }
  if (barPrev && barPrevPct) {
    barPrev.style.width = `${Math.min(100, Math.max(0, prevRate))}%`;
    barPrevPct.textContent = `${prevRate}%`;
  }
}

// ============================================================================
// TRANSACTIONS VIEW & CRUD
// ============================================================================

/**
 * Filters and sorts transactions based on UI controls
 */
function filterTransactions() {
  const searchInput = document.getElementById('tx-search-input');
  const filterType = document.getElementById('filter-type');
  const filterCat = document.getElementById('filter-category');
  const filterSort = document.getElementById('filter-sort');

  const searchTerm = (searchInput ? searchInput.value : '').trim().toLowerCase();
  const selectedType = filterType ? filterType.value : 'all';
  const selectedCat = filterCat ? filterCat.value : 'all';
  const selectedSort = filterSort ? filterSort.value : 'date-desc';

  // Toggle clear search button
  const clearSearchBtn = document.getElementById('btn-clear-search');
  if (clearSearchBtn) {
    if (searchTerm) clearSearchBtn.classList.remove('hidden');
    else clearSearchBtn.classList.add('hidden');
  }

  let list = [...state.transactions];

  // 1. Search filter
  if (searchTerm) {
    list = list.filter(tx => {
      const descMatch = (tx.description || '').toLowerCase().includes(searchTerm);
      const catMatch = (tx.category || '').toLowerCase().includes(searchTerm);
      const amountMatch = (tx.amount || '').toString().includes(searchTerm);
      return descMatch || catMatch || amountMatch;
    });
  }

  // 2. Type filter
  if (selectedType !== 'all') {
    list = list.filter(tx => tx.type === selectedType);
  }

  // 3. Category filter
  if (selectedCat !== 'all') {
    list = list.filter(tx => tx.category === selectedCat);
  }

  // 4. Sorting
  list.sort((a, b) => {
    if (selectedSort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (selectedSort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (selectedSort === 'amount-desc') return Number(b.amount) - Number(a.amount);
    if (selectedSort === 'amount-asc') return Number(a.amount) - Number(b.amount);
    return 0;
  });

  state.filteredTransactions = list;
  renderTransactions();
}

/**
 * Renders the transactions table and responsive cards
 */
function renderTransactions() {
  const tbody = document.getElementById('transactions-tbody');
  const mobileContainer = document.getElementById('transactions-mobile-cards');
  const emptyState = document.getElementById('tx-empty-state');
  const table = document.getElementById('transactions-table');
  const showingCount = document.getElementById('tx-showing-count');
  const footerIncome = document.getElementById('tx-footer-income');
  const footerExpense = document.getElementById('tx-footer-expense');

  const list = state.filteredTransactions;

  // Update counts & footer sums
  if (showingCount) {
    showingCount.textContent = `Showing ${list.length} transaction${list.length === 1 ? '' : 's'}`;
  }

  const totalInc = calculateIncome(list);
  const totalExp = calculateExpenses(list);
  if (footerIncome) footerIncome.textContent = formatCurrency(totalInc);
  if (footerExpense) footerExpense.textContent = formatCurrency(totalExp);

  if (list.length === 0) {
    if (tbody) tbody.innerHTML = '';
    if (mobileContainer) mobileContainer.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (table) table.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (table) table.classList.remove('hidden');

  // Render Table (Desktop & Tablet)
  if (tbody) {
    tbody.innerHTML = list.map(tx => {
      const meta = CATEGORY_META[tx.category] || CATEGORY_META.Other;
      const isIncome = tx.type === 'income';
      const badgeClass = isIncome ? 'badge-income' : 'badge-expense';
      const amountSign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'text-success' : 'text-danger';

      return `
        <tr data-id="${tx.id}">
          <td>
            <div class="tx-table-cell-cat">
              <span class="tx-cat-icon">${meta.icon}</span>
              <span class="table-cat-badge">${escapeHtml(tx.category)}</span>
            </div>
          </td>
          <td>
            <strong class="tx-desc">${escapeHtml(tx.description)}</strong>
          </td>
          <td>
            <span class="text-muted">${formatDate(tx.date)}</span>
          </td>
          <td>
            <span class="badge ${badgeClass}">${tx.type.toUpperCase()}</span>
          </td>
          <td class="text-right">
            <span class="tx-amount ${amountClass}">${amountSign}${formatCurrency(tx.amount)}</span>
          </td>
          <td class="text-center">
            <div class="table-action-btns">
              <button class="action-btn-sm btn-edit" title="Edit transaction" onclick="openEditModal('${tx.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn-sm btn-del" title="Delete transaction" onclick="requestDeleteTx('${tx.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Mobile Cards (Mobile viewport)
  if (mobileContainer) {
    mobileContainer.innerHTML = list.map(tx => {
      const meta = CATEGORY_META[tx.category] || CATEGORY_META.Other;
      const isIncome = tx.type === 'income';
      const amountSign = isIncome ? '+' : '-';
      const amountClass = isIncome ? 'text-success' : 'text-danger';
      const badgeClass = isIncome ? 'badge-income' : 'badge-expense';

      return `
        <div class="mobile-tx-card" data-id="${tx.id}">
          <div class="mobile-tx-top">
            <div class="tx-item-left">
              <span class="tx-cat-icon">${meta.icon}</span>
              <div class="tx-item-meta">
                <span class="tx-desc">${escapeHtml(tx.description)}</span>
                <span class="tx-sub-info">${escapeHtml(tx.category)} • ${formatDate(tx.date)}</span>
              </div>
            </div>
            <div class="tx-amount ${amountClass}">
              ${amountSign}${formatCurrency(tx.amount)}
            </div>
          </div>
          <div class="mobile-tx-bottom">
            <span class="badge ${badgeClass}">${tx.type.toUpperCase()}</span>
            <div class="table-action-btns">
              <button class="action-btn-sm btn-edit" onclick="openEditModal('${tx.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="action-btn-sm btn-del" onclick="requestDeleteTx('${tx.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * Handles adding a new transaction or updating an existing one
 */
function handleTransactionFormSubmit(e) {
  e.preventDefault();

  const form = document.getElementById('tx-form');
  const typeActiveBtn = document.querySelector('.segmented-btn.active');
  const type = typeActiveBtn ? typeActiveBtn.dataset.type : 'expense';
  const amountInput = document.getElementById('tx-amount');
  const descInput = document.getElementById('tx-description');
  const catInput = document.getElementById('tx-category');
  const dateInput = document.getElementById('tx-date');

  let isValid = true;

  // Validation
  const amountVal = parseFloat(amountInput.value);
  if (!amountVal || amountVal <= 0 || isNaN(amountVal)) {
    showInputError('tx-amount', 'error-tx-amount', true);
    isValid = false;
  } else {
    showInputError('tx-amount', 'error-tx-amount', false);
  }

  const descVal = descInput.value.trim();
  if (!descVal) {
    showInputError('tx-description', 'error-tx-desc', true);
    isValid = false;
  } else {
    showInputError('tx-description', 'error-tx-desc', false);
  }

  const catVal = catInput.value;
  if (!catVal) {
    showInputError('tx-category', 'error-tx-cat', true);
    isValid = false;
  } else {
    showInputError('tx-category', 'error-tx-cat', false);
  }

  const dateVal = dateInput.value;
  if (!dateVal) {
    showInputError('tx-date', 'error-tx-date', true);
    isValid = false;
  } else {
    showInputError('tx-date', 'error-tx-date', false);
  }

  if (!isValid) return;

  if (state.editingTxId) {
    // Edit existing transaction
    editTransaction(state.editingTxId, {
      type,
      amount: amountVal,
      description: descVal,
      category: catVal,
      date: dateVal
    });
  } else {
    // Add new transaction
    addTransaction({
      id: generateId(),
      type,
      amount: amountVal,
      description: descVal,
      category: catVal,
      date: dateVal
    });
  }

  closeModal('tx-modal');
}

/**
 * Adds a new transaction object
 */
function addTransaction(tx) {
  state.transactions.unshift(tx);
  saveTransactions();
  filterTransactions();
  renderDashboard();
  renderAnalytics();

  const label = tx.type === 'income' ? 'Income' : 'Expense';
  showToast(`${label} added successfully.`, 'success');
}

/**
 * Edits an existing transaction
 */
function editTransaction(id, updatedFields) {
  const index = state.transactions.findIndex(t => t.id === id);
  if (index === -1) return;

  state.transactions[index] = { ...state.transactions[index], ...updatedFields };
  saveTransactions();
  filterTransactions();
  renderDashboard();
  renderAnalytics();

  showToast('Transaction updated successfully.', 'success');
}

/**
 * Initiates confirmation modal to delete a transaction
 */
function requestDeleteTx(id) {
  state.pendingDeleteId = id;
  const modal = document.getElementById('confirm-modal');
  const title = document.getElementById('confirm-modal-title');
  const msg = document.getElementById('confirm-modal-msg');
  const actionBtn = document.getElementById('confirm-action-btn');

  if (title) title.textContent = 'Delete Transaction?';
  if (msg) msg.textContent = 'Are you sure you want to delete this transaction? This action cannot be reversed.';
  if (actionBtn) {
    actionBtn.textContent = 'Delete';
    actionBtn.onclick = confirmDeleteTx;
  }

  openModal('confirm-modal');
}

/**
 * Confirms and executes transaction deletion
 */
function confirmDeleteTx() {
  if (!state.pendingDeleteId) return;

  deleteTransaction(state.pendingDeleteId);
  state.pendingDeleteId = null;
  closeModal('confirm-modal');
}

/**
 * Deletes a transaction by ID
 */
function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  saveTransactions();
  filterTransactions();
  renderDashboard();
  renderAnalytics();

  showToast('Transaction removed.', 'info');
}

/**
 * Helper to display input validation error
 */
function showInputError(inputId, errorId, show) {
  const input = document.getElementById(inputId);
  const errorEl = document.getElementById(errorId);
  if (input) {
    if (show) input.classList.add('error');
    else input.classList.remove('error');
  }
  if (errorEl) {
    if (show) errorEl.classList.add('visible');
    else errorEl.classList.remove('visible');
  }
}

// ============================================================================
// ANALYTICS & PURE SVG CHARTS
// ============================================================================

/**
 * Master analytics render method
 */
function renderAnalytics() {
  updateCharts();
}

/**
 * Updates all SVG charts dynamically
 */
function updateCharts() {
  renderIncomeVsExpenseBarChart();
  renderCategorySpendingDonutChart();
  renderRecentSpendingTrendChart();
}

/**
 * 1. Pure SVG Monthly Income vs Expense Dual Bar Chart (Last 6 Months)
 */
function renderIncomeVsExpenseBarChart() {
  const container = document.getElementById('bar-chart-wrapper');
  if (!container) return;

  // Build the last 6 months bucket
  const now = new Date();
  const monthsData = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthName = d.toLocaleString('default', { month: 'short' });
    const txs = getTransactionsForMonth(y, m);
    const income = calculateIncome(txs);
    const expenses = calculateExpenses(txs);

    monthsData.push({
      label: `${monthName} '${String(y).slice(2)}`,
      income,
      expenses
    });
  }

  const maxVal = Math.max(
    ...monthsData.map(d => Math.max(d.income, d.expenses)),
    1000 // minimum ceiling
  );

  const width = 800;
  const height = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const barGroupWidth = chartW / monthsData.length;
  const singleBarWidth = Math.min(24, (barGroupWidth - 20) / 2);

  // Grid lines
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];
  let gridSvg = '';
  gridTicks.forEach(tick => {
    const yPos = padding.top + chartH - (tick * chartH);
    const tickVal = Math.round(tick * maxVal);
    gridSvg += `
      <line x1="${padding.left}" y1="${yPos}" x2="${width - padding.right}" y2="${yPos}" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="3,3" />
      <text x="${padding.left - 10}" y="${yPos + 4}" fill="currentColor" opacity="0.5" font-size="11" text-anchor="end" font-family="JetBrains Mono">${formatCurrency(tickVal)}</text>
    `;
  });

  // Bars
  let barsSvg = '';
  monthsData.forEach((d, i) => {
    const groupX = padding.left + (i * barGroupWidth) + (barGroupWidth / 2);
    
    // Income Bar
    const incHeight = (d.income / maxVal) * chartH;
    const incY = padding.top + chartH - incHeight;
    const incX = groupX - singleBarWidth - 2;

    // Expense Bar
    const expHeight = (d.expenses / maxVal) * chartH;
    const expY = padding.top + chartH - expHeight;
    const expX = groupX + 2;

    barsSvg += `
      <g class="bar-group-interactive">
        <!-- Income Bar -->
        <rect x="${incX}" y="${incY}" width="${singleBarWidth}" height="${incHeight}" rx="4" fill="#10b981">
          <title>Income: ${formatCurrency(d.income)}</title>
        </rect>
        <!-- Expense Bar -->
        <rect x="${expX}" y="${expY}" width="${singleBarWidth}" height="${expHeight}" rx="4" fill="#f43f5e">
          <title>Expense: ${formatCurrency(d.expenses)}</title>
        </rect>
        <!-- X Axis Label -->
        <text x="${groupX}" y="${height - 12}" fill="currentColor" opacity="0.75" font-size="12" font-weight="600" text-anchor="middle">${d.label}</text>
      </g>
    `;
  });

  container.innerHTML = `
    <svg class="bar-chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      ${gridSvg}
      ${barsSvg}
    </svg>
  `;
}

/**
 * 2. Pure SVG Donut Chart + Category Breakdown Progress Bars
 */
function renderCategorySpendingDonutChart() {
  const donutContainer = document.getElementById('donut-chart-container');
  const barsContainer = document.getElementById('category-bars-container');
  const totalBadge = document.getElementById('category-total-badge');

  if (!donutContainer || !barsContainer) return;

  // Group all expense transactions by category
  const expenseTxs = state.transactions.filter(t => t.type === 'expense');
  const totalExpense = calculateExpenses(expenseTxs);

  if (totalBadge) totalBadge.textContent = `Total: ${formatCurrency(totalExpense)}`;

  if (totalExpense === 0) {
    donutContainer.innerHTML = `
      <div class="empty-donut-msg" style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        No expense data recorded yet.
      </div>
    `;
    barsContainer.innerHTML = `
      <div style="color: var(--text-faint); font-size: 0.85rem;">
        Add some expense transactions to view category distribution breakdown.
      </div>
    `;
    return;
  }

  // Aggregate by category
  const catSums = {};
  expenseTxs.forEach(t => {
    catSums[t.category] = (catSums[t.category] || 0) + Number(t.amount);
  });

  // Sort categories by highest spend
  const sortedCategories = Object.entries(catSums)
    .map(([category, amount]) => ({
      category,
      amount,
      pct: (amount / totalExpense) * 100,
      meta: CATEGORY_META[category] || CATEGORY_META.Other
    }))
    .sort((a, b) => b.amount - a.amount);

  // Build SVG Donut arcs
  const size = 220;
  const center = size / 2;
  const radius = 75;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  let circlesSvg = '';

  sortedCategories.forEach(item => {
    const strokeDash = (item.pct / 100) * circumference;
    const strokeOffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += item.pct;

    circlesSvg += `
      <circle
        cx="${center}" cy="${center}" r="${radius}"
        fill="transparent"
        stroke="${item.meta.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${strokeOffset}"
        transform="rotate(-90 ${center} ${center})"
        style="transition: stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease;"
      >
        <title>${item.category}: ${formatCurrency(item.amount)} (${item.pct.toFixed(1)}%)</title>
      </circle>
    `;
  });

  donutContainer.innerHTML = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <!-- Background base circle -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="currentColor" stroke-opacity="0.07" stroke-width="${strokeWidth}" />
      ${circlesSvg}
      <!-- Centered Summary text -->
      <text x="${center}" y="${center - 6}" font-size="11" font-weight="600" fill="currentColor" opacity="0.6" text-anchor="middle">EXPENSES</text>
      <text x="${center}" y="${center + 16}" font-size="15" font-weight="800" font-family="JetBrains Mono" fill="currentColor" text-anchor="middle">${formatCurrency(totalExpense)}</text>
    </svg>
  `;

  // Render Category percentage progress bars
  barsContainer.innerHTML = sortedCategories.map(item => {
    return `
      <div class="category-bar-row">
        <div class="cat-bar-header">
          <span class="cat-bar-name">
            <span>${item.meta.icon}</span>
            <span>${escapeHtml(item.category)}</span>
            <span class="text-muted" style="font-size: 0.75rem;">(${item.pct.toFixed(1)}%)</span>
          </span>
          <span class="cat-bar-amount">${formatCurrency(item.amount)}</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width: ${item.pct}%; background-color: ${item.meta.color};"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * 3. Pure SVG Recent Spending Trend Area Chart (Daily velocity)
 */
function renderRecentSpendingTrendChart() {
  const container = document.getElementById('trend-chart-wrapper');
  const avgBadge = document.getElementById('trend-daily-avg');
  if (!container) return;

  const daysToShow = 14;
  const now = new Date();
  const dailyData = [];

  for (let i = daysToShow - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

    const daysTxs = state.transactions.filter(t => t.date === dateStr && t.type === 'expense');
    const spent = calculateExpenses(daysTxs);

    dailyData.push({
      dateStr,
      label: dayLabel,
      amount: spent
    });
  }

  const totalRecent = dailyData.reduce((acc, curr) => acc + curr.amount, 0);
  const avgDaily = Math.round(totalRecent / daysToShow);

  if (avgBadge) {
    avgBadge.textContent = `Avg: ${formatCurrency(avgDaily)}/day`;
  }

  const maxVal = Math.max(...dailyData.map(d => d.amount), 500);

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Compute point coordinates
  const points = dailyData.map((d, index) => {
    const x = padding.left + (index / (dailyData.length - 1)) * chartW;
    const y = padding.top + chartH - (d.amount / maxVal) * chartH;
    return { x, y, ...d };
  });

  // Construct SVG path for area & stroke
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Dots
  let dotsSvg = '';
  points.forEach(p => {
    dotsSvg += `
      <circle cx="${p.x}" cy="${p.y}" r="${p.amount > 0 ? 4 : 2}" fill="#6366f1" stroke="#ffffff" stroke-width="2">
        <title>${p.label}: ${formatCurrency(p.amount)}</title>
      </circle>
    `;
  });

  // X labels (Show every 3rd day to avoid clutter)
  let xLabels = '';
  points.forEach((p, idx) => {
    if (idx % 3 === 0 || idx === points.length - 1) {
      xLabels += `
        <text x="${p.x}" y="${height - 10}" fill="currentColor" opacity="0.6" font-size="10" text-anchor="middle">${p.label}</text>
      `;
    }
  });

  container.innerHTML = `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <!-- Horizontal Guideline -->
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${width - padding.right}" y2="${padding.top + chartH}" stroke="currentColor" stroke-opacity="0.1" />
      <path d="${areaPath}" fill="url(#areaGradient)" />
      <path d="${linePath}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${dotsSvg}
      ${xLabels}
    </svg>
  `;
}

// ============================================================================
// MODAL CONTROLS & EVENT BINDINGS
// ============================================================================

/**
 * Opens a modal window with accessibility and focus
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Auto focus first input
  const firstInput = modal.querySelector('input:not([type="hidden"]), select, button');
  if (firstInput) setTimeout(() => firstInput.focus(), 50);
}

/**
 * Closes a modal window
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.remove('open');
  document.body.style.overflow = '';

  // Clear form if transaction modal
  if (modalId === 'tx-modal') {
    resetTxForm();
  }
}

/**
 * Opens Add Transaction Modal (cleared)
 */
function openAddModal(preselectedType = 'expense') {
  resetTxForm();
  state.editingTxId = null;

  const title = document.getElementById('modal-tx-title');
  const subtitle = document.getElementById('modal-tx-subtitle');
  const submitBtn = document.getElementById('modal-tx-submit');

  if (title) title.textContent = 'Add Transaction';
  if (subtitle) subtitle.textContent = 'Record your financial inflow or outflow';
  if (submitBtn) submitBtn.textContent = 'Add Transaction';

  setTypeSegment(preselectedType);

  // Set default date to today
  const dateInput = document.getElementById('tx-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  openModal('tx-modal');
}

/**
 * Opens Edit Transaction Modal with prefilled values
 */
function openEditModal(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (!tx) return;

  state.editingTxId = id;
  resetTxForm();

  const title = document.getElementById('modal-tx-title');
  const subtitle = document.getElementById('modal-tx-subtitle');
  const submitBtn = document.getElementById('modal-tx-submit');

  if (title) title.textContent = 'Edit Transaction';
  if (subtitle) subtitle.textContent = 'Modify your existing transaction record';
  if (submitBtn) submitBtn.textContent = 'Save Changes';

  setTypeSegment(tx.type);

  document.getElementById('tx-amount').value = tx.amount;
  document.getElementById('tx-description').value = tx.description;
  document.getElementById('tx-category').value = tx.category;
  document.getElementById('tx-date').value = tx.date;

  openModal('tx-modal');
}

/**
 * Toggles segmented type button (Income vs Expense)
 */
function setTypeSegment(type) {
  const btnExp = document.getElementById('btn-type-expense');
  const btnInc = document.getElementById('btn-type-income');
  const indicator = document.getElementById('modal-type-indicator');

  if (type === 'income') {
    btnInc.classList.add('active');
    btnExp.classList.remove('active');
    if (indicator) {
      indicator.style.backgroundColor = 'var(--success-bg)';
      indicator.style.color = 'var(--success)';
    }
  } else {
    btnExp.classList.add('active');
    btnInc.classList.remove('active');
    if (indicator) {
      indicator.style.backgroundColor = 'var(--danger-bg)';
      indicator.style.color = 'var(--danger)';
    }
  }
}

/**
 * Resets the transaction form and clear errors
 */
function resetTxForm() {
  const form = document.getElementById('tx-form');
  if (form) form.reset();

  ['tx-amount', 'tx-description', 'tx-category', 'tx-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });

  ['error-tx-amount', 'error-tx-desc', 'error-tx-cat', 'error-tx-date'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  });

  setTypeSegment('expense');
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

/**
 * Shows interactive toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: `
      <svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>`,
    error: `
      <svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </svg>`,
    info: `
      <svg class="toast-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>`
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Auto clean up after 4s
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 4000);
}

// ============================================================================
// NAVIGATION & UI HELPERS
// ============================================================================

/**
 * Switches the active tab pane
 */
function switchTab(tabId) {
  state.activeTab = tabId;

  // Sidebar buttons active state
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    if (btn.dataset.tab === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Mobile bottom buttons active state
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn').forEach(btn => {
    if (btn.dataset.tab === tabId) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Tab views
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === `view-${tabId}`) pane.classList.add('active');
    else pane.classList.remove('active');
  });

  // Update topbar title
  const topbarTitle = document.getElementById('topbar-page-title');
  if (topbarTitle) {
    topbarTitle.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
  }

  // Trigger relevant renders
  if (tabId === 'dashboard') renderDashboard();
  if (tabId === 'transactions') filterTransactions();
  if (tabId === 'analytics') renderAnalytics();

  // Close mobile sidebar if open
  closeMobileSidebar();
}

/**
 * Toggles mobile drawer sidebar
 */
function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('mobile-open');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('mobile-open');
}

/**
 * Updates dynamic greeting based on time of day
 */
function updateGreeting() {
  const heroGreeting = document.getElementById('hero-greeting-text');
  if (!heroGreeting) return;

  const hour = new Date().getHours();
  let timeOfDay = 'evening';

  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const user = state.settings.username || 'Developer';
  heroGreeting.textContent = `Good ${timeOfDay}, ${user} 👋`;
}

/**
 * Updates user profile badge on sidebar
 */
function updateProfileDisplay() {
  const user = state.settings.username || 'Developer';
  const nameEl = document.getElementById('sidebar-username');
  const avatarEl = document.getElementById('header-avatar');

  if (nameEl) nameEl.textContent = user;
  if (avatarEl) avatarEl.textContent = user.charAt(0).toUpperCase();
}

/**
 * Updates topbar formatted date
 */
function updateTopbarDate() {
  const dateEl = document.getElementById('topbar-date');
  if (!dateEl) return;

  const now = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

/**
 * Updates sidebar transactions count badge
 */
function updateTransactionCounter() {
  const counter = document.getElementById('nav-tx-count');
  if (counter) counter.textContent = state.transactions.length;
}

/**
 * Exports transactions to CSV file
 */
function exportTransactionsCSV() {
  if (state.transactions.length === 0) {
    showToast('No transactions to export.', 'info');
    return;
  }

  const headers = ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date'];
  const rows = state.transactions.map(t => [
    `"${t.id}"`,
    `"${t.type}"`,
    t.amount,
    `"${t.description.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    `"${t.date}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `smartspend_transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Transactions exported to CSV!', 'success');
}

/**
 * Clears all transaction data
 */
function requestClearAllData() {
  const modal = document.getElementById('confirm-modal');
  const title = document.getElementById('confirm-modal-title');
  const msg = document.getElementById('confirm-modal-msg');
  const actionBtn = document.getElementById('confirm-action-btn');

  if (title) title.textContent = 'Clear All Transactions?';
  if (msg) msg.textContent = 'Are you sure? This will permanently remove all transactions. This action cannot be undone.';
  if (actionBtn) {
    actionBtn.textContent = 'Clear All';
    actionBtn.onclick = () => {
      state.transactions = [];
      saveTransactions();
      filterTransactions();
      renderDashboard();
      renderAnalytics();
      closeModal('confirm-modal');
      showToast('All transaction records wiped.', 'info');
    };
  }

  openModal('confirm-modal');
}

/**
 * Restores realistic sample data on demand
 */
function restoreSampleData() {
  populateSampleData();
  filterTransactions();
  renderDashboard();
  renderAnalytics();
  showToast('Realistic sample data restored!', 'success');
}

// ============================================================================
// EVENT LISTENERS BINDING
// ============================================================================

function setupEventListeners() {
  // Navigation tabs (Sidebar)
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Navigation tabs (Mobile Bottom)
  document.querySelectorAll('.mobile-bottom-nav .mobile-nav-btn:not(.fab-trigger)').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mobile drawer sidebar toggle
  const mobileToggle = document.getElementById('mobile-sidebar-toggle');
  if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileSidebar);

  // Quick Add buttons
  const quickAdd = document.getElementById('btn-quick-add');
  if (quickAdd) quickAdd.addEventListener('click', () => openAddModal());

  const heroAddExp = document.getElementById('btn-hero-add-expense');
  if (heroAddExp) heroAddExp.addEventListener('click', () => openAddModal('expense'));

  const heroAddInc = document.getElementById('btn-hero-add-income');
  if (heroAddInc) heroAddInc.addEventListener('click', () => openAddModal('income'));

  const heroViewAnalytics = document.getElementById('btn-hero-view-analytics');
  if (heroViewAnalytics) heroViewAnalytics.addEventListener('click', () => switchTab('analytics'));

  const viewAllTx = document.getElementById('btn-view-all-tx');
  if (viewAllTx) viewAllTx.addEventListener('click', () => switchTab('transactions'));

  const emptyAddTx = document.getElementById('btn-empty-add-tx');
  if (emptyAddTx) emptyAddTx.addEventListener('click', () => openAddModal());

  const mobileFab = document.getElementById('mobile-fab-add');
  if (mobileFab) mobileFab.addEventListener('click', () => openAddModal());

  // Theme Toggles
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const newTheme = state.settings.theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    });
  }

  const themeBtnDark = document.getElementById('theme-btn-dark');
  const themeBtnLight = document.getElementById('theme-btn-light');
  if (themeBtnDark) themeBtnDark.addEventListener('click', () => setTheme('dark'));
  if (themeBtnLight) themeBtnLight.addEventListener('click', () => setTheme('light'));

  // Form submission
  const txForm = document.getElementById('tx-form');
  if (txForm) txForm.addEventListener('submit', handleTransactionFormSubmit);

  // Modal Cancel / Close
  const modalClose = document.getElementById('modal-tx-close');
  const modalCancel = document.getElementById('modal-tx-cancel');
  if (modalClose) modalClose.addEventListener('click', () => closeModal('tx-modal'));
  if (modalCancel) modalCancel.addEventListener('click', () => closeModal('tx-modal'));

  const confirmCancel = document.getElementById('confirm-cancel-btn');
  if (confirmCancel) confirmCancel.addEventListener('click', () => closeModal('confirm-modal'));

  // Backdrop click to close modals
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeModal(backdrop.id);
    });
  });

  // Keyboard shortcut: ESC to close modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal('tx-modal');
      closeModal('confirm-modal');
      closeMobileSidebar();
    }
  });

  // Transaction type segmented toggle buttons in modal
  const btnTypeExp = document.getElementById('btn-type-expense');
  const btnTypeInc = document.getElementById('btn-type-income');
  if (btnTypeExp) btnTypeExp.addEventListener('click', () => setTypeSegment('expense'));
  if (btnTypeInc) btnTypeInc.addEventListener('click', () => setTypeSegment('income'));

  // Transactions Search & Filter Controls
  const searchInput = document.getElementById('tx-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(filterTransactions, 200));
  }

  const clearSearchBtn = document.getElementById('btn-clear-search');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      filterTransactions();
    });
  }

  const filterType = document.getElementById('filter-type');
  if (filterType) filterType.addEventListener('change', filterTransactions);

  const filterCategory = document.getElementById('filter-category');
  if (filterCategory) filterCategory.addEventListener('change', filterTransactions);

  const filterSort = document.getElementById('filter-sort');
  if (filterSort) filterSort.addEventListener('change', filterTransactions);

  // Export CSV
  const btnExport = document.getElementById('btn-export-csv');
  if (btnExport) btnExport.addEventListener('click', exportTransactionsCSV);

  // Settings Save
  const btnSaveSettings = document.getElementById('btn-save-settings');
  if (btnSaveSettings) btnSaveSettings.addEventListener('click', saveSettings);

  // Danger Zone Data Controls
  const btnClearAll = document.getElementById('btn-clear-all-data');
  if (btnClearAll) btnClearAll.addEventListener('click', requestClearAllData);

  const btnRestore = document.getElementById('btn-restore-samples');
  if (btnRestore) btnRestore.addEventListener('click', restoreSampleData);

  // Close mobile sidebar when clicking on main wrapper
  const mainWrapper = document.querySelector('.main-wrapper');
  if (mainWrapper) {
    mainWrapper.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        closeMobileSidebar();
      }
    });
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates unique ID
 */
function generateId() {
  return 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Formats date string to friendly readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Escapes HTML characters to prevent XSS
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Debounce helper for high frequency inputs
 */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Expose globals needed for inline HTML handlers
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.requestDeleteTx = requestDeleteTx;
window.confirmDeleteTx = confirmDeleteTx;

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);
