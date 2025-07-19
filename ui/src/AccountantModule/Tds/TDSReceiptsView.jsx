import React, { useState, useEffect } from "react";
import LayOut from "../../LayOut/LayOut";
import { GetTDSReceiptsAPI } from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Search,Eye } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const TDSReceiptsView = () => {
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async (month = null, year = null) => {
    setIsLoading(true);
    try {
      const response = await GetTDSReceiptsAPI({ month, year });
      if (response.data && response.data.message === "Success") {
        setReceipts(response.data.data || []);
      } else {
        toast.error("Failed to fetch TDS receipts");
        setReceipts([]);
      }
    } catch (error) {
      toast.error("Failed to fetch TDS receipts");
      console.error(error);
      setReceipts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = () => {
    fetchReceipts(selectedMonth || null, selectedYear || null);
  };

  const clearFilters = () => {
    setSelectedMonth("");
    setSelectedYear("");
    setSearchTerm("");
    fetchReceipts();
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      (receipt.month && receipt.month.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.year && receipt.year.toString().includes(searchTerm)) ||
      (receipt.tdsReceiptNumber && receipt.tdsReceiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.tdsReceiptDate && receipt.tdsReceiptDate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.tdsTotalAmount && receipt.tdsTotalAmount.toString().includes(searchTerm)) ||
      (receipt.assessmentYear && receipt.assessmentYear.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (receipt.quarter && receipt.quarter.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>TDS Receipts</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">TDS Receipts</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  View Submitted TDS Receipts
                </h5>
              </div>
              <div className="card-body">
                {/* Filters */}
                <div className="row mb-4">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Search</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <Search />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search receipts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Month</label>
                    <select
                      className="form-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                        return <option key={month} value={month.toLowerCase()}>{month}</option>;
                      })}
                    </select>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Year</label>
                    <select
                      className="form-select"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">All Years</option>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>
                  <div className="col-md-2 mb-3 d-flex align-items-end">
                    <button
                      className="btn btn-primary me-2"
                      onClick={handleFilter}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Filtering...' : 'Filter'}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={clearFilters}
                      disabled={isLoading}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Receipts Table */}
                <div className="table-responsive">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredReceipts.length === 0 ? (
                    <div className="text-center py-4">
                      <h5>No TDS receipts found</h5>
                      <p className="text-muted">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Month/Year</th>
                          <th>Receipt Number</th>
                          <th>Receipt Date</th>
                          <th>Total Amount</th>
                          <th>Receipt File</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReceipts.map((receipt) => (
                          <tr key={receipt.id}>
                            <td>
                              {receipt.month} {receipt.year}
                            </td>
                            <td>
                              {receipt.tdsReceiptNumber || "N/A"}
                            </td>
                            <td>
                              {receipt.tdsReceiptDate || "N/A"}
                            </td>
                            <td>
                              {receipt.tdsTotalAmount ? `₹${receipt.tdsTotalAmount}` : "N/A"}
                            </td>
                            <td>
                              {receipt.tdsReceiptFileName ? (
                                <a 
                                  href={receipt.tdsReceiptFileName} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary"
                                  title="View Receipt"
                                >
                                  <Eye />
                                </a>
                              ) : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default TDSReceiptsView;