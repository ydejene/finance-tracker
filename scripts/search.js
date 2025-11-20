// search.js - Regex search and highlighting module (IIFE pattern)

const Search = (function () {
  "use strict";

  let currentRegex = null;
  let caseSensitive = false;

  // REGEX COMPILATION

  function compileRegex(pattern, isCaseSensitive) {
    if (!pattern || pattern.trim() === "") {
      return null;
    }

    try {
      const flags = isCaseSensitive ? "g" : "gi";
      return new RegExp(pattern, flags);
    } catch (error) {
      return { error: error.message };
    }
  }

  function setCurrentRegex(regex) {
    currentRegex = regex;
  }

  function getCurrentRegex() {
    return currentRegex;
  }

  function setCaseSensitive(value) {
    caseSensitive = value;
  }

  function isCaseSensitive() {
    return caseSensitive;
  }

  // SEARCH & FILTER

  function searchTransactions(transactions, regex) {
        if (!regex || regex.error) {
            return transactions;
        }
        
        return transactions.filter(transaction => {
            // Reset regex for each transaction
            regex.lastIndex = 0;
            
            // Search in description
            if (regex.test(transaction.description)) {
                return true;
            }
            
            // Reset again (regex.test() modifies lastIndex)
            regex.lastIndex = 0;
            
            // Search in amount (convert to string with 2 decimals)
            const amountStr = transaction.amount.toFixed(2);
            if (regex.test(amountStr)) {
                return true;
            }
            
            regex.lastIndex = 0;
            
            // Search in category
            if (regex.test(transaction.category)) {
                return true;
            }
            
            regex.lastIndex = 0;
            
            // Search in date
            if (regex.test(transaction.date)) {
                return true;
            }
            
            return false;
        });
    }

  // HIGHLIGHTING

  function highlightText(text, regex) {
    if (!regex || regex.error || !text) {
      return escapeHtml(text);
    }

    // Reset regex lastIndex
    regex.lastIndex = 0;

    const escapedText = escapeHtml(text);
    return escapedText.replace(regex, (match) => {
      return `<mark>${match}</mark>`;
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // PUBLIC API

  return {
    compileRegex,
    setCurrentRegex,
    getCurrentRegex,
    setCaseSensitive,
    isCaseSensitive,
    searchTransactions,
    highlightText,
  };
})();
