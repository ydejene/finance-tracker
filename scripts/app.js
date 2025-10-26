// app.js - Main application controller (wires everything together)

(function () {
  "use strict";

  // INITIALIZATION

  function init() {
    State.initialize();
    loadSettingsUI(); // Add this line
    renderAll();
    attachEventListeners();
    // console.log("Finance Tracker initialized!");
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
  }

  function renderAll() {
    const transactions = State.getAllTransactions();
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

    const importBtn = document.getElementById("import-btn");
    if (importBtn) {
      importBtn.addEventListener("click", handleImport);
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

    // Sort controls
    const sortSelect = document.getElementById("sort-by");
    if (sortSelect) {
      sortSelect.addEventListener("change", handleSortChange);
    }

    const sortOrderBtn = document.getElementById("sort-order-btn");
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener("click", handleSortOrderToggle);
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

    // The calculation subtracts 6 days to define the 7-day window.
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

  function handleImport() {
    const fileInput = document.getElementById("import-file");
    fileInput.click(); // Trigger file picker
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

  function handleLoadSample() {
    const confirmed = confirm(
      "Load sample data? This will replace your current transactions."
    );
    if (!confirmed) return;

    const sampleData = [
      {
        id: "txn_001",
        description: "Lunch at cafeteria",
        amount: 12.5,
        category: "Food",
        date: "2025-10-25",
        createdAt: new Date("2025-10-25T12:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-25T12:00:00Z").toISOString(),
      },
      {
        id: "txn_002",
        description: "Chemistry textbook",
        amount: 89.99,
        category: "Books",
        date: "2025-10-24",
        createdAt: new Date("2025-10-24T10:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-24T10:00:00Z").toISOString(),
      },
      {
        id: "txn_003",
        description: "Monthly bus pass",
        amount: 45.0,
        category: "Transport",
        date: "2025-10-23",
        createdAt: new Date("2025-10-23T09:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-23T09:00:00Z").toISOString(),
      },
      {
        id: "txn_004",
        description: "Coffee with friends",
        amount: 8.75,
        category: "Entertainment",
        date: "2025-10-20",
        createdAt: new Date("2025-10-20T15:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-20T15:00:00Z").toISOString(),
      },
      {
        id: "txn_005",
        description: "Gym membership",
        amount: 35.0,
        category: "Other",
        date: "2025-10-19",
        createdAt: new Date("2025-10-19T08:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-19T08:00:00Z").toISOString(),
      },
      {
        id: "txn_006",
        description: "Groceries for week",
        amount: 67.43,
        category: "Food",
        date: "2025-10-22",
        createdAt: new Date("2025-10-22T18:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-22T18:00:00Z").toISOString(),
      },
      {
        id: "txn_007",
        description: "Notebook and pens",
        amount: 15.99,
        category: "Books",
        date: "2025-10-18",
        createdAt: new Date("2025-10-18T11:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-18T11:00:00Z").toISOString(),
      },
      {
        id: "txn_008",
        description: "Uber to campus",
        amount: 12.3,
        category: "Transport",
        date: "2025-10-21",
        createdAt: new Date("2025-10-21T07:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-21T07:00:00Z").toISOString(),
      },
      {
        id: "txn_009",
        description: "Movie tickets",
        amount: 24.0,
        category: "Entertainment",
        date: "2025-10-19",
        createdAt: new Date("2025-10-19T20:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-19T20:00:00Z").toISOString(),
      },
      {
        id: "txn_010",
        description: "Lab fees",
        amount: 50.0,
        category: "Fees",
        date: "2025-10-12",
        createdAt: new Date("2025-10-12T10:00:00Z").toISOString(),
        updatedAt: new Date("2025-10-12T10:00:00Z").toISOString(),
      },
    ];

    State.setTransactions(sampleData);
    renderAll();
    alert("Sample data loaded successfully!");
  }

  // START APPLICATION

  document.addEventListener("DOMContentLoaded", init);
})();
