# Website-Prompting-CMS

#  Complaint Management System

A modern, fully responsive **Complaint Management System** built using **HTML, CSS, and JavaScript**, with **localStorage** for data persistence.
This project simulates a real-world SaaS dashboard with authentication, complaint tracking, and advanced UI features — without using any backend or database.

---

## 📌 Features

### 🔐 Authentication

* User Signup & Login system
* Email validation and password verification
* Prevent duplicate user registration
* Session management using localStorage
* Secure route protection (dashboard access only after login)
* Logout functionality

---

### 📊 Dashboard

* Professional admin-style dashboard UI
* Sidebar navigation
* User profile display
* Dark/Light mode toggle
* Statistics cards:

  * Total Complaints
  * Pending
  * In Progress
  * Resolved

---

### 📝 Complaint Management

* Add new complaints with:

  * Title, Description
  * Category (Technical, Billing, Service, Other)
  * Priority (Low, Medium, High)
  * Auto-generated Complaint ID
  * Date & Time

* Manage complaints:

  * View details in modal popup
  * Edit complaints
  * Delete complaints (with confirmation)
  * Update complaint status

---

### 🔍 Search, Filter & Sort

* Search complaints by title
* Filter by:

  * Status
  * Category
  * Priority
* Sort by:

  * Latest
  * Priority

---

###  Import / Export

* Export complaints as JSON file
* Import complaints from JSON file

---

###  UI/UX Highlights

* Modern SaaS dashboard design
* Fully responsive (mobile, tablet, desktop)
* Clean and minimal layout
* Smooth animations and transitions
* Toast notifications for actions
* Loading spinner
* Empty state UI
* Collapsible sidebar

---

### 🌙 Dark Mode

* Toggle between dark and light themes
* User preference saved in localStorage

---

### ⚙️ Technical Stack

* HTML5
* CSS3 (Flexbox & Grid)
* Vanilla JavaScript
* localStorage (for data persistence)

---

## 📁 Project Structure

```
project/
│
├── index.html        # Login Page
├── signup.html       # Signup Page
├── dashboard.html    # Main Dashboard
│
├── css/
│   └── style.css
│
├── js/
│   ├── auth.js
│   ├── app.js
│   ├── ui.js
│   └── storage.js
│
└── assets/
    └── images/icons
```

---

##  Key Concepts Used

* DOM Manipulation
* Event Handling
* Local Storage API
* Form Validation
* Modular JavaScript
* Responsive Web Design
