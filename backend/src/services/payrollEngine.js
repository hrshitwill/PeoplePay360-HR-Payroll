/**
 * Enhanced Payroll Engine
 * Supports FIXED, PERCENTAGE (with percentageOf references), and FORMULA computation types.
 * Processes rules in sequence order, building a context map so later rules can reference earlier ones.
 */
const calculatePayroll = (baseSalary, rules) => {
    let gross = 0;
    let deductions = 0;

    const breakdown = [];

    // Context map: stores computed amounts by rule code (e.g., { BASIC: 30000, HRA: 12000 })
    const context = {
        BASE: baseSalary
    };

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
            // Look up the reference value (percentageOf code or BASE)
            const refCode = rule.percentageOf || "BASE";
            const refAmount = context[refCode] !== undefined
                ? context[refCode]
                : baseSalary;

            amount = (refAmount * (rule.percentage || 0)) / 100;
        }

        if (rule.calculationType === "FORMULA") {
            try {
                // Build a safe expression by replacing rule codes with their values
                let expression = rule.formula || "0";

                // Replace known codes with their computed values
                for (const [code, value] of Object.entries(context)) {
                    const regex = new RegExp(`\\b${code}\\b`, "g");
                    expression = expression.replace(regex, value.toString());
                }

                // Evaluate the expression (basic math only)
                amount = evaluateExpression(expression);
            } catch (err) {
                amount = 0;
            }
        }

        amount = Math.round(amount * 100) / 100;

        // Store in context for subsequent rules
        context[rule.code] = amount;

        if (rule.type === "EARNING") {
            gross += amount;
        }

        if (rule.type === "DEDUCTION") {
            deductions += amount;
        }

        // After computing gross, store it in context
        context["GROSS"] = gross;

        breakdown.push({
            code: rule.code,
            name: rule.name,
            category: rule.category || rule.type,
            type: rule.type,
            calculationType: rule.calculationType,
            amount
        });
    }

    const net = Math.round((gross - deductions) * 100) / 100;

    // Store NET in context
    context["NET"] = net;

    return {
        baseSalary,
        gross: Math.round(gross * 100) / 100,
        deductions: Math.round(deductions * 100) / 100,
        net,
        breakdown,
        context
    };
};

/**
 * Safe math expression evaluator (no eval)
 * Supports: +, -, *, /, parentheses, numbers
 */
function evaluateExpression(expr) {
    // Remove whitespace
    expr = expr.replace(/\s+/g, "");

    // Validate: only allow numbers, operators, parentheses, decimals
    if (!/^[\d+\-*/().]+$/.test(expr)) {
        return 0;
    }

    try {
        // Use Function constructor (safer than eval, still sandboxed)
        const result = new Function(`"use strict"; return (${expr});`)();
        return isFinite(result) ? result : 0;
    } catch {
        return 0;
    }
}

module.exports = {
    calculatePayroll
};