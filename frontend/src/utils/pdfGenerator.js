import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates an official Individual Payrun & Salary Statement PDF for an employee
 */
export const generatePayslipPDF = (payslip) => {
  const doc = new jsPDF();
  const emp = payslip.employee || {};
  const contract = payslip.contract || {};
  const payrun = payslip.payrun || {};
  const periodText = `${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`;

  // Top Banner
  doc.setFillColor(37, 99, 235); // corporate blue
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PeoplePay360", 14, 18);

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.text("INDIVIDUAL PAYRUN & SALARY STATEMENT", 124, 18);

  // Payrun Metadata Header
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Payrun Batch: ${payrun.name || payrun.payrunBatchNumber || "Regular Corporate Payrun"}`, 14, 38);
  doc.text(`Pay Period: ${periodText}`, 14, 45);
  doc.text(`Slip Reference: ${payslip.payslipNumber || "N/A"}`, 14, 52);

  doc.text(`Disbursement Date: ${payrun.paymentDate ? new Date(payrun.paymentDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 130, 38);
  doc.text(`Payment Status: ${(payslip.paymentStatus || payslip.status || "PAID").toUpperCase()}`, 130, 45);
  doc.text(`Total Worked Days: ${payslip.workedDays || 22} / ${payslip.totalWorkingDays || 22} Days`, 130, 52);

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(14, 58, 196, 58);

  // Employee Information Grid
  autoTable(doc, {
    startY: 63,
    theme: "plain",
    styles: { fontSize: 9.5, cellPadding: 2.8 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      1: { textColor: [15, 23, 42], cellWidth: 62 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      3: { textColor: [15, 23, 42], cellWidth: 62 },
    },
    body: [
      ["Employee Name:", `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Employee", "Employee ID:", emp.employeeId || "N/A"],
      ["Designation:", emp.jobTitle || "Staff", "Department:", emp.department || "General"],
      ["Bank Name:", emp.bankDetails?.bankName || "Standard Chartered", "Account Number:", emp.bankDetails?.accountNumber || "N/A"],
      ["IFSC / Routing:", emp.bankDetails?.ifscRouting || "SCBLUS33", "Contract Ref:", contract.contractReference || "Active Agreement"]
    ],
  });

  // Earnings and Deductions breakdown
  const earnings = (payslip.lines || []).filter((l) => l.type === "EARNING" || l.category === "BASIC" || l.category === "ALLOWANCE");
  const deductions = (payslip.lines || []).filter((l) => l.type === "DEDUCTION" || l.category === "DEDUCTION");

  const tableData = [];
  const maxRows = Math.max(earnings.length, deductions.length);

  for (let i = 0; i < maxRows; i++) {
    const e = earnings[i];
    const d = deductions[i];
    tableData.push([
      e ? (e.ruleName || e.name || "Allowance") : "",
      e ? `$${Number(e.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "",
      d ? (d.ruleName || d.name || "Deduction") : "",
      d ? `$${Number(d.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ""
    ]);
  }

  const tableStartY = doc.lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: tableStartY,
    theme: "striped",
    head: [["Earnings & Allowances", "Amount (USD)", "Statutory Deductions", "Amount (USD)"]],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      fontSize: 9.5
    },
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3.2 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40, halign: "right", textColor: [5, 150, 105], fontStyle: "bold" },
      2: { cellWidth: 55 },
      3: { cellWidth: 40, halign: "right", textColor: [220, 38, 38], fontStyle: "bold" }
    }
  });

  // Summary Totals
  const totalsY = doc.lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: totalsY,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [30, 41, 59], cellWidth: 95 },
      1: { fontStyle: "bold", textColor: [30, 41, 59], cellWidth: 95, halign: "right" }
    },
    body: [
      [
        `Gross Earnings: $${Number(payslip.grossSalary || payslip.totalGross || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        `Total Deductions: $${Number(payslip.totalDeductions || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
      ]
    ]
  });

  // Net Pay Highlight Box
  const netY = doc.lastAutoTable.finalY + 6;
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, netY, 182, 22, 3, 3, "F");
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, netY, 182, 22, 3, 3, "D");

  doc.setTextColor(30, 58, 138);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("NET SALARY DISBURSED:", 22, netY + 14);

  doc.setTextColor(37, 99, 235);
  doc.setFontSize(16);
  doc.text(
    `$${Number(payslip.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
    148,
    netY + 14
  );

  // Footer / Verification Notice
  const footerY = netY + 36;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("This individual payrun statement is an official electronic record generated by PeoplePay360 HR Operations.", 14, footerY);
  doc.text("Direct Bank Transfer Acknowledged • System Authenticated", 14, footerY + 5);

  // File download name
  const empCode = emp.employeeId || "EMP";
  const psNum = payslip.payslipNumber || "PS";
  const filename = `Payrun_${empCode}_${psNum}.pdf`;
  doc.save(filename);
};

/**
 * Downloads a CSV statement of the employee's individual payrun
 */
export const downloadPayrunCSV = (payslip) => {
  const emp = payslip.employee || {};
  const payrun = payslip.payrun || {};
  const periodText = `${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`;

  const rows = [
    ["PEOPLEPAY360 INDIVIDUAL PAYRUN STATEMENT"],
    ["Employee Name", `${emp.firstName || ""} ${emp.lastName || ""}`.trim()],
    ["Employee ID", emp.employeeId || "N/A"],
    ["Payrun Batch", payrun.name || "Corporate Payrun"],
    ["Pay Period", periodText],
    ["Slip Number", payslip.payslipNumber || "N/A"],
    ["Payment Status", payslip.paymentStatus || "PAID"],
    [],
    ["COMPONENT", "CATEGORY", "TYPE", "AMOUNT (USD)"]
  ];

  (payslip.lines || []).forEach((l) => {
    rows.push([
      l.ruleName || l.name || "Item",
      l.category || "GENERAL",
      l.type || "EARNING",
      Number(l.amount || 0).toFixed(2)
    ]);
  });

  rows.push([]);
  rows.push(["GROSS SALARY", "", "", Number(payslip.grossSalary || payslip.totalGross || 0).toFixed(2)]);
  rows.push(["TOTAL DEDUCTIONS", "", "", Number(payslip.totalDeductions || 0).toFixed(2)]);
  rows.push(["NET SALARY PAYABLE", "", "", Number(payslip.netSalary || 0).toFixed(2)]);

  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map(cell => `"${cell}"`).join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Payrun_${emp.employeeId || "EMP"}_${payslip.payslipNumber || "Statement"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
