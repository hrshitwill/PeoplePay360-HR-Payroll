const { calculatePayroll } = require("./payrollEngine");

const rules = [
    {
        name: "Basic Salary",
        code: "BASIC",
        sequence: 1,
        type: "EARNING",
        calculationType: "FIXED",
        amount: 30000,
        active: true
    },
    {
        name: "House Rent Allowance",
        code: "HRA",
        sequence: 2,
        type: "EARNING",
        calculationType: "PERCENTAGE",
        percentage: 20,
        active: true
    },
    {
        name: "Performance Bonus",
        code: "BONUS",
        sequence: 3,
        type: "EARNING",
        calculationType: "PERCENTAGE",
        percentage: 10,
        active: true
    },
    {
        name: "Income Tax",
        code: "TAX",
        sequence: 4,
        type: "DEDUCTION",
        calculationType: "PERCENTAGE",
        percentage: 10,
        active: true
    }
];

const result = calculatePayroll(50000, rules);

console.log(result);