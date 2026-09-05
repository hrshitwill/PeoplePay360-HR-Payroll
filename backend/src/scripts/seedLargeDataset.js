const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/../../.env" });

const Employee = require("../models/Employee");
const Contract = require("../models/Contract");
const WorkingSchedule = require("../models/WorkingSchedule");
const TimeOffType = require("../models/TimeOffType");
const TimeOffAllocation = require("../models/TimeOffAllocation");
const TimeOffRequest = require("../models/TimeOffRequest");
const Attendance = require("../models/Attendance");
const SalaryRule = require("../models/SalaryRule");
const SalaryStructure = require("../models/SalaryStructure");
const Payrun = require("../models/Payrun");
const Payslip = require("../models/Payslip");
const User = require("../models/User");
const { calculateSalary } = require("../services/salaryRuleEngine");

// Realistic name pools
const FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
    "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
    "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra",
    "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah",
    "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon", "Jeffrey", "Laura", "Ryan", "Cynthia",
    "Jacob", "Kathleen", "Gary", "Amy", "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen",
    "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Alexander", "Debra", "Patrick", "Rachel",
    "Frank", "Catherine", "Raymond", "Carolyn", "Jack", "Janet", "Dennis", "Ruth", "Jerry", "Maria",
    "Tyler", "Heather", "Aaron", "Diane", "Jose", "Virginia", "Adam", "Julie", "Henry", "Joyce",
    "Nathan", "Victoria", "Douglas", "Olivia", "Zachary", "Kelly", "Peter", "Christina", "Kyle", "Lauren",
    "Walter", "Joan", "Ethan", "Evelyn", "Jeremy", "Judith", "Harold", "Megan", "Keith", "Cheryl",
    "Christian", "Andrea", "Roger", "Hannah", "Noah", "Martha", "Gerald", "Jacqueline", "Carl", "Frances",
    "Terry", "Ann", "Sean", "Kathryn", "Arthur", "Gloria", "Austin", "Teresa", "Carl", "Sara",
    "Lawrence", "Janice", "Dylan", "Marie", "Jesse", "Julia", "Jordan", "Grace", "Bryan", "Judy",
    "Billy", "Theresa", "Joe", "Beverly", "Bruce", "Denise", "Gabriel", "Marilyn", "Logan", "Amber",
    "Albert", "Danielle", "Willie", "Rose", "Alan", "Brittany", "Juan", "Diana", "Wayne", "Abigail",
    "Elijah", "Jane", "Randy", "Natalie", "Roy", "Lori", "Vincent", "Alexis", "Ralph", "Tiffany",
    "Eugene", "Kayla", "Russell", "Charlotte", "Bobby", "Chloe", "Mason", "Alice", "Philip", "Bella",
    "Louis", "Florence", "Victor", "Vera", "Martin", "Wendy", "Oliver", "Alice", "Lucas", "Claire",
    "Priya", "Arjun", "Ananya", "Rohan", "Sneha", "Vikram", "Aarav", "Meera", "Aditya", "Neha",
    "Kavita", "Sanjay", "Deepak", "Pooja", "Rajesh", "Sunita", "Amit", "Geeta", "Manoj", "Shweta",
    "Wei", "Li", "Zhang", "Chen", "Wang", "Liu", "Yang", "Huang", "Zhao", "Wu",
    "Mateo", "Santiago", "Sofia", "Valentina", "Camila", "Lucia", "Alejandro", "Carlos", "Diego", "Elena"
];

const LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts",
    "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker", "Cruz", "Edwards", "Collins", "Reyes",
    "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper",
    "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza", "Ruiz", "Hughes",
    "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers", "Long", "Ross", "Foster", "Jimenez",
    "Powell", "Jenkins", "Perry", "Russell", "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes",
    "Gonzales", "Fisher", "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander", "Hamilton", "Graham",
    "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole", "Hayes", "Bryant", "Herrera", "Gibson",
    "Ellis", "Tran", "Medina", "Aguilar", "Stevens", "Murray", "Ford", "Castro", "Marshall", "Owens",
    "Harrison", "Fernandez", "McDonald", "Woods", "Washington", "Kennedy", "Wells", "Vargas", "Henry", "Chen"
];

const DEPARTMENTS = [
    { name: "Engineering", weight: 0.32, titles: ["Lead Architect", "Senior Full Stack Engineer", "Backend Developer", "Frontend Engineer", "DevOps Engineer", "QA Automation Engineer", "Data Engineer", "Engineering Manager"] },
    { name: "Sales", weight: 0.22, titles: ["Enterprise Account Executive", "Account Representative", "Sales Development Rep", "Sales Director", "Regional Sales Manager", "Solutions Engineer"] },
    { name: "Operations", weight: 0.18, titles: ["Operations Director", "Operations Coordinator", "Logistics Analyst", "Supply Chain Lead", "Facility Supervisor", "Procurement Specialist"] },
    { name: "Customer Support", weight: 0.12, titles: ["Support Lead", "Customer Success Manager", "Technical Support Specialist", "Implementation Consultant", "Client Onboarding Rep"] },
    { name: "Finance", weight: 0.08, titles: ["Senior Financial Analyst", "Payroll Operations Director", "Staff Accountant", "Finance Controller", "Billing Specialist"] },
    { name: "Human Resources", weight: 0.08, titles: ["VP of People", "Head of Talent Acquisition", "HR Business Partner", "People Operations Specialist", "Corporate Recruiter"] }
];

const BANKS = ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "Silicon Valley Bank", "Capital One", "Barclays", "HSBC"];

const seedLargeDataset = async () => {
    try {
        console.log("==================================================");
        console.log("   PEOPLEPAY360 120-EMPLOYEE ENTERPRISE SEEDER   ");
        console.log("==================================================");

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB Atlas: peoplepayy");

        // Clear existing collections
        console.log("Purging existing records...");
        await Promise.all([
            Employee.deleteMany({}),
            Contract.deleteMany({}),
            WorkingSchedule.deleteMany({}),
            TimeOffType.deleteMany({}),
            TimeOffAllocation.deleteMany({}),
            TimeOffRequest.deleteMany({}),
            Attendance.deleteMany({}),
            SalaryRule.deleteMany({}),
            SalaryStructure.deleteMany({}),
            Payrun.deleteMany({}),
            Payslip.deleteMany({}),
            User.deleteMany({})
        ]);

        // 1. Working Schedules
        console.log("1/7 Creating Working Schedules...");
        const scheduleStandard = new WorkingSchedule({
            name: "Standard 40h Schedule",
            type: "STANDARD",
            description: "Monday to Friday 9:00 AM to 6:00 PM with 1 hour lunch break",
            totalWeeklyHours: 40,
            lines: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map((day) => ({
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "18:00",
                breakHours: 1,
                dailyHours: 8
            }))
        });
        await scheduleStandard.save();

        const scheduleFlex = new WorkingSchedule({
            name: "Flexible Tech 35h Schedule",
            type: "FLEXIBLE",
            description: "Monday to Friday 10:00 AM to 6:00 PM with 1 hour break",
            totalWeeklyHours: 35,
            lines: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"].map((day) => ({
                dayOfWeek: day,
                startTime: "10:00",
                endTime: "18:00",
                breakHours: 1,
                dailyHours: 7
            }))
        });
        await scheduleFlex.save();

        const schedulePartTime = new WorkingSchedule({
            name: "Part-Time 20h Schedule",
            type: "PART_TIME",
            description: "Monday to Thursday 9:00 AM to 2:00 PM",
            totalWeeklyHours: 20,
            lines: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"].map((day) => ({
                dayOfWeek: day,
                startTime: "09:00",
                endTime: "14:00",
                breakHours: 0,
                dailyHours: 5
            }))
        });
        await schedulePartTime.save();

        // 2. Salary Rules
        console.log("2/7 Creating Sequenced Salary Rules...");
        const ruleBasic = await SalaryRule.create({
            name: "Basic Salary",
            code: "BASIC",
            sequence: 1,
            category: "BASIC",
            type: "EARNING",
            calculationType: "FIXED",
            description: "Fundamental contractual base wage"
        });

        const ruleHra = await SalaryRule.create({
            name: "House Rent Allowance (HRA)",
            code: "HRA",
            sequence: 10,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "PERCENTAGE",
            percentage: 40,
            percentageOf: "BASE",
            description: "40% of base salary housing subsidy"
        });

        const ruleConv = await SalaryRule.create({
            name: "Conveyance Allowance",
            code: "CONV",
            sequence: 20,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 250,
            description: "Fixed monthly transit and commute stipend"
        });

        const ruleSplAlw = await SalaryRule.create({
            name: "Special Allowance",
            code: "SPL_ALW",
            sequence: 30,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 400,
            description: "Role responsibility allowance"
        });

        const ruleMedAlw = await SalaryRule.create({
            name: "Medical Allowance",
            code: "MED_ALW",
            sequence: 40,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 150,
            description: "Outpatient healthcare stipend"
        });

        const rulePerfBonus = await SalaryRule.create({
            name: "Performance Bonus",
            code: "PERF_BONUS",
            sequence: 50,
            category: "ALLOWANCE",
            type: "EARNING",
            calculationType: "FIXED",
            amount: 500,
            description: "Monthly performance achievement award"
        });

        const rulePf = await SalaryRule.create({
            name: "Provident Fund (PF)",
            code: "PF",
            sequence: 60,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "PERCENTAGE",
            percentage: 12,
            percentageOf: "BASE",
            description: "12% statutory employee retirement contribution"
        });

        const ruleTax = await SalaryRule.create({
            name: "Income Tax Withholding",
            code: "TAX",
            sequence: 70,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "PERCENTAGE",
            percentage: 10,
            percentageOf: "GROSS",
            description: "10% estimated tax deduction on gross earnings"
        });

        const ruleHealthIns = await SalaryRule.create({
            name: "Health Insurance Premium",
            code: "HEALTH_INS",
            sequence: 80,
            category: "DEDUCTION",
            type: "DEDUCTION",
            calculationType: "FIXED",
            amount: 120,
            description: "Corporate group medical coverage"
        });

        // 3. Salary Structures
        console.log("3/7 Creating Salary Structures...");
        const regularStructure = await SalaryStructure.create({
            name: "Regular Corporate Structure",
            code: "REG_CORP_2026",
            description: "Standard salaried package (Basic + HRA + Conveyance + Special + PF + Tax + Insurance)",
            rules: [ruleBasic._id, ruleHra._id, ruleConv._id, ruleSplAlw._id, ruleMedAlw._id, rulePf._id, ruleTax._id, ruleHealthIns._id]
        });

        const executiveStructure = await SalaryStructure.create({
            name: "Executive & Management Structure",
            code: "EXEC_2026",
            description: "Executive package with Performance Bonus and High Tier Allowances",
            rules: [ruleBasic._id, ruleHra._id, ruleSplAlw._id, rulePerfBonus._id, rulePf._id, ruleTax._id, ruleHealthIns._id]
        });

        const contractorStructure = await SalaryStructure.create({
            name: "Consultant / Contractor Structure",
            code: "CONTRACTOR_2026",
            description: "Direct hourly/monthly compensation with statutory tax",
            rules: [ruleBasic._id, ruleTax._id]
        });

        // 4. Time Off Types
        console.log("4/7 Creating Time Off Policies...");
        const ptoType = await TimeOffType.create({
            name: "Paid Time Off (PTO)",
            code: "PTO",
            unit: "DAYS",
            requiresAllocation: true,
            isPaid: true,
            color: "#2563EB",
            description: "Annual personal and vacation leave"
        });

        const sickType = await TimeOffType.create({
            name: "Sick Leave",
            code: "SICK",
            unit: "DAYS",
            requiresAllocation: true,
            isPaid: true,
            color: "#DC2626",
            description: "Health and medical recovery time off"
        });

        const unpaidType = await TimeOffType.create({
            name: "Unpaid Leave",
            code: "UNPAID",
            unit: "DAYS",
            requiresAllocation: false,
            isPaid: false,
            color: "#6B7280",
            description: "Authorized absence without pay"
        });

        // 5. Generate 120 Employees
        console.log("5/7 Generating 120 Employees...");
        const TOTAL_EMPLOYEES = 120;
        const employeeDocs = [];

        // Track used emails to guarantee uniqueness
        const usedEmails = new Set();

        for (let i = 1; i <= TOTAL_EMPLOYEES; i++) {
            const firstName = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
            const lastName = LAST_NAMES[(i * 11) % LAST_NAMES.length];

            let emailPrefix = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
            if (usedEmails.has(emailPrefix)) {
                emailPrefix = `${emailPrefix}${i}`;
            }
            usedEmails.add(emailPrefix);
            const email = `${emailPrefix}@peoplepay360.com`;

            // Pick department based on distribution
            const rand = Math.random();
            let cum = 0;
            let chosenDept = DEPARTMENTS[0];
            for (const d of DEPARTMENTS) {
                cum += d.weight;
                if (rand <= cum) {
                    chosenDept = d;
                    break;
                }
            }

            const title = chosenDept.titles[i % chosenDept.titles.length];
            const empType = i % 10 === 0 ? "CONTRACT" : i % 15 === 0 ? "PART_TIME" : "FULL_TIME";
            const scheduleId = empType === "PART_TIME" ? schedulePartTime._id : chosenDept.name === "Engineering" ? scheduleFlex._id : scheduleStandard._id;

            // Complete bank direct deposit details for all staff
            const bankName = BANKS[i % BANKS.length];
            const accNum = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
            const ifsc = `${bankName.slice(0, 4).toUpperCase()}US33XXX`;

            const year = 2021 + (i % 5);
            const month = (i % 12) + 1;
            const day = (i % 28) + 1;

            employeeDocs.push({
                employeeId: `EMP-${String(i).padStart(4, "0")}`,
                firstName,
                lastName,
                email,
                phone: `+1 (555) ${String(100 + (i % 900))}-${String(1000 + (i % 9000))}`,
                department: chosenDept.name,
                jobTitle: title,
                employmentType: empType,
                joiningDate: new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`),
                status: "ACTIVE",
                workingSchedule: scheduleId,
                bankDetails: {
                    bankName,
                    accountNumber: accNum,
                    ifscRouting: ifsc,
                    accountHolderName: `${firstName} ${lastName}`
                },
                address: `${100 + (i % 800)} Market Street, San Francisco, CA`
            });
        }

        // Insert employees in chunks of 100
        console.log("   -> Inserting 120 employee records into MongoDB...");
        const insertedEmployees = await Employee.insertMany(employeeDocs);
        console.log(`   ✓ Successfully inserted ${insertedEmployees.length} employees!`);

        // 6. Contracts, Leave Allocations & Requests for 400 Employees
        console.log("6/7 Generating Contracts, Leave Allocations, and Requests...");
        const contractDocs = [];
        const allocationDocs = [];
        const requestDocs = [];

        for (let i = 0; i < insertedEmployees.length; i++) {
            const emp = insertedEmployees[i];
            const isExecutive = emp.jobTitle.includes("Director") || emp.jobTitle.includes("VP") || emp.jobTitle.includes("Lead");
            const isContractor = emp.employmentType === "CONTRACT";

            // Salary tiered realistically: Execs $12k-$18k, Senior $7k-$11k, Mid/Junior $4k-$6.5k
            let salary = 4500 + (i % 12) * 350;
            if (isExecutive) salary = 12000 + (i % 6) * 1000;
            else if (emp.jobTitle.includes("Senior") || emp.jobTitle.includes("Manager")) salary = 8000 + (i % 8) * 500;

            const structureId = isContractor
                ? contractorStructure._id
                : isExecutive
                ? executiveStructure._id
                : regularStructure._id;

            // Give a few contracts an expiration date within 25 days to trigger operational alert!
            const expiringSoon = i === 12 || i === 88 || i === 150 || i === 240;
            const endDate = expiringSoon ? new Date(Date.now() + (10 + (i % 15)) * 24 * 60 * 60 * 1000) : null;

            contractDocs.push({
                contractReference: `CNT-2024-${String(i + 1).padStart(4, "0")}`,
                employee: emp._id,
                contractType: emp.employmentType,
                jobPosition: emp.jobTitle,
                department: emp.department,
                startDate: new Date("2024-01-01"),
                endDate,
                salary,
                wageType: "MONTHLY",
                salaryStructure: structureId,
                workingSchedule: emp.workingSchedule,
                status: emp.status === "ACTIVE" ? "ACTIVE" : "EXPIRED",
                notes: "Annual operative employment agreement"
            });

            // Leave Allocations for every employee
            allocationDocs.push({
                name: "2026 Annual PTO Quota",
                employee: emp._id,
                timeOffType: ptoType._id,
                allocatedUnits: 20,
                takenUnits: i % 7,
                remainingUnits: 20 - (i % 7),
                validityStartDate: new Date("2026-01-01"),
                validityEndDate: new Date("2026-12-31"),
                status: "APPROVED",
                approvedBy: "HR Manager"
            });

            allocationDocs.push({
                name: "2026 Sick Leave Quota",
                employee: emp._id,
                timeOffType: sickType._id,
                allocatedUnits: 10,
                takenUnits: i % 4,
                remainingUnits: 10 - (i % 4),
                validityStartDate: new Date("2026-01-01"),
                validityEndDate: new Date("2026-12-31"),
                status: "APPROVED",
                approvedBy: "HR Manager"
            });

            // Leave requests for a sample of employees (both approved & pending)
            if (i % 5 === 0) {
                requestDocs.push({
                    employee: emp._id,
                    timeOffType: ptoType._id,
                    startDate: new Date("2026-08-10"),
                    endDate: new Date("2026-08-12"),
                    duration: 3,
                    reason: "Family travel & rest",
                    status: "APPROVED",
                    approvedBy: "Sarah Jenkins",
                    approvalDate: new Date("2026-08-01")
                });
            } else if (i % 18 === 0) {
                requestDocs.push({
                    employee: emp._id,
                    timeOffType: ptoType._id,
                    startDate: new Date("2026-09-20"),
                    endDate: new Date("2026-09-22"),
                    duration: 2,
                    reason: "Upcoming personal wellness day",
                    status: "PENDING"
                });
            }
        }

        console.log("   -> Inserting contracts in chunks...");
        await Contract.insertMany(contractDocs);
        console.log(`   ✓ Successfully inserted ${contractDocs.length} contracts!`);

        console.log("   -> Inserting leave allocations and requests...");
        await TimeOffAllocation.insertMany(allocationDocs);
        await TimeOffRequest.insertMany(requestDocs);
        console.log(`   ✓ Inserted ${allocationDocs.length} allocations and ${requestDocs.length} leave requests!`);

        // 7. Attendance Records (Sample shifts for presence metrics)
        console.log("7/7 Generating Multi-Day Attendance Records...");
        const attendanceDocs = [];
        const today = new Date();

        // Generate 3 days of attendance across the first 120 employees
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            const shiftDate = new Date(today);
            shiftDate.setDate(shiftDate.getDate() - dayOffset);
            shiftDate.setHours(0, 0, 0, 0);

            for (let i = 0; i < Math.min(insertedEmployees.length, 120); i++) {
                const emp = insertedEmployees[i];
                let status = "PRESENT";
                let workedHours = 8;
                let checkIn = new Date(shiftDate);
                checkIn.setHours(9, 0, 0);
                let checkOut = new Date(shiftDate);
                checkOut.setHours(17, 30, 0);

                if (i % 11 === 0 && dayOffset === 1) {
                    status = "LATE";
                    checkIn.setHours(10, 30, 0);
                    workedHours = 7;
                } else if (i % 14 === 0 && dayOffset === 2) {
                    status = "OVERTIME";
                    checkOut.setHours(20, 0, 0);
                    workedHours = 10.5;
                } else if (i % 25 === 0 && dayOffset === 0) {
                    status = "MISSING_CHECKOUT";
                    checkOut = null;
                    workedHours = 0;
                }

                attendanceDocs.push({
                    employee: emp._id,
                    date: shiftDate,
                    checkIn,
                    checkOut,
                    workedHours,
                    status,
                    isManuallyCorrected: i === 5 && dayOffset === 2,
                    correctionReason: i === 5 && dayOffset === 2 ? "Biometric reader sync delay" : "",
                    correctedBy: i === 5 && dayOffset === 2 ? "Sarah Jenkins" : ""
                });
            }
        }
        await Attendance.insertMany(attendanceDocs);
        console.log(`   ✓ Successfully inserted ${attendanceDocs.length} attendance records!`);

        // 8. Historical August 2026 Payrun & Bulk Payslips
        console.log("   -> Creating Historical August 2026 Payroll Batch for all 400 staff...");
        const augPayrun = new Payrun({
            name: "August 2026 Enterprise Payroll Batch",
            payrunBatchNumber: "PR-202608-01",
            periodStart: new Date("2026-08-01"),
            periodEnd: new Date("2026-08-31"),
            salaryStructure: regularStructure._id,
            employees: insertedEmployees.map((e) => e._id),
            status: "PAID",
            paidAt: new Date("2026-08-31T18:00:00Z"),
            sentAt: new Date("2026-08-31T19:00:00Z"),
            emailCount: insertedEmployees.length
        });
        await augPayrun.save();

        const allActiveContracts = await Contract.find({ status: "ACTIVE" });
        const contractMap = {};
        allActiveContracts.forEach((c) => {
            contractMap[c.employee.toString()] = c;
        });

        const regularRulesList = await SalaryRule.find({ _id: { $in: regularStructure.rules } });

        let totalGross = 0;
        let totalDeductions = 0;
        let totalNet = 0;
        const payslipDocs = [];

        for (let i = 0; i < insertedEmployees.length; i++) {
            const emp = insertedEmployees[i];
            const contract = contractMap[emp._id.toString()] || contractDocs[i];
            const baseSalary = contract?.salary || 5000;

            const computed = calculateSalary(regularRulesList, baseSalary);
            totalGross += computed.grossSalary;
            totalDeductions += computed.totalDeductions;
            totalNet += computed.netSalary;

            payslipDocs.push({
                payslipNumber: `PS-202608-${String(i + 1).padStart(4, "0")}`,
                payrun: augPayrun._id,
                employee: emp._id,
                contract: contract?._id,
                salaryStructure: regularStructure._id,
                periodStart: new Date("2026-08-01"),
                periodEnd: new Date("2026-08-31"),
                status: "PAID",
                workedDays: 22,
                totalWorkingDays: 22,
                lines: computed.lines,
                basicSalary: computed.basicSalary,
                totalAllowances: computed.totalAllowances,
                grossSalary: computed.grossSalary,
                totalDeductions: computed.totalDeductions,
                netSalary: computed.netSalary,
                emailStatus: "SENT",
                sentAt: new Date("2026-08-31T19:00:00Z"),
                paidAt: new Date("2026-08-31T18:00:00Z")
            });
        }

        await Payslip.insertMany(payslipDocs);

        augPayrun.totalGross = Number(totalGross.toFixed(2));
        augPayrun.totalDeductions = Number(totalDeductions.toFixed(2));
        augPayrun.totalNet = Number(totalNet.toFixed(2));
        await augPayrun.save();

        console.log(`   ✓ Calculated and stored ${payslipDocs.length} payslips totaling $${Number(totalNet.toFixed(2)).toLocaleString()} net pay!`);

        // 9. System Users for All 5 Roles
        console.log("   -> Creating System Users for All 5 Roles with JWT passwords...");
        const users = [
            {
                name: "Admin User",
                email: "admin@peoplepay360.com",
                password: "password123",
                role: "ADMIN"
            },
            {
                name: "Sarah Jenkins (HR Manager)",
                email: "sarah.jenkins@peoplepay360.com",
                password: "password123",
                role: "HR_MANAGER",
                linkedEmployee: insertedEmployees[1]._id
            },
            {
                name: "David Kim (HR Payroll User)",
                email: "david.kim@peoplepay360.com",
                password: "password123",
                role: "HR_PAYROLL_USER",
                linkedEmployee: insertedEmployees[2]._id
            },
            {
                name: "Elena Rostova (Payroll Director)",
                email: "elena.rostova@peoplepay360.com",
                password: "password123",
                role: "HR_PAYROLL_MANAGER",
                linkedEmployee: insertedEmployees[3]._id
            },
            {
                name: "Alex Morgan (Employee)",
                email: "alex.morgan@peoplepay360.com",
                password: "password123",
                role: "EMPLOYEE",
                linkedEmployee: insertedEmployees[0]._id
            }
        ];

        for (const u of users) {
            await User.create(u);
        }

        console.log("==================================================");
        console.log(`   DATASET COMPLETE: ${insertedEmployees.length} EMPLOYEES POPULATED!`);
        console.log("==================================================");

        return {
            success: true,
            totalEmployees: insertedEmployees.length,
            totalContracts: contractDocs.length,
            totalAllocations: allocationDocs.length,
            totalPayslips: payslipDocs.length
        };
    } catch (error) {
        console.error("Large dataset seeding failed:", error);
        throw error;
    }
};

if (require.main === module) {
    seedLargeDataset()
        .then(() => {
            console.log("Seeder script completed.");
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}

module.exports = seedLargeDataset;
