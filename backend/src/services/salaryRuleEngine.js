const calculateRule = (rule, context) => {
    let amount = 0;

    if (rule.calculationType === "FIXED") {
        amount = rule.amount;
    }

    if (rule.calculationType === "PERCENTAGE") {
        amount = (context.baseSalary * rule.percentage) / 100;
    }

    return {
        code: rule.code,
        name: rule.name,
        type: rule.type,
        amount: Number(amount.toFixed(2))
    };
};

const calculateSalary = (rules, baseSalary) => {
    const context = {
        baseSalary
    };

    const earnings = [];
    const deductions = [];

    const orderedRules = [...rules].sort(
        (a, b) => a.sequence - b.sequence
    );

    for (const rule of orderedRules) {
        if (!rule.active) {
            continue;
        }

        const result = calculateRule(rule, context);

        if (rule.type === "EARNING") {
            earnings.push(result);
        } else if (rule.type === "DEDUCTION") {
            deductions.push(result);
        }
    }

    const totalEarnings = earnings.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const totalDeductions = deductions.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    const grossSalary = baseSalary + totalEarnings;
    const netSalary = grossSalary - totalDeductions;

    return {
        baseSalary,
        earnings,
        deductions,
        totalEarnings: Number(totalEarnings.toFixed(2)),
        totalDeductions: Number(totalDeductions.toFixed(2)),
        grossSalary: Number(grossSalary.toFixed(2)),
        netSalary: Number(netSalary.toFixed(2))
    };
};

module.exports = {
    calculateRule,
    calculateSalary
};