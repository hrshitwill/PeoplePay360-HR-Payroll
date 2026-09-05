import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generatePayslipPDF = (payslip) => {
  const doc = new jsPDF();
  const emp = payslip.employee || {};
  const contract = payslip.contract || {};
  const periodText = `${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}`;

  // Top Banner
  doc.setFillColor(79, 70, 229); // primary color
  doc.rect(0, 0, 210, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PeoplePay360", 14, 17);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL EMPLOYEE PAYSLIP", 140, 17);

  // Payslip Metadata
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Payslip Number: ${payslip.payslipNumber || "N/A"}`, 14, 38);
  doc.text(`Pay Period: ${periodText}`, 14, 45);
  doc.text(`Status: ${(payslip.status || "COMPUTED").toUpperCase()}`, 14, 52);

  doc.text(`Issued Date: ${new Date().toLocaleDateString()}`, 140, 38);
  doc.text(`Worked Days: ${payslip.workedDays || 22} / ${payslip.totalWorkingDays || 22}`, 140, 45);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 58, 196, 58);

  // Employee Information Grid
  autoTable(doc, {
    startY: 62,
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      1: { textColor: [15, 23, 42], cellWidth: 60 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 35 },
      3: { textColor: [15, 23, 42], cellWidth: 60 },
    },
    body: [
      ["Employee Name:", `${emp.firstName || ""} ${emp.lastName || ""}`, "Employee ID:", emp.employeeId || "N/A"],
      ["Department:", emp.department || "N/A", "Designation:", emp.jobTitle || "N/A"],
      ["Bank Name:", emp.bankDetails?.bankName || "Not Provided", "Account Number:", emp.bankDetails?.accountNumber || "Not Provided"],
      ["IFSC / Routing:", emp.bankDetails?.ifscRouting || "N/A", "Contract Ref:", contract.contractReference || "Standard"]
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
      e ? e.name : "",
      e ? `$${Number(e.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "",
      d ? d.name : "",
      d ? `$${Number(d.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : ""
    ]);
  }

  const tableStartY = doc.lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: tableStartY,
    theme: "striped",
    head: [["Earnings", "Amount (USD)", "Deductions", "Amount (USD)"]],
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 9.5
    },
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40, halign: "right" },
      2: { cellWidth: 55 },
      3: { cellWidth: 40, halign: "right" }
    }
  });

  // Summary Totals
  const totalsY = doc.lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: totalsY,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [15, 23, 42], cellWidth: 95 },
      1: { fontStyle: "bold", textColor: [15, 23, 42], cellWidth: 95, halign: "right" }
    },
    body: [
      [`Total Gross Earnings: $${Number(payslip.grossSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, `Total Deductions: $${Number(payslip.totalDeductions || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`]
    ]
  });

  // Net Pay Highlight Box
  const netY = doc.lastAutoTable.finalY + 6;
  doc.setFillColor(238, 242, 255); // primary light
  doc.roundedRect(14, netY, 182, 20, 3, 3, "F");
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, netY, 182, 20, 3, 3, "D");

  doc.setTextColor(79, 70, 229);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("NET SALARY PAYABLE:", 22, netY + 13);

  doc.setFontSize(15);
  doc.text(`$${Number(payslip.netSalary || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 150, netY + 13);

  // Footer / Signature line
  const footerY = netY + 36;
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("This document is computer generated and valid without signature.", 14, footerY);
  doc.text("Authorized Payroll Signatory: ________________________", 120, footerY);

  // Save / Download
  const filename = `Payslip_${emp.firstName || "Employee"}_${emp.lastName || ""}_${payslip.payslipNumber || "PS"}.pdf`;
  doc.save(filename);
};
