// Helper function to generate stock ID based on department allocations
exports.generateStockId = (allocatedDept, specification, stockType) => {
    if (stockType === 'Departmental Stock') {
      // For departmental stock, the ID will include the department and specification
      const departments = allocatedDept.map(dept => dept.department).join(',');
      return `${departments}/${specification}`;
    } else if (stockType === 'Institutional Stock') {
      // For institutional stock, the ID will include the room number
      return `${specification}/${allocatedDept[0].department}/${allocatedDept[0].allocatedQuantity}`;
    }
  };
  