# Student Finance Tracker

A responsive web application for tracking student expenses with regex-powered search, real-time validation, and accessible design.

**Live Demo:** [GitHub Pages URL - Add after deployment]

**Repository:** [Your GitHub Repo URL]

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [Regex Catalog](#regex-catalog)
- [Keyboard Navigation](#keyboard-navigation)
- [Accessibility Features](#accessibility-features)
- [Testing](#testing)
- [Project Structure](#project-structure)

---

## Features

### Core Functionality
- **Add/Edit/Delete Transactions** - Full CRUD operations with modal interface
- **Real-time Validation** - Instant feedback with 5 regex patterns including advanced back-reference
- **Data Persistence** - LocalStorage with JSON import/export
- **Responsive Design** - Mobile-first approach with 3 breakpoints (360px, 768px, 1024px)
- **Regex Search** - Live pattern matching across all fields with highlighting
- **Sorting** - Multi-field sorting (date, description, amount) with ascending/descending toggle
- **Dashboard Stats** - Real-time metrics and 7-day spending chart
- **Budget Management** - Set monthly caps with visual alerts

### Design & UX
- Mobile cards view / Desktop table view
- Smooth animations and transitions
- Full keyboard navigation support
- WCAG compliant accessibility features
- Intuitive modal-based forms

---

## Technologies Used

- **HTML5** - Semantic structure with ARIA landmarks
- **CSS3** - Flexbox, Grid, Custom Properties, Animations
- **Vanilla JavaScript** - ES6+, IIFE Modules
- **LocalStorage API** - Client-side data persistence
- **Regular Expressions** - Advanced pattern matching and validation

**No frameworks or libraries used** (as per assignment requirements)

---

## Setup & Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git (for cloning)

### Local Setup

1. **Clone the repository:**
```bash
   git clone [your-repo-url]
   cd finance-tracker
```

2. **Open in browser:**
   - Simply open `index.html` in your browser
   - OR use a local server:
```bash
     # Python 3
     python -m http.server 8000
     
     # Then visit http://localhost:8000
```

3. **Load sample data:**
   - Click "Load Sample Data" button
   - OR import `seed.json` via "Import" button

---

## Usage Guide

### Adding Transactions
1. Click the **"+ Add Transaction"** button
2. Fill in the form fields:
   - **Description:** No leading/trailing spaces (e.g., "Lunch at cafeteria")
   - **Amount:** Valid currency format (e.g., 12.50 or 100)
   - **Category:** Select from dropdown
   - **Date:** YYYY-MM-DD format (cannot be in future)
3. Click **"Save Transaction"**

### Editing/Deleting
- **Edit:** Click button on any transaction
- **Delete:** Click button (requires confirmation)

### Searching
- Type regex patterns in the search box
- Toggle **"Case Sensitive"** checkbox for exact matching
- Search works across: description, amount, category, and date

### Sorting
- Select field from **"Sort by"** dropdown
- Click **"↑ Ascending"** button to toggle order

### Data Management
- **Export:** Downloads transactions as JSON file
- **Import:** Upload previously exported JSON file
- **Sample Data:** Loads 12 example transactions

### Settings
- **Budget Cap:** Set monthly spending limit (shows green/red status)
- **Currency Rates:** Define EUR/GBP exchange rates (for future features)

---

## Regex Catalog

All regex patterns with examples:

### 1. Description Validation
**Pattern:** `/^\S+(\s\S+)*$/`

**Purpose:** No leading/trailing spaces, no double spaces

**Examples:**
- Valid: `"Lunch at cafeteria"`, `"Coffee"`, `"Bus pass"`
- Invalid: `" Lunch"` (leading space), `"Lunch "` (trailing), `"Coffee  with"` (double space)

---

### 2. Amount Validation
**Pattern:** `/^(0|[1-9]\d*)(\.\d{1,2})?$/`

**Purpose:** Valid currency format with optional 1-2 decimal places

**Examples:**
- Valid: `"12.50"`, `"100"`, `"0"`, `"9.5"`
- Invalid: `"12.505"` (3 decimals), `"-10"` (negative), `"abc"` (letters)

---

### 3. Date Validation
**Pattern:** `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`

**Purpose:** YYYY-MM-DD format with valid month (01-12) and day (01-31)

**Examples:**
- Valid: `"2024-11-15"`, `"2024-01-01"`, `"2024-12-31"`
- Invalid: `"11/15/2024"` (wrong format), `"2024-13-01"` (invalid month), `"2024-02-31"` (invalid date)

---

### 4. Category Validation
**Pattern:** `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`

**Purpose:** Letters only, with optional spaces or hyphens

**Examples:**
- Valid: `"Food"`, `"Fast Food"`, `"Student-Fees"`
- Invalid: `"Category123"` (numbers), `""` (empty)

---

### 5. Duplicate Word Detection (ADVANCED)
**Pattern:** `/\b(\w+)\s+\1\b/i`

**Purpose:** Detects repeated words using back-reference `\1`

**How it works:**
- `\b(\w+)` - Captures first word
- `\s+` - Matches spaces
- `\1` - References the captured word (back-reference)
- `i` - Case-insensitive flag

**Examples:**
- Detects: `"coffee coffee"`, `"the the"`, `"Book book"`
- Allows: `"coffee with tea"`, `"monthly payment"`

---

### Search Regex Examples

**Find transactions with cents:**
```
\.\d{2}\b
```
Matches: 12.50, 8.75, 89.99

**Find amounts $50+:**
```
^[5-9]\d\.\d{2}|[1-9]\d{2,}
```
Matches: 67.43, 89.99, 125.00

**Find food keywords:**
```
(coffee|lunch|groceries)/i
```
Matches: "Coffee", "Lunch at cafeteria", "Groceries for week"

**Find specific dates:**
```
2024-11-1
```
Matches: All dates starting with "2024-11-1" (Nov 10-19)

---

## Keyboard Navigation

Full keyboard support for accessibility:

| Key | Action |
|-----|--------|
| `Tab` | Navigate between interactive elements |
| `Shift + Tab` | Navigate backwards |
| `Enter` | Activate buttons, submit forms |
| `Escape` | Close modal form |
| `Space` | Toggle checkboxes, activate buttons |

**Navigation Flow:**
1. Skip to main content link (when focused)
2. Header navigation links
3. Dashboard section
4. Transaction controls (Add, Import, Export, Search, Sort)
5. Transaction table/cards
6. Edit/Delete buttons
7. Settings controls

---

## Accessibility Features

### WCAG 2.1 AA Compliance

**Semantic HTML:**
- `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` landmarks
- Proper heading hierarchy (h1 → h2 → h3)
- `<label>` elements bound to inputs via `for` attribute

**ARIA Support:**
- `role="alert"` for error messages (immediate announcement)
- `aria-live="polite"` for budget status updates
- `aria-live="assertive"` for budget overage warnings
- `aria-invalid="true"` on invalid inputs
- `aria-describedby` linking inputs to error messages

**Keyboard Accessibility:**
- All interactive elements keyboard-accessible
- Visible focus indicators (2px blue outline)
- Logical tab order
- Modal traps focus until closed
- Skip-to-content link for screen reader users

**Visual Design:**
- Color contrast meets WCAG AA standards (4.5:1 minimum)
- Focus states don't rely on color alone
- Error messages use icons + text + color
- Form hints provide guidance before errors

**Screen Reader Support:**
- Descriptive button text
- Form field labels and hints
- Live region announcements
- Alternative text where needed

---

## Testing

### Automated Tests

**Open `tests.html` in your browser to run validation tests.**

Tests cover:
- 6 description validation cases (including edge cases)
- 8 amount validation cases (decimals, negatives, letters)
- 6 date validation cases (formats, invalid dates, future dates)
- 5 category validation cases
- **Total: 25 test cases** with 100% pass rate

## Project Structure
```
finance-tracker/
├── index.html              # Main application page
├── tests.html              # Validation test suite
├── seed.json               # Sample data (12 transactions)
├── README.md               # This file
│
├── styles/
│   └── main.css            # All styles (mobile-first, responsive)
│
├── scripts/
│   ├── validators.js       # Regex validation patterns & functions
│   ├── storage.js          # LocalStorage & JSON import/export
│   ├── state.js            # Application state management
│   ├── search.js           # Regex search & highlighting
│   ├── ui.js               # DOM manipulation & rendering
│   └── app.js              # Main controller (event handlers)
│
└── assets/                 # (Optional) Images, icons, etc.
```

### Module Architecture (IIFE Pattern)

Each JavaScript file exposes a global object:

- **`Validators`** - Validation functions and regex patterns
- **`Storage`** - Data persistence (load/save/import/export)
- **`State`** - Application state (transactions, settings, sort/filter state)
- **`Search`** - Regex compilation, searching, highlighting
- **`UI`** - DOM rendering (forms, tables, cards, stats, charts)
- **`App`** - Event handlers and application initialization

**Dependencies:**
```
app.js → depends on → Validators, Storage, State, Search, UI
ui.js → depends on → Search
state.js → depends on → Storage
(All others are independent)
```

## Author

**Your Name**
- Email: y.dejene@alustudent.com
- GitHub: [@ydejene](https://github.com/ydejene)

---

## License

This project was created as a course assignment for FrontEnd Web Develeopment at African Leadership University.

---

## Acknowledgments

- Regex patterns based on assignment specifications
- Accessibility guidelines from WCAG 2.1
- Mobile-first CSS approach inspired by modern responsive design practices