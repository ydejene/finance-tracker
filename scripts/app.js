/**
 app.js - Main Application Controller
  
 Central event handling and application flow coordination.
 Wires together all modules (State, UI, Validators, Storage, Search).
  
 Uses IIFE pattern to avoid global namespace pollution.
 
 Application Architecture:
 User Action → Event Handler (app.js) → State Update (state.js) → Storage Persistence (storage.js) → UI Re-render (ui.js)

Module Dependencies:
- Validators: Form validation and regex patterns
- Storage: LocalStorage operations
- State: Application state management
- Search: Regex search and highlighting
- UI: DOM manipulation and rendering

Initialization Flow:
 - DOMContentLoaded event fires
 - init() called
 - State loads from localStorage
 - Icons initialized
 - Settings UI populated
 - Initial render
 - Event listeners attached

Event Handling Pattern:
 -Each user interaction has a dedicated handler function that coordinates state updates and UI re-renders.
*/

(function () {
  "use strict";

  // INITIALIZATION

  function init() {
    State.initialize();
    initializeIcons();
    loadSettingsUI();
    renderAll();
    attachEventListeners();
    console.log("Finance Tracker initialized!");
  }

  function loadSettingsUI() {
    const settings = State.getSettings();

    // Load budget cap
    const budgetInput = document.getElementById("budget-cap-input");
    if (budgetInput && settings.budgetCap) {
      budgetInput.value = settings.budgetCap;
    }

    // Load currency rates
    const eurRateInput = document.getElementById("eur-rate");
    const gbpRateInput = document.getElementById("gbp-rate");
    if (eurRateInput) eurRateInput.value = settings.currencyRates.EUR;
    if (gbpRateInput) gbpRateInput.value = settings.currencyRates.GBP;

    // Load selected currency
    const currencySelect = document.getElementById("currency-select");
    if (currencySelect && settings.currentCurrency) {
      currencySelect.value = settings.currentCurrency;
    }
  }

  function renderAll() {
    let transactions = State.getAllTransactions();

    // Apply search filter
    const regex = Search.getCurrentRegex();
    if (regex && !regex.error) {
      transactions = Search.searchTransactions(transactions, regex);
    }

    // Apply sorting
    const sorted = sortTransactions(transactions);
    UI.renderTransactions(sorted);
    updateDashboard();
  }

  // EVENT LISTENERS

  function attachEventListeners() {
    // Add Transaction button
    const addBtn = document.getElementById("add-transaction-btn");
    if (addBtn) {
      addBtn.addEventListener("click", handleAddClick);
    } else {
      console.error("Add transaction button not found!");
    }

    // Cancel button
    const cancelBtn = document.getElementById("cancel-form-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", handleCancelClick);
    } else {
      console.error("Cancel button not found!");
    }

    // Form submission
    if (UI.elements.transactionForm) {
      UI.elements.transactionForm.addEventListener("submit", handleFormSubmit);
    }

    // Real-time validation
    if (UI.elements.descriptionInput) {
      UI.elements.descriptionInput.addEventListener("input", () => {
        validateField("description", UI.elements.descriptionInput.value);
      });
    }

    if (UI.elements.amountInput) {
      UI.elements.amountInput.addEventListener("input", () => {
        validateField("amount", UI.elements.amountInput.value);
      });
    }

    if (UI.elements.dateInput) {
      UI.elements.dateInput.addEventListener("change", () => {
        validateField("date", UI.elements.dateInput.value);
      });
    }

    if (UI.elements.categoryInput) {
      UI.elements.categoryInput.addEventListener("change", () => {
        validateField("category", UI.elements.categoryInput.value);
      });
    }

    // Edit/Delete buttons (event delegation)
    if (UI.elements.transactionsContainer) {
      UI.elements.transactionsContainer.addEventListener(
        "click",
        handleTableClick
      );
    }

    // Close modal when clicking backdrop (outside the form)
    const modalBackdrop = document.getElementById("modal-backdrop");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", function (e) {
        // Only close if clicking the backdrop itself, not the form
        if (e.target === modalBackdrop) {
          handleCancelClick();
        }
      });
    }

    // Close modal with Escape key (accessibility!)
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        const modalBackdrop = document.getElementById("modal-backdrop");
        if (modalBackdrop && modalBackdrop.style.display === "flex") {
          handleCancelClick();
        }
      }
    });
    // Settings buttons
    const saveBudgetBtn = document.getElementById("save-budget-btn");
    if (saveBudgetBtn) {
      saveBudgetBtn.addEventListener("click", handleSaveBudget);
    }

    const saveRatesBtn = document.getElementById("save-rates-btn");
    if (saveRatesBtn) {
      saveRatesBtn.addEventListener("click", handleSaveCurrencyRates);
    }

    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', function() {
        const fileInput = document.getElementById('import-file');
        if (fileInput) {
          fileInput.click(); // Trigger file picker
        }
      });
    }

    const importFile = document.getElementById("import-file");
    if (importFile) {
      importFile.addEventListener("change", handleImportFile);
    }

    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) {
      exportBtn.addEventListener("click", handleExport);
    }

    const loadSampleBtn = document.getElementById("load-sample-btn");
    if (loadSampleBtn) {
      loadSampleBtn.addEventListener("click", handleLoadSample);
    }

    // Currency selector
    const currencySelect = document.getElementById("currency-select");
    if (currencySelect) {
      currencySelect.addEventListener("change", handleCurrencyChange);
    }

    // Sort controls
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", handleSortChange);
    }

    const sortOrderBtn = document.getElementById("sort-order-btn");
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener("click", handleSortOrderToggle);
    }

    // Search
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", handleSearch);
    }

    const caseSensitiveCheckbox = document.getElementById("case-sensitive");
    if (caseSensitiveCheckbox) {
      caseSensitiveCheckbox.addEventListener("change", handleSearch);
    }
  }

  // BUTTON HANDLERS

  function handleAddClick() {
    State.clearEditingId();
    UI.showForm("add");
  }

  function handleCancelClick() {
    State.clearEditingId();
    UI.hideForm();
  }

  function handleTableClick(e) {
    const target = e.target;

    // Edit button clicked
    if (target.classList.contains("edit-btn")) {
      const id = target.dataset.id;
      handleEdit(id);
    }

    // Delete button clicked
    if (target.classList.contains("delete-btn")) {
      const id = target.dataset.id;
      handleDelete(id);
    }
  }

  function handleEdit(id) {
    const transaction = State.getTransactionById(id);
    if (!transaction) return;

    State.setEditingId(id);
    UI.showForm("edit", transaction);
  }

  function handleDelete(id) {
    const transaction = State.getTransactionById(id);
    if (!transaction) return;

    const confirmed = confirm(`Delete "${transaction.description}"?`);
    if (!confirmed) return;

    State.deleteTransaction(id);
    renderAll();
  }

  // FORM HANDLING

  function handleFormSubmit(e) {
    e.preventDefault();

    const formData = UI.getFormData();
    const errors = Validators.validateTransaction(formData);

    // Show all errors
    UI.clearErrors();
    if (errors.description) UI.showError("description", errors.description);
    if (errors.amount) UI.showError("amount", errors.amount);
    if (errors.category) UI.showError("category", errors.category);
    if (errors.date) UI.showError("date", errors.date);

    // If any errors, stop
    if (Object.keys(errors).length > 0) {
      alert("Please fix all errors before saving.");
      return;
    }

    // Save (add or update)
    const editingId = State.getEditingId();
    if (editingId) {
      State.updateTransaction(editingId, formData);
    } else {
      State.addTransaction(formData);
    }

    // Refresh UI
    State.clearEditingId();
    UI.hideForm();
    renderAll();
  }

  function validateField(fieldName, value) {
    let error = null;

    switch (fieldName) {
      case "description":
        error = Validators.validateDescription(value);
        break;
      case "amount":
        error = Validators.validateAmount(value);
        break;
      case "date":
        error = Validators.validateDate(value);
        break;
      case "category":
        error = Validators.validateCategory(value);
        break;
    }

    if (error) {
      UI.showError(fieldName, error);
    } else {
      UI.clearError(fieldName);
    }
  }

  // SORTING

  function handleSortChange() {
    const sortSelect = document.getElementById("sort-by");
    State.setSortBy(sortSelect.value);
    renderAll();
  }

  function handleSortOrderToggle() {
    const newOrder = State.toggleSortOrder();
    const btn = document.getElementById("sort-order-btn");

    if (newOrder === "asc") {
      btn.textContent = "↑ Ascending";
    } else {
      btn.textContent = "↓ Descending";
    }

    renderAll();
  }

  function sortTransactions(transactions) {
    const sortBy = State.getSortBy();
    const sortOrder = State.getSortOrder();

    const sorted = [...transactions].sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "date":
          compareA = new Date(a.date);
          compareB = new Date(b.date);
          break;
        case "description":
          compareA = a.description.toLowerCase();
          compareB = b.description.toLowerCase();
          break;
        case "amount":
          compareA = a.amount;
          compareB = b.amount;
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  // DASHBOARD STATS

  function updateDashboard() {
    const transactions = State.getAllTransactions();

    const stats = {
      totalCount: transactions.length,
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      topCategory: getTopCategory(transactions),
      topCategoryAmount: getTopCategoryAmount(transactions),
      last7Days: getLast7DaysTotal(transactions),
    };

    UI.updateStats(stats);

    const chartData = generateChartData(transactions);
    UI.renderChart(chartData);
  }

  function getTopCategory(transactions) {
    if (transactions.length === 0) return "None";

    const counts = {};
    transactions.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });

    let topCategory = "";
    let maxCount = 0;
    for (const category in counts) {
      if (counts[category] > maxCount) {
        maxCount = counts[category];
        topCategory = category;
      }
    }

    return topCategory;
  }

  function getTopCategoryAmount(transactions) {
    if (transactions.length === 0) return 0;

    const topCategory = getTopCategory(transactions);
    return transactions
      .filter((t) => t.category === topCategory)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function getLast7DaysTotal(transactions) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);

    // The calculation subtracts 6 days to define the 7-day window which includes "today"
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0); // Normalizing the time for reliable comparison

    return transactions
      .filter((t) => new Date(t.date) >= sevenDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  function generateChartData(transactions) {
    const today = new Date();
    const chartData = [];

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Manually construct the local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because in javascript getMonth is 0-indexed (0 being January and 11 being December)
      const day = date.getDate().toString().padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      // Sum transactions for this day
      const dayTotal = transactions
        .filter((t) => t.date === dateStr)
        .reduce((sum, t) => sum + t.amount, 0);

      // Format label (e.g., "Mon", "Tue")
      const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });

      chartData.push({
        date: dateStr,
        label: dayLabel,
        amount: dayTotal,
      });
    }

    return chartData;
  }

  // SETTINGS HANDLERS

  function handleSaveBudget() {
    const budgetInput = document.getElementById("budget-cap-input");
    const budgetValue = parseFloat(budgetInput.value);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    const settings = State.getSettings();
    settings.budgetCap = budgetValue;
    State.updateSettings(settings);

    alert(`Budget cap set to $${budgetValue.toFixed(2)}`);
    updateDashboard(); // Refresh to show new budget status
  }

  function handleSaveCurrencyRates() {
    const eurRate = parseFloat(document.getElementById("eur-rate").value);
    const gbpRate = parseFloat(document.getElementById("gbp-rate").value);

    if (isNaN(eurRate) || eurRate <= 0 || isNaN(gbpRate) || gbpRate <= 0) {
      alert("Please enter valid exchange rates");
      return;
    }

    const settings = State.getSettings();
    settings.currencyRates = { EUR: eurRate, GBP: gbpRate };
    State.updateSettings(settings);

    alert("Currency rates updated successfully");
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        const validation = Storage.validateImportedData(data);

        if (!validation.valid) {
          alert(`Import failed: ${validation.error}`);
          return;
        }

        // Check for warnings (future dates)
        if (validation.warnings && validation.warnings.length > 0) {
          const warningMsg =
            validation.message +
            "\n\nTransactions with future dates:\n" +
            validation.warnings.slice(0, 5).join("\n") +
            (validation.warnings.length > 5
              ? `\n... and ${validation.warnings.length - 5} more`
              : "");

          const proceed = confirm(
            warningMsg + "\n\nDo you want to proceed with import?"
          );
          if (!proceed) {
            // Reset file input
            event.target.value = "";
            return;
          }
        }

        State.setTransactions(data);
        renderAll();

        // Success message with warning if applicable
        let successMsg = `Successfully imported ${data.length} transactions!`;
        if (validation.warnings) {
          successMsg += `\n\nNote: ${validation.warnings.length} transaction(s) have future dates.`;
        }
        alert(successMsg);

        // Reset file input
        event.target.value = "";
      } catch (error) {
        alert("Invalid JSON file. Please check the format.");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        const validation = Storage.validateImportedData(data);

        if (!validation.valid) {
          alert(`Import failed: ${validation.error}`);
          return;
        }

        // Confirm before overwriting
        const confirmed = confirm(
          `Import ${data.length} transactions? This will replace your current data.`
        );
        if (!confirmed) return;

        State.setTransactions(data);
        renderAll();
        alert(`Successfully imported ${data.length} transactions!`);
      } catch (error) {
        alert("Invalid JSON file. Please check the format.");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);
  }

  function handleExport() {
    const transactions = State.getAllTransactions();
    if (transactions.length === 0) {
      alert("No transactions to export");
      return;
    }

    Storage.exportToJSON(transactions);
    alert(`Exported ${transactions.length} transactions`);
  }

  // Currency Change
  function handleCurrencyChange() {
    const currencySelect = document.getElementById("currency-select");
    const selectedCurrency = currencySelect.value;
    State.setCurrentCurrency(selectedCurrency);
    renderAll();
  }

  // SEARCH

  function handleSearch() {
    const searchInput = document.getElementById("search-input");
    const caseSensitiveCheckbox = document.getElementById("case-sensitive");
    const searchError = document.getElementById("search-error");

    const pattern = searchInput.value;
    const isCaseSensitive = caseSensitiveCheckbox.checked;

    // Clear previous error
    searchError.textContent = "";
    searchInput.style.borderColor = "";

    // Compile regex
    const regex = Search.compileRegex(pattern, isCaseSensitive);

    // Check for errors
    if (regex && regex.error) {
      searchError.textContent = `Invalid regex: ${regex.error}`;
      searchInput.style.borderColor = "var(--danger-color)";
      Search.setCurrentRegex(null);
      renderAll();
      return;
    }

    // Save regex and case sensitivity
    Search.setCurrentRegex(regex);
    Search.setCaseSensitive(isCaseSensitive);

    // Filter and render
    renderAll();
  }

  function handleLoadSample() {
    const confirmed = confirm(
      "Load sample data from seed.json? This will replace your current transactions."
    );
    if (!confirmed) return;

    // Fetch seed.json file
    fetch("seed.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load seed.json");
        }
        return response.json();
      })
      .then((data) => {
        const validation = Storage.validateImportedData(data);

        if (!validation.valid) {
          alert(`Invalid seed data: ${validation.error}`);
          return;
        }

        // Check for future date warnings
        if (validation.warnings && validation.warnings.length > 0) {
          const warningMsg =
            validation.message +
            "\n\nTransactions with future dates:\n" +
            validation.warnings.slice(0, 5).join("\n") +
            (validation.warnings.length > 5
              ? `\n... and ${validation.warnings.length - 5} more`
              : "");

          const proceed = confirm(warningMsg + "\n\nDo you want to proceed?");
          if (!proceed) return;
        }

        State.setTransactions(data);
        renderAll();

        let successMsg = `Successfully loaded ${data.length} transactions from seed.json!`;
        if (validation.warnings) {
          successMsg += `\n\nNote: ${validation.warnings.length} transaction(s) have future dates.`;
        }
        alert(successMsg);
      })
      .catch((error) => {
        alert(`Error loading seed.json: ${error.message}`);
        console.error("Seed data error:", error);
      });
  }

  // ==========================================
  // INITIALIZE ICONS
  // ==========================================

  function initializeIcons() {
    // Get the icon helper from UI module
    const getIcon = function (name) {
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
          '<svg class="icon-sm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a22 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>',
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
    };

    // Header/Nav icons
    const logoIcon = document.getElementById("logo-icon");
    if (logoIcon) logoIcon.innerHTML = getIcon("wallet");

    const navChartIcon = document.getElementById("nav-chart-icon");
    if (navChartIcon) navChartIcon.innerHTML = getIcon("chart");

    const navDocIcon = document.getElementById("nav-doc-icon");
    if (navDocIcon) navDocIcon.innerHTML = getIcon("document");

    const navSettingsIcon = document.getElementById("nav-settings-icon");
    if (navSettingsIcon) navSettingsIcon.innerHTML = getIcon("settings");

    const navInfoIcon = document.getElementById("nav-info-icon");
    if (navInfoIcon) navInfoIcon.innerHTML = getIcon("info");

    // Section heading icons
    const dashIcon = document.getElementById("dash-icon");
    if (dashIcon) dashIcon.innerHTML = getIcon("chart");

    const transIcon = document.getElementById("trans-icon");
    if (transIcon) transIcon.innerHTML = getIcon("document");

    const settingsIcon = document.getElementById("settings-icon");
    if (settingsIcon) settingsIcon.innerHTML = getIcon("settings");

    // Button icons
    const importIcon = document.getElementById("import-icon");
    if (importIcon) importIcon.innerHTML = getIcon("import");

    const exportIcon = document.getElementById("export-icon");
    if (exportIcon) exportIcon.innerHTML = getIcon("export");

    const sampleIcon = document.getElementById("sample-icon");
    if (sampleIcon) sampleIcon.innerHTML = getIcon("sample");
  }
  // START APPLICATION

  document.addEventListener("DOMContentLoaded", init);
})();
