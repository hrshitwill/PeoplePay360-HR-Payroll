# PeoplePay360: HR & Payroll Operations Platform

**PeoplePay360** is an enterprise-grade, integrated Human Resource and Payroll Operations Platform built for modern workforce management. It connects the full employee lifecycle—from Employee Master records, historical contracts, and working schedules to real-time attendance, leave allocations, sequenced salary rules, payrun batch wizards, payslip PDF generation, and an operational analytics dashboard.

---

## 🌟 Key Modules & Features

### 1. Unified Employee Hub
- **Multiple Views**: Kanban grid and List view with search, department filtering, and status filtering.
- **Operational Hub Form**: Comprehensive profile view capturing role, department, manager, working schedule, joining date, and banking credentials.
- **Smart-Buttons Navigation**: Real-time counter buttons that link directly to related **Contracts**, **Attendance records**, **Leave Requests**, **Allocations**, and **Payslips**.

### 2. Contract Management & Period-Specific Resolution
- Full historical tracking of contracts across employee tenures.
- **Concurrency Protection**: Business rule validation preventing overlapping active contracts.
- **Period-Specific Matching**: Payruns automatically resolve and apply only the operative contract valid for the designated payroll window.

### 3. Working Schedule Setup
- Weekly pattern builder defining Monday–Sunday start times, end times, and lunch breaks.
- **Automated Calculation**: Automatically computes daily and weekly hours from defined schedule lines rather than relying on manual input.

### 4. Time Off & Leave Balance Consumption
- **Time Off Policies**: Configure units (days/hours), allocation requirement flags, paid/unpaid indicators, and color badges.
- **Allocations**: Manages employee balances with start and end validity periods.
- **Balance Consumption**: Approving a leave request automatically decrements the employee's remaining quota balance.

### 5. Sequenced Salary Rules & Structures
- Multi-tier rule categorization: **BASIC**, **ALLOWANCE**, **GROSS**, **DEDUCTION**, **CONTRIBUTION**, **NET**.
- Sequenced execution respecting mathematical dependencies.
- Flexible calculation algorithms: **Fixed Amount**, **Percentage of Base/Gross**, and **Dynamic Formulas**.

### 6. Payrun Creation Wizard & Processing
- **Two-Step Creation Wizard**:
  - *Step 1: Scope & Period*: Define batch name, pay period start and end dates, and assigned salary structure.
  - *Step 2: Employee Screening*: Queries and filters staff with active contracts valid for the period; lets users select/deselect specific staff or select all.
  - *Step 3: Initialization*: Generates batch and transitions to the Processing Screen.
- **Payrun Processing Workflow**:
  - `Compute Salary`: Executes salary rule engine across all selected employees.
  - `Validate`: Analyzes operational warnings (missing bank details, contract expiration, duplicate payslips).
  - `Mark as Paid`: Finalizes payment, records disbursement timestamps, and archives records.
  - `Send Payslips (Bulk Email)`: Simulates bulk email delivery with delivery logging and telemetry.

### 7. Payslip PDF Generation & Breakdown
- Line-item breakdown displaying Basic salary, allowances, deductions, gross, and net pay.
- Client-side branded **PDF Generator** using `jsPDF` and `jspdf-autotable` with corporate styling, metadata, and signature lines.

### 8. Real-Time Payroll Dashboard
- **Live KPI Cards**: Total Net Salary Paid, Payslips Generated, Average Net Salary, Approved Time Off Days, and Attendance Health %.
- **Interactive Visualizations**:
  - Salary Expenditure by Department (with progress bars and cost breakdown).
  - Monthly Net Salary Trends.
  - Attendance & Shift Health breakdown (Present, Late arrivals, Overtime, Exceptions).
- **Operational Alerts**: Proactively surfaces missing bank details, expiring contracts, pending leave requests, and draft allocations.
- **Multi-dimensional Filters**: Filter dashboard by Pay Period, Department, and Employment Type.

### 9. JWT Authentication & Role-Based Access Control
- **Full JWT Workflow**: Token generation, bcrypt password hashing, 7-day token expiration, and Bearer token verification.
- **Protected Endpoints**: Authorization header injection on all API queries (`Authorization: Bearer <token>`).
- **User Management**: Self-registration, login with email and password, profile retrieval (`/api/auth/me`), and secure token revocation upon sign-out.
- **1-Click Instant Demo Logins**: Modal with pre-configured cards for all 5 roles for immediate evaluation:
  - 👑 **Admin**: `admin@peoplepay360.com` / `password123`
  - 👔 **HR Manager**: `sarah.jenkins@peoplepay360.com` / `password123`
  - 📊 **HR Payroll User**: `david.kim@peoplepay360.com` / `password123`
  - 💼 **HR Payroll Manager**: `elena.rostova@peoplepay360.com` / `password123`
  - 👤 **Employee**: `alex.morgan@peoplepay360.com` / `password123`

### 10. Instant Role Switcher Simulation
Switch between 5 roles from the top navigation bar to test access levels:
1. **Admin**: Unrestricted access to all modules and configurations.
2. **HR Manager**: Full CRUD on HR, schedules, attendance, and leave approvals (no payroll access).
3. **HR Payroll User**: HR Manager rights + Payrun/Payslip processing.
4. **HR Payroll Manager**: Full control over Payruns, Payslips, Salary Structures, and Rules.
5. **Employee**: Self-service profile, attendance clock in/out, and personal leave requests.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas (configured in `backend/.env`)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed:large   # Seeds 400 realistic enterprise employees, contracts, and payslips
npm run start        # Starts backend server on port 3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite frontend on port 5173
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Automated Verification Test Suite

Run the integration test suite covering the 6 business logic rules:
```bash
cd backend
node src/scripts/verifyPlatform.js
```
Expected output: **12 / 12 TESTS PASSED (100%)**.

---

## 🎬 Live Demonstration Scenarios

### Scenario 1: Employee-to-Payslip Workflow
1. Open **Employees** -> click on any employee (e.g. Alex Morgan) to open the **Operational Hub Form**.
2. Inspect the **Smart-Buttons** displaying counts for Contracts, Attendance, Leaves, and Payslips.
3. Navigate to **Payroll** -> click **New Payrun (Wizard)**.
4. **Step 1**: Select *September 2026 Monthly Payroll*, Salary Structure, and date range -> Click **Continue to Employee Selection**.
5. **Step 2**: Review the screened eligible staff with active contracts -> Click **Create Payrun & Open Processing**.
6. On the **Processing Screen**, click **Compute Salary** -> observe rule engine calculating Basic, HRA, Allowances, PF, Tax, and Net.
7. Click **Validate Batch** -> observe system warnings check.
8. Click **Mark as Paid** -> status transitions to `PAID`.
9. Click **PDF** on any payslip to generate a branded PDF document.
10. Click **Send Payslips (Bulk Email)** to dispatch simulated email notifications.

### Scenario 2: Leave Allocation & Request Workflow
1. Navigate to **Time Off** -> **Leave Requests**.
2. Click **Request Time Off** -> submit a request for an employee (e.g. 2 days).
3. Under **Pending Approval**, click **Approve**.
4. Switch to **Balance Allocations** tab and observe that the employee's remaining quota balance has been automatically decremented by 2 days.
