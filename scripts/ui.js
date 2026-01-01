// ui.js - UI rendering and DOM manipulation module (IIFE pattern)

const UI = (function () {
  "use strict";

  // DOM ELEMENTS

  const elements = {
    formSection: document.getElementById("form-section"),
    transactionForm: document.getElementById("transaction-form"),
    formTitle: document.getElementById("form-title"),
    transactionsContainer: document.getElementById("transactions-container"),

    // Form inputs
    descriptionInput: document.getElementById("description"),
    amountInput: document.getElementById("amount"),
    categoryInput: document.getElementById("category"),
    dateInput: document.getElementById("date"),
    transactionIdInput: document.getElementById("transaction-id"),

    // Error spans
    descriptionError: document.getElementById("description-error"),
    amountError: document.getElementById("amount-error"),
    categoryError: document.getElementById("category-error"),
    dateError: document.getElementById("date-error"),
  };

  // ==========================================
  // ICON HELPERS
  // ==========================================

  function getIcon(name) {
    const icons = {
      wallet:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>',
      chart:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>',
      document:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
      settings:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
      info: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      edit: '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>',
      delete:
        '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
      import:
        '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>',
      export:
        '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>',
      sample:
        '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>',
      calendar:
        '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
      tag: '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>',
      count:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>',
      dollar:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
      target:
        '<svg class="icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    };
    return icons[name] || "";
  }
  // FORM MANAGEMENT

  function showForm(mode = "add", transaction = null) {
    const modalBackdrop = document.getElementById("modal-backdrop");

    // Show modal
    modalBackdrop.style.display = "flex";

    // Prevent body scroll
    document.body.classList.add("modal-open");

    clearErrors();

    if (mode === "add") {
      elements.formTitle.textContent = "Add Transaction";
      elements.transactionForm.reset();
      elements.transactionIdInput.value = "";
    } else if (mode === "edit" && transaction) {
      elements.formTitle.textContent = "Edit Transaction";
      elements.descriptionInput.value = transaction.description;
      elements.amountInput.value = transaction.amount;
      elements.categoryInput.value = transaction.category;
      elements.dateInput.value = transaction.date;
      elements.transactionIdInput.value = transaction.id;
    }

    // Focus first input for accessibility
    setTimeout(() => {
      elements.descriptionInput.focus();
    }, 100);
  }

  function hideForm() {
    const modalBackdrop = document.getElementById("modal-backdrop");
    modalBackdrop.style.display = "none";

    // Re-enable body scroll
    document.body.classList.remove("modal-open");

    elements.transactionForm.reset();
    clearErrors();
  }

  function showError(field, message) {
    const errorElement = elements[field + "Error"];
    const inputElement = elements[field + "Input"];

    if (errorElement) {
      errorElement.textContent = message;
    }
    if (inputElement) {
      inputElement.setAttribute("aria-invalid", "true");
    }
  }

  function clearError(field) {
    const errorElement = elements[field + "Error"];
    const inputElement = elements[field + "Input"];

    if (errorElement) {
      errorElement.textContent = "";
    }
    if (inputElement) {
      inputElement.removeAttribute("aria-invalid");
    }
  }

  function clearErrors() {
    clearError("description");
    clearError("amount");
    clearError("category");
    clearError("date");
  }

  function getFormData() {
    return {
      id: elements.transactionIdInput.value,
      description: elements.descriptionInput.value,
      amount: elements.amountInput.value,
      category: elements.categoryInput.value,
      date: elements.dateInput.value,
    };
  }

  // TRANSACTION RENDERING

  function renderTransactions(transactions) {
    if (transactions.length === 0) {
      elements.transactionsContainer.innerHTML =
        '<p class="empty-state">No transactions yet. Click "Add Transaction" above to get started!</p>';
      return;
    }

    // Create container with both table and cards
    elements.transactionsContainer.innerHTML = "";

    // Render table (for desktop/tablet)
    const table = createTable(transactions);
    elements.transactionsContainer.appendChild(table);

    // Render cards (for mobile)
    const cardsContainer = createCards(transactions);
    elements.transactionsContainer.appendChild(cardsContainer);
  }

  function createTable(transactions) {
    const table = document.createElement("table");
    table.className = "transactions-table";
    table.innerHTML = `
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="transactions-tbody">
            </tbody>
        `;

    const tbody = table.querySelector("#transactions-tbody");

    transactions.forEach((transaction) => {
      const row = createTransactionRow(transaction);
      tbody.appendChild(row);
    });

    return table;
  }

  function createCards(transactions) {
    const container = document.createElement("div");
    container.className = "transactions-cards";

    transactions.forEach((transaction) => {
      const card = createTransactionCard(transaction);
      container.appendChild(card);
    });

    return container;
  }

  function createTransactionCard(transaction) {
    const card = document.createElement("div");
    card.className = "transaction-card";
    card.dataset.id = transaction.id;

    // Get highlighted description
    const regex = Search.getCurrentRegex();
    const highlightedDesc =
      regex && !regex.error
        ? Search.highlightText(transaction.description, regex)
        : escapeHtml(transaction.description);

    // Get currency info
    const currency = State.getCurrentCurrency();
    const convertedAmount = State.convertAmount(transaction.amount, currency);
    const currencySymbol = State.getCurrencySymbol(currency);

    // Format amounts
    const originalAmountStr = transaction.amount.toFixed(2);
    const convertedAmountStr = convertedAmount.toFixed(2);

    // Highlight ORIGINAL amount string (for search matching)
    let displayAmount;
    if (regex && !regex.error) {
      // Check if regex matches the ORIGINAL amount
      const tempRegex = new RegExp(regex.source, regex.flags);
      if (tempRegex.test(originalAmountStr)) {
        // Highlight the CONVERTED amount (visual)
        displayAmount = `<mark>${convertedAmountStr}</mark>`;
      } else {
        displayAmount = convertedAmountStr;
      }
    } else {
      displayAmount = convertedAmountStr;
    }

    card.innerHTML = `
            <div class="card-header">
                <div class="card-description">${highlightedDesc}</div>
                <div class="card-amount">${currencySymbol}${displayAmount}</div>
            </div>
            <div class="card-details">
                <div class="card-detail-item">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>${transaction.date}</span>
                </div>
                <div class="card-detail-item">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                    <span>${transaction.category}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="edit-btn secondary-btn" data-id="${transaction.id}">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit
                </button>
                <button class="delete-btn secondary-btn" data-id="${transaction.id}">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                </button>
            </div>
        `;

    return card;
  }

  function createTransactionRow(transaction) {
    const row = document.createElement("tr");
    row.dataset.id = transaction.id;

    // Get current search regex for highlighting
    const regex = Search.getCurrentRegex();

    // Highlight description (original data)
    const highlightedDesc =
      regex && !regex.error
        ? Search.highlightText(transaction.description, regex)
        : escapeHtml(transaction.description);

    // Get currency info
    const currency = State.getCurrentCurrency();
    const convertedAmount = State.convertAmount(transaction.amount, currency);
    const currencySymbol = State.getCurrencySymbol(currency);

    // Format amounts
    const originalAmountStr = transaction.amount.toFixed(2);
    const convertedAmountStr = convertedAmount.toFixed(2);

    // Highlight ORIGINAL amount string (for search matching)
    let displayAmount;
    if (regex && !regex.error) {
      // Check if regex matches the ORIGINAL amount
      const tempRegex = new RegExp(regex.source, regex.flags);
      if (tempRegex.test(originalAmountStr)) {
        // Highlight the CONVERTED amount (visual)
        displayAmount = `<mark>${convertedAmountStr}</mark>`;
      } else {
        displayAmount = convertedAmountStr;
      }
    } else {
      displayAmount = convertedAmountStr;
    }

    row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${highlightedDesc}</td>
            <td>${transaction.category}</td>
            <td>${currencySymbol}${displayAmount}</td>
            <td class="actions">
                <button class="edit-btn" data-id="${transaction.id}">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Edit
                </button>
                <button class="delete-btn" data-id="${transaction.id}">
                    <svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete
                </button>
            </td>
        `;

    return row;
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // STATS RENDERING

  function updateStats(stats) {
    const totalCount = document.getElementById("total-count");
    const totalAmount = document.getElementById("total-amount");
    const topCategory = document.getElementById("top-category");
    const topCategoryAmount = document.getElementById("top-category-amount");
    const last7Days = document.getElementById("last-7-days");

    // Get current currency
    const currency = State.getCurrentCurrency();
    const symbol = State.getCurrencySymbol(currency);

    // Convert amounts
    const convertedTotal = State.convertAmount(stats.totalAmount, currency);
    const convertedTopAmount = State.convertAmount(
      stats.topCategoryAmount,
      currency
    );
    const convertedLast7 = State.convertAmount(stats.last7Days, currency);

    if (totalCount) totalCount.textContent = stats.totalCount;
    if (totalAmount)
      totalAmount.textContent = symbol + convertedTotal.toFixed(2);
    if (topCategory) topCategory.textContent = stats.topCategory || "None";
    if (topCategoryAmount) {
      topCategoryAmount.textContent = stats.topCategoryAmount
        ? symbol + convertedTopAmount.toFixed(2)
        : "";
    }
    if (last7Days) last7Days.textContent = symbol + convertedLast7.toFixed(2);

    // Update budget status
    updateBudgetStatus(stats.totalAmount);
  }

  function updateBudgetStatus(totalAmount) {
    const budgetCard = document.getElementById("budget-card");
    const budgetStatus = document.getElementById("budget-status");
    const settings = State.getSettings();

    if (!settings.budgetCap) {
      budgetStatus.textContent = "Not Set";
      budgetStatus.className = "stat-value";
      return;
    }

    const remaining = settings.budgetCap - totalAmount;

    if (remaining >= 0) {
      budgetStatus.textContent = `$${remaining.toFixed(2)} remaining`;
      budgetStatus.className = "stat-value budget-ok";
    } else {
      budgetStatus.textContent = `$${Math.abs(remaining).toFixed(2)} over!`;
      budgetStatus.className = "stat-value budget-over";
    }
  }

  function renderChart(chartData) {
    const chartContainer = document.getElementById("chart");

    if (chartData.length === 0) {
      chartContainer.innerHTML =
        '<div class="chart-empty">No data for last 7 days</div>';
      return;
    }

    // Get current currency for display
    const currency = State.getCurrentCurrency();
    const symbol = State.getCurrencySymbol(currency);

    // Convert all amounts to selected currency
    const convertedData = chartData.map((day) => ({
      ...day,
      originalAmount: day.amount,
      amount: State.convertAmount(day.amount, currency),
    }));

    // Find max value for scaling
    const maxAmount = Math.max(...convertedData.map((d) => d.amount));

    // Clear and create bars
    chartContainer.innerHTML = "";

    convertedData.forEach((day) => {
      const bar = document.createElement("div");
      bar.className = "chart-bar";

      // Calculate height as percentage of max (min 10% for visibility)
      const heightPercent = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 10;
      bar.style.height = `${Math.max(heightPercent, 10)}%`;

      // Add value label on bar (with converted amount)
      if (day.amount > 0) {
        const valueLabel = document.createElement("span");
        valueLabel.className = "chart-bar-value";
        valueLabel.textContent = `${symbol}${day.amount.toFixed(0)}`;
        bar.appendChild(valueLabel);
      }

      // Add date label below bar
      const label = document.createElement("div");
      label.className = "chart-bar-label";
      label.textContent = day.label;
      bar.appendChild(label);

      chartContainer.appendChild(bar);
    });
  }

  // PUBLIC API

  return {
    elements,
    showForm,
    hideForm,
    showError,
    clearError,
    clearErrors,
    getFormData,
    renderTransactions,
    updateStats,
    updateBudgetStatus,
    renderChart,
  };
})();
