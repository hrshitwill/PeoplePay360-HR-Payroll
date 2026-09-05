const Contract = require("../models/Contract");

/**
 * Service to handle contract validation and period-specific contract resolution
 */

/**
 * Finds the applicable contract for an employee during a given pay period.
 * Must be ACTIVE and overlap with [periodStart, periodEnd].
 * If multiple exist, the most recently started active contract is chosen.
 */
const findApplicableContract = async (employeeId, periodStart, periodEnd) => {
    const pStart = new Date(periodStart);
    const pEnd = new Date(periodEnd);

    const contracts = await Contract.find({
        employee: employeeId,
        status: "ACTIVE",
        startDate: { $lte: pEnd },
        $or: [
            { endDate: null },
            { endDate: { $gte: pStart } }
        ]
    })
        .populate("salaryStructure")
        .populate("workingSchedule")
        .sort({ startDate: -1 });

    if (!contracts || contracts.length === 0) {
        return null;
    }

    // Return the latest active contract valid for this period
    return contracts[0];
};

/**
 * Validates that an employee does not have overlapping active contracts
 */
const validateConcurrentContracts = async (employeeId, startDate, endDate, excludeContractId = null) => {
    const newStart = new Date(startDate);
    const newEnd = endDate ? new Date(endDate) : null;

    const query = {
        employee: employeeId,
        status: "ACTIVE"
    };

    if (excludeContractId) {
        query._id = { $ne: excludeContractId };
    }

    const existingActive = await Contract.find(query);

    for (const c of existingActive) {
        const cStart = new Date(c.startDate);
        const cEnd = c.endDate ? new Date(c.endDate) : null;

        // Overlap logic:
        // Contract overlaps if (newStart <= cEnd or cEnd is null) and (newEnd >= cStart or newEnd is null)
        const overlaps = (!cEnd || newStart <= cEnd) && (!newEnd || newEnd >= cStart);

        if (overlaps) {
            return {
                valid: false,
                conflictingContract: c,
                message: `Employee already has an active contract (${c.contractReference || c._id}) overlapping with the specified dates.`
            };
        }
    }

    return { valid: true };
};

module.exports = {
    findApplicableContract,
    validateConcurrentContracts
};
