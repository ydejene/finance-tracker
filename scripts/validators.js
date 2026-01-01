/*
 validators.js - Validation logic module
  
 This module provides regex-based validation for all form inputs.
 Uses IIFE (Immediately Invoked Function Expression) pattern for modularity.
 
 Exports: Validators object with validation functions and regex patterns
 */
const Validators = (function () {
  "use strict";

  // REGEX PATTERNS

  const descriptionRegex = /^\S+(\s\S+)*$/;
  const amountRegex = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  const categoryRegex = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
  const duplicateWordsRegex = /\b(\w+)\s+\1\b/i;

  // VALIDATION FUNCTIONS

  function validateDescription(value) {
    if (!value || value.trim() === "") {
      return "Description is required";
    }
    if (!descriptionRegex.test(value)) {
      return "No leading/trailing spaces or double spaces allowed";
    }
    if (duplicateWordsRegex.test(value)) {
      return "Description contains duplicate words";
    }
    return null;
  }

  
  function validateAmount(value) {
    if (!value || value.trim() === "") {
      return "Amount is required";
    }
    if (!amountRegex.test(value)) {
      return "Must be a valid number (e.g., 12.50)";
    }
    const num = parseFloat(value);
    if (num < 0) return "Cannot be negative";
    if (num > 999999) return "Amount too large";
    return null;
  }

  function validateDate(value) {
    if (!value || value.trim() === "") {
      return "Date is required";
    }
    if (!dateRegex.test(value)) {
      return "Must be in YYYY-MM-DD format";
    }
    const dateObj = new Date(value);
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    const today = new Date();

    //  // Normalize both dates to midnight local time for a consistent comparison
    dateObj.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // explicitly comparing the timestamps using the getTime() method for clarity
    if (dateObj.getTime() > today.getTime()) {
      return "Cannot be in the future";
    }
    return null;
  }

  function validateCategory(value) {
    if (!value || value.trim() === "") {
      return "Please select a category";
    }
    return null;
  }

  function validateTransaction(transaction) {
    const errors = {};

    const descError = validateDescription(transaction.description);
    if (descError) errors.description = descError;

    const amtError = validateAmount(transaction.amount);
    if (amtError) errors.amount = amtError;

    const catError = validateCategory(transaction.category);
    if (catError) errors.category = catError;

    const dtError = validateDate(transaction.date);
    if (dtError) errors.date = dtError;

    return errors;
  }

  // PUBLIC API

  return {
    validateDescription,
    validateAmount,
    validateDate,
    validateCategory,
    validateTransaction,
    patterns: {
      description: descriptionRegex,
      amount: amountRegex,
      date: dateRegex,
      category: categoryRegex,
      duplicateWords: duplicateWordsRegex,
    },
  };
})();
