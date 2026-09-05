const calculatePayroll = (baseSalary, rules) => {
    let gross = 0;
    let deductions = 0;

    const breakdown = [];

    // Always execute rules in sequence
    const sortedRules = [...rules]
        .filter(rule => rule.active)
        .sort((a, b) => a.sequence - b.sequence);

    for (const rule of sortedRules) {
        let amount = 0;

        if (rule.calculationType === "FIXED") {
            amount = rule.amount || 0;
        }

        if (rule.calculationType === "PERCENTAGE") {
            amount = (baseSalary * (rule.percentage || 0)) / 100;
        }

        amount = Math.round(amount * 100) / 100;

        if (rule.type === "EARNING") {
            gross += amount;
        }

        if (rule.type === "DEDUCTION") {
            deductions += amount;
        }

        breakdown.push({
            code: rule.code,
            name: rule.name,
            type: rule.type,
            calculationType: rule.calculationType,
            amount
        });
    }

    const net = gross - deductions;

    return {
        baseSalary,
        gross,
        deductions,
        net,
        breakdown
    };
};

module.exports = {
    calculatePayroll
};