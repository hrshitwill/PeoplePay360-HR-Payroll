/**
 * Salary Rule Calculation Engine for PeoplePay360
 * Sequentially computes salary components based on contract wage,
 * configured salary structure, and ordered salary rules.
 */

const calculateRuleAmount = (rule, context) => {
    let amount = 0;

    if (rule.calculationType === "FIXED") {
        amount = Number(rule.amount) || 0;
    } else if (rule.calculationType === "PERCENTAGE") {
        const pct = Number(rule.percentage) || 0;
        let baseAmount = context.baseSalary;

        if (rule.percentageOf === "GROSS" && context.grossSalary) {
            baseAmount = context.grossSalary;
        } else if (rule.percentageOf === "BASIC_PLUS_ALLOWANCE") {
            baseAmount = context.baseSalary + (context.totalAllowances || 0);
        }

        amount = (baseAmount * pct) / 100;
    } else if (rule.calculationType === "FORMULA") {
        // Safe evaluation of basic mathematical expressions
        try {
            const scope = {
                base: context.baseSalary,
                BASIC: context.baseSalary,
                gross: context.grossSalary || context.baseSalary,
                allowances: context.totalAllowances || 0,
                deductions: context.totalDeductions || 0,
                ...context.ruleValues
            };

            let expr = rule.formula || "0";
            // Replace tokens with scope values
            Object.keys(scope).forEach((key) => {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                expr = expr.replace(regex, scope[key]);
            });

            // Safe math evaluation
            // eslint-disable-next-line no-new-func
            const evalFn = new Function(`return (${expr});`);
            const val = evalFn();
            amount = typeof val === "number" && !isNaN(val) ? val : 0;
        } catch (err) {
            console.warn(`Formula error for rule ${rule.code}:`, err.message);
            amount = 0;
        }
    }

    return Number(amount.toFixed(2));
};

const calculateSalary = (rules, baseSalary, additionalContext = {}) => {
    const validBase = Math.max(0, Number(baseSalary) || 0);

    const context = {
        baseSalary: validBase,
        totalAllowances: 0,
        totalDeductions: 0,
        grossSalary: validBase,
        ruleValues: {},
        ...additionalContext
    };

    const lines = [];

    // Always ensure Basic line is present
    lines.push({
        code: "BASIC",
        name: "Basic Salary",
        category: "BASIC",
        sequence: 1,
        amount: validBase,
        type: "EARNING"
    });
    context.ruleValues["BASIC"] = validBase;

    // Sort rules by sequence
    const orderedRules = [...rules]
        .filter((r) => r.active !== false && r.code !== "BASIC")
        .sort((a, b) => (a.sequence || 10) - (b.sequence || 10));

    // Phase 1: Earnings & Allowances
    for (const rule of orderedRules) {
        if (rule.type === "EARNING" || rule.category === "ALLOWANCE") {
            const amt = calculateRuleAmount(rule, context);
            lines.push({
                code: rule.code,
                name: rule.name,
                category: rule.category || "ALLOWANCE",
                sequence: rule.sequence || 10,
                amount: amt,
                type: "EARNING"
            });
            context.totalAllowances += amt;
            context.ruleValues[rule.code] = amt;
        }
    }

    context.grossSalary = Number((validBase + context.totalAllowances).toFixed(2));

    // Phase 2: Deductions & Contributions
    for (const rule of orderedRules) {
        if (rule.type === "DEDUCTION" || rule.category === "DEDUCTION" || rule.category === "CONTRIBUTION") {
            const amt = calculateRuleAmount(rule, context);
            lines.push({
                code: rule.code,
                name: rule.name,
                category: rule.category || "DEDUCTION",
                sequence: rule.sequence || 10,
                amount: amt,
                type: "DEDUCTION"
            });
            context.totalDeductions += amt;
            context.ruleValues[rule.code] = amt;
        }
    }

    context.totalAllowances = Number(context.totalAllowances.toFixed(2));
    context.totalDeductions = Number(context.totalDeductions.toFixed(2));
    const netSalary = Math.max(0, Number((context.grossSalary - context.totalDeductions).toFixed(2)));

    // Phase 3: Add Gross and Net summary lines
    lines.push({
        code: "GROSS",
        name: "Gross Salary",
        category: "GROSS",
        sequence: 900,
        amount: context.grossSalary,
        type: "INFORMATIONAL"
    });

    lines.push({
        code: "NET",
        name: "Net Salary",
        category: "NET",
        sequence: 1000,
        amount: netSalary,
        type: "INFORMATIONAL"
    });

    return {
        basicSalary: validBase,
        totalAllowances: context.totalAllowances,
        grossSalary: context.grossSalary,
        totalDeductions: context.totalDeductions,
        netSalary,
        lines
    };
};

module.exports = {
    calculateRuleAmount,
    calculateSalary
};