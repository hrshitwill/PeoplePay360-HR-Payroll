/**
 * Email distribution service for Payslips
 * Simulates enterprise email delivery with logging and status tracking
 */

const sendPayslipEmail = async (employee, payslip, payrun) => {
    // In production, this integrates with SMTP/SendGrid/SES.
    // Here we reliably simulate sending with realistic delivery telemetry.
    const emailLog = {
        to: employee.email,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        payslipNumber: payslip.payslipNumber,
        payrunName: payrun.name,
        period: `${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`,
        netSalary: payslip.netSalary,
        sentAt: new Date(),
        status: employee.email ? "SENT" : "FAILED"
    };

    console.log(`[EMAIL SERVICE] Payslip dispatched to ${emailLog.to} for ${emailLog.employeeName} (${emailLog.payslipNumber})`);
    return emailLog;
};

const sendBulkPayslips = async (payslipsWithDetails, payrun) => {
    const results = [];
    for (const item of payslipsWithDetails) {
        const result = await sendPayslipEmail(item.employee, item.payslip, payrun);
        results.push(result);
    }
    return {
        totalDispatched: results.filter((r) => r.status === "SENT").length,
        totalFailed: results.filter((r) => r.status === "FAILED").length,
        details: results
    };
};

module.exports = {
    sendPayslipEmail,
    sendBulkPayslips
};
