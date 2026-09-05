# PeoplePay360: Integrated HR & Payroll Operations Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Connected-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT Auth](https://img.shields.io/badge/JWT-Protected-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-12%2F12%20Passing%20(100%25)-brightgreen)]()

**PeoplePay360** is an enterprise-grade, full-lifecycle Human Resource and Payroll Operations platform built for hackathon evaluation. It connects employee master records, historical employment contracts, dynamic working schedules, real-time shift attendance, leave allocations, sequenced salary rules, payrun creation wizards, PDF payslip generation, and an operational analytics dashboard.

---

## 📑 Table of Contents

1. [Project Highlights](#-project-highlights)
2. [400-Employee Enterprise Dataset](#-400-employee-enterprise-dataset)
3. [JWT Authentication & Pre-Seeded User Accounts](#-jwt-authentication--pre-seeded-user-accounts)
4. [Architecture & Core Business Logic](#-architecture--core-business-logic)
   - [Unified Employee Hub & Smart Buttons](#1-unified-employee-hub--smart-buttons)
   - [Contract Management & Period-Specific Resolution](#2-contract-management--period-specific-resolution)
   - [Working Schedules & Automated Hours Calculation](#3-working-schedules--automated-hours-calculation)
   - [Time Off Quotas & Balance Consumption](#4-time-off-quotas--balance-consumption)
   - [Sequenced Salary Rules & Multi-Category Engine](#5-sequenced-salary-rules--multi-category-engine)
   - [Two-Step Payrun Creation Wizard & Processing](#6-two-step-payrun-creation-wizard--processing)
   - [Payslip PDF Generation & Bulk Email Telemetry](#7-payslip-pdf-generation--bulk-email-telemetry)
   - [Real-Time Payroll Analytics Dashboard](#8-real-time-payroll-analytics-dashboard)
5. [REST API Endpoints Reference](#-rest-api-endpoints-reference)
6. [Quick Start Guide](#-quick-start-guide)
7. [Automated Test Suite](#-automated-test-suite)
8. [Live Demonstration Scenarios](#-live-demonstration-scenarios)
9. [Future Roadmap](#-future-roadmap)

---

## 🌟 Project Highlights

- **Connected Operational Flow**: The employee record acts as the central hub, linking directly to historical contracts, attendance logs, time-off balances, and payslips via interactive smart-buttons.
- **Period-Specific Contract Engine**: Payruns automatically resolve and bind only the operative contract valid for the designated payroll window.
- **Automated Schedule Calculation**: Schedules dynamically compute daily and weekly working hours from shift patterns (Monday–Sunday) without manual input.
- **Leave Balance Consumption**: Approving a leave request immediately consumes and decrements the employee's remaining quota allocation.
- **Multi-Category Salary Sequencer**: Evaluates rules in mathematical sequence (`Basic` -> `Allowances` -> `Gross` -> `Deductions` -> `Net`) supporting Fixed, Percentage, and Formula calculations.
- **Two-Step Payrun Wizard**: Wizard filters staff with active period contracts, verifies bank details, and initializes batches with pre-validation warnings.
- **Client-Side PDF Generator**: Generates print-ready branded employee payslips using `jsPDF` and `jspdf-autotable`.
- **Instant Role Switcher Simulation**: Toggle on the fly between **Admin**, **HR Manager**, **HR Payroll User**, **HR Payroll Manager**, and **Employee** with dynamically adapting permissions.

---

## 👥 400-Employee Enterprise Dataset

The database is pre-seeded with **400 employees** and their complete operational records:

| Data Entity | Records Count | Details & Attributes |
| :--- | :---: | :--- |
| **Employees** | **400** | Realistic first & last names, corporate emails, phone numbers, departments, job titles, joining dates (2021–2026), and bank accounts. |
| **Active Contracts** | **400** | Tiered wages (\$4,500 – \$18,000/mo), wage types, references (`CNT-2024-0001` to `CNT-2024-0400`), assigned structures, and schedules. |
| **Working Schedules** | **3** | Standard 40h Office Schedule, Flexible Tech 35h, and Part-Time 20h. |
| **Leave Allocations** | **800** | 400 Annual PTO Grants (20 days) + 400 Sick Leave Grants (10 days) with taken/remaining balance tracking. |
| **Leave Requests** | **98** | Approved leaves (consumed from quotas) and Pending requests for workflow approval demos. |
| **Attendance Logs** | **360** | Multi-day shifts featuring Present, Late arrivals, Overtime, Missing check-outs, and manual audit corrections. |
| **Historical Payslips** | **400** | August 2026 Batch totaling **\$4,181,436.00** net salary. |
| **User Accounts** | **5** | Pre-seeded JWT user accounts for all 5 roles with hashed passwords (`password123`). |

### Department Headcount Distribution
- **Engineering**: 128 staff *(Lead Architects, Senior Full Stack, DevOps, QA Automation)*
- **Sales**: 88 staff *(Enterprise Account Execs, Sales Directors, Account Reps)*
- **Operations**: 72 staff *(Operations Directors, Logistics Analysts, Supply Chain Leads)*
- **Customer Support**: 48 staff *(Support Leads, Customer Success Managers, Implementation Consultants)*
- **Finance**: 32 staff *(Senior Financial Analysts, Payroll Directors, Staff Accountants)*
- **Human Resources**: 32 staff *(VPs of People, Talent Acquisition Leads, HR Business Partners)*

---

## 🔐 JWT Authentication & Pre-Seeded User Accounts

Authentication uses signed JWT tokens (7-day validity) and bcrypt password hashing. All API routes require Bearer token authorization (`Authorization: Bearer <token>`).

### Pre-Configured Test Accounts (Password: `password123`)

| Role | User Name | Email Address | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** | Admin User | `admin@peoplepay360.com` | Unrestricted platform access across all HR, Payroll, and Configuration modules. |
| 👔 **HR Manager** | Sarah Jenkins | `sarah.jenkins@peoplepay360.com` | Full CRUD on Employees, Contracts, Schedules, Attendance, and Leaves. Payroll access restricted. |
| 📊 **HR Payroll User** | David Kim | `david.kim@peoplepay360.com` | HR Manager permissions + Payruns and Payslips processing. Read-only on structures. |
| 💼 **HR Payroll Manager** | Elena Rostova | `elena.rostova@peoplepay360.com` | Full control over Payruns, Payslips, Salary Structures, and Rules sequencing. |
| 👤 **Employee** | Alex Morgan | `alex.morgan@peoplepay360.com` | Self-service portal: view personal profile, attendance clock in/out, view leave balances and submit requests. |

> **Evaluator Tip**: In the UI, click **Sign In** to view **1-Click Instant Demo Login Cards** for each role, or use the top-right **Role Switcher** to switch roles on the fly without re-authenticating.

---

## 🏗️ Architecture & Core Business Logic

### 1. Unified Employee Hub & Smart Buttons
- **Kanban & List Views**: Search across name, employee ID, title, and email with instant department filtering.
- **Operational Hub Form**: Centralizes identity, department, manager, schedule, joining date, and direct-deposit banking details (Bank name, Account number, IFSC/Routing).
- **Smart-Buttons**: Display real-time badge counts linking directly to:
  - Related Contracts
  - Related Attendance Logs
  - Related Leave Requests
  - Related Quota Allocations
  - Related Payslips

### 2. Contract Management & Period-Specific Resolution
- **Historical Audit Trail**: Retains initial and expired contracts to preserve historical compensation records.
- **Concurrency Validation**: Prevents overlapping active contracts for the same employee.
- **Period-Specific Resolution**: `findApplicableContract(employeeId, periodStart, periodEnd)` identifies only the operative contract valid for that specific payroll date range.

### 3. Working Schedules & Automated Hours Calculation
- Define shift lines by Day of Week (`MONDAY` - `SUNDAY`), Start Time (`09:00`), End Time (`18:00`), and Break Hours (`1.0h`).
- **Dynamic Math Engine**: Calculates daily hours (`(End - Start) - Break`) and sums total weekly hours automatically on save.

### 4. Time Off Quotas & Balance Consumption
- **Custom Leave Policies**: Configurable units (`DAYS` or `HOURS`), quota allocation requirement flag, paid/unpaid status, and color tags.
- **Balance Consumption**: Approving a leave request automatically decrements the employee's active quota balance (`remainingUnits = allocatedUnits - takenUnits`). Insufficient balance prevents request creation.

### 5. Sequenced Salary Rules & Multi-Category Engine
Rules execute in strict mathematical sequence respecting dependencies:
1. **Basic Salary** (`seq: 1`): Contract base wage.
2. **HRA** (`seq: 10`): 40% of Basic wage.
3. **Conveyance Allowance** (`seq: 20`): Fixed \$250.
4. **Special Allowance** (`seq: 30`): Fixed \$400.
5. **Medical Allowance** (`seq: 40`): Fixed \$150.
6. **Gross Salary** (`seq: 900`): Basic + Total Allowances.
7. **Provident Fund (PF)** (`seq: 60`): 12% of Basic.
8. **Income Tax** (`seq: 70`): 10% of Gross Salary.
9. **Health Insurance** (`seq: 80`): Fixed \$120.
10. **Net Salary** (`seq: 1000`): Gross - Total Deductions.

### 6. Two-Step Payrun Creation Wizard & Processing
- **Step 1 (Scope & Period)**: Define Payrun Name, Salary Structure, and Period Start/End dates.
- **Step 2 (Employee Screening)**: Queries active employees with contracts valid for the period; lets users select/deselect specific staff or select all.
- **Processing Actions**:
  - `Compute Salary`: Evaluates salary rules and generates payslip lines.
  - `Validate Batch`: Surfaces operational warnings (missing bank details, contract expiration, duplicate payslips, negative pay).
  - `Mark as Paid`: Transitions batch status to `PAID`, stamps payment timestamps, and archives historical records.
  - `Send Payslips (Bulk Email)`: Simulates bulk email delivery with delivery logging.

### 7. Payslip PDF Generation & Bulk Email Telemetry
- Complete breakdown showing Basic, Allowances, Deductions, Gross, and Net amounts.
- **Downloadable Branded PDF**: Generates client-side formatted PDF documents using `jsPDF` and `jspdf-autotable` with corporate branding, metadata, and signature lines.

### 8. Real-Time Payroll Analytics Dashboard
- **Live KPIs**: Total Net Salary Paid, Total Gross Commitment, Total Deductions, Payslips Generated, Average Net Salary, Approved Leave Days, and Attendance Health %.
- **Visual Analytics**:
  - Salary Expenditure by Department (with progress bars and cost breakdown).
  - Attendance & Shift Health distribution (Present, Late arrivals, Overtime, Exceptions).
  - Department Headcount, Active Contracts, and Average Wage overview table.
- **Operational Alerts Banner**: Proactively flags missing bank details, expiring contracts, and pending approvals.
- **Filters**: Filter dashboard metrics by Pay Period, Department, and Employment Type.

---

## 📡 REST API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Sign in with email and password (returns JWT).
- `POST /api/auth/demo-login` — 1-Click login for any role (`ADMIN`, `HR_MANAGER`, etc.).
- `GET /api/auth/me` — Get current authenticated user profile (JWT protected).
- `GET /api/auth/roles` — Get available roles and descriptions.

### Employees (`/api/employees`)
- `GET /api/employees` — List employees with search and department filters.
- `GET /api/employees/:id` — Get employee details with smart-button counts.
- `POST /api/employees` — Create employee record.
- `PUT /api/employees/:id` — Update employee record.
- `DELETE /api/employees/:id` — Delete employee record.

### Contracts (`/api/contracts`)
- `GET /api/contracts` — List contracts with employee, structure, and schedule details.
- `POST /api/contracts` — Create contract with concurrency validation.
- `PUT /api/contracts/:id` — Update contract.
- `DELETE /api/contracts/:id` — Delete contract.

### Working Schedules (`/api/schedules`)
- `GET /api/schedules` — List schedules with calculated weekly hours.
- `POST /api/schedules` — Create schedule (auto-calculates hours).
- `PUT /api/schedules/:id` — Update schedule (recalculates hours).

### Attendance (`/api/attendance`)
- `GET /api/attendance` — List attendance logs.
- `GET /api/attendance/stats` — Overall presence and health metrics.
- `POST /api/attendance/clock-in` — Employee clock in.
- `POST /api/attendance/clock-out` — Employee clock out.
- `PUT /api/attendance/:id/correct` — Authorized manual correction with mandatory audit reason.

### Time Off (`/api/timeoff`)
- `GET /api/timeoff/types` — List leave policy types.
- `POST /api/timeoff/types` — Create leave policy type.
- `GET /api/timeoff/allocations` — List quota allocations.
- `POST /api/timeoff/allocations` — Create quota allocation grant.
- `PUT /api/timeoff/allocations/:id/approve` — Approve quota grant.
- `GET /api/timeoff/requests` — List leave requests.
- `POST /api/timeoff/requests` — Submit request (verifies balance).
- `PUT /api/timeoff/requests/:id/approve` — Approve request (automatically decrements allocation balance).
- `PUT /api/timeoff/requests/:id/refuse` — Refuse request with reason.

### Payruns & Payslips (`/api/payruns`, `/api/payslips`)
- `GET /api/payruns/eligible-employees` — Query eligible staff for Wizard Step 2.
- `GET /api/payruns` — List payrun batches.
- `GET /api/payruns/:id` — Get payrun with populated payslips and warnings.
- `POST /api/payruns` — Create payrun batch.
- `POST /api/payruns/:id/compute` — Execute salary rule engine for all batch staff.
- `POST /api/payruns/:id/validate` — Validate warnings and lock batch.
- `POST /api/payruns/:id/mark-paid` — Finalize payment and stamp paid date.
- `POST /api/payruns/:id/send-emails` — Dispatch bulk payslip notifications.
- `GET /api/payslips` — List payslips.
- `GET /api/payslips/:id` — Get payslip detail with rule line items.

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard` — Live aggregated KPIs, department breakdown, attendance health, and alerts (supports `period`, `department`, `employeeType` filters).

### Seeder (`/api/seed`)
- `POST /api/seed/run` — Re-seed database with enterprise dataset.

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
npm start            # Starts backend on http://127.0.0.1:3000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Starts Vite on http://localhost:5173
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Automated Test Suite

Run the platform integration test suite covering all 6 core business rules:
```bash
cd backend
node src/scripts/verifyPlatform.js
```

### Verification Output:
```
==================================================
   PEOPLEPAY360 PLATFORM INTEGRATION TEST SUITE   
==================================================
✓ MongoDB Atlas Connection Verified

--- TEST 1: Working Schedule Auto Weekly Hours Calculation ---
✓ PASS: Working schedule calculated weekly hours correctly (expected 15, got 15)

--- TEST 2: Salary Rule Engine Sequenced Computation ---
✓ PASS: Basic Salary is 5000 (got 5000)
✓ PASS: Gross Salary is 7200 (got 7200)
✓ PASS: Total Deductions are 1320 (got 1320)
✓ PASS: Net Salary is 5880 (got 5880)
✓ PASS: Full line items generated including GROSS and NET summaries (count: 7)

--- TEST 3: Period-Specific Contract Selection ---
✓ PASS: Sample employee (EMP-0001) exists in database
✓ PASS: Found active contract for August 2026 period (CNT-2024-0001)
✓ PASS: Contract wage is valid ($8000)

--- TEST 4: Concurrency Check (No Overlapping Active Contracts) ---
✓ PASS: Blocked creation of overlapping active contract: Employee already has an active contract overlapping with specified dates.

--- TEST 5: Leave Request Balance Consumption Workflow ---
✓ PASS: Leave balance deducted correctly (before: 20, after: 18)

--- TEST 6: Operational Payroll Warnings Detection ---
✓ PASS: Detected MISSING_BANK_DETAILS warning for employee (EMP-0045) without account number

==================================================
   TEST RESULTS: 12 / 12 TESTS PASSED (100%)
==================================================
```

---

## 🎬 Live Demonstration Scenarios

### Scenario 1: Employee-to-Payslip Workflow
1. Navigate to **Employees** -> click on any employee to open the **Operational Hub Form**.
2. Click the **Smart-Buttons** (Contracts, Attendance, Leave Requests, Payslips).
3. Navigate to **Payroll** -> click **New Payrun (Wizard)**.
4. **Step 1 (Scope)**: Select salary structure, period start, and period end -> click **Continue to Employee Selection**.
5. **Step 2 (Screening)**: Review screened eligible staff with active contracts -> click **Create Payrun & Open Processing**.
6. On the **Processing Screen**, click **Compute Salary** -> observe rule engine calculating Basic, HRA, Allowances, PF, Tax, Gross, and Net.
7. Click **Validate Batch** -> observe system warnings check.
8. Click **Mark as Paid** -> status transitions to `PAID`.
9. Click **PDF** on any payslip to generate the printable PDF document.
10. Click **Send Payslips (Bulk Email)** to dispatch simulated email notifications.

### Scenario 2: Leave Allocation & Balance Consumption
1. Navigate to **Time Off** -> **Leave Requests**.
2. Click **Request Time Off** -> submit a request for an employee (e.g. 2 days).
3. Under **Pending Approval**, click **Approve**.
4. Switch to **Balance Allocations** tab and observe that the employee's remaining quota balance has been automatically decremented by 2 days.

### Scenario 3: Role Switching & Permissions
1. Use the **Role Switcher** in the top bar to switch to **Employee**.
2. Notice that payroll processing features and salary structures are hidden, and the employee can only access self-service profile, attendance terminal, and leave requests.
3. Switch to **HR Manager** to observe full access to Employee CRUD, contracts, and leave approvals, with payroll execution restricted.
4. Switch to **Admin** or **HR Payroll Manager** to restore full configuration and processing access.

---

## 🔮 Future Roadmap

1. **Automated Tax Slabs**: Progressive tax brackets based on localized jurisdictions (state/federal tax brackets).
2. **Biometric Hardware Integration**: Webhook/MQTT ingestion pipeline connecting directly to physical RFID turnstiles.
3. **Multi-Currency Payroll**: Support for international remote teams with currency conversion rates locked at payrun initialization.
4. **Expense Claims Integration**: Employee expense submission and receipt OCR scanning that rolls reimbursement directly into the payrun.

---

## 📄 License
This project was created for the PeoplePay360 Hackathon. Licensed under the ISC License.
