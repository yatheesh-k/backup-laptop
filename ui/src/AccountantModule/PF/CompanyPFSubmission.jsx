import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { 
//   EmployeePFDetailsGetAPI, 
//   PFComparisonAPI,
//   SubmitPFForProcessingAPI 
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, ArrowLeftRight,  } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const CompanyPFSubmission = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Comparison state
  const [comparisonMonth, setComparisonMonth] = useState("");
  const [comparisonYear, setComparisonYear] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch PF details
  const fetchPFDetails = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select both month and year");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await (selectedMonth, selectedYear);
      setEmployees(response.data.data || []);
      toast.success("PF details fetched successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Compare with previous month
  const compareWithPreviousMonth = async () => {
    if (!selectedMonth || !selectedYear || !comparisonMonth || !comparisonYear) {
      toast.error("Please select all month and year fields");
      return;
    }
    
    setIsComparing(true);
    try {
      const response = await (
        selectedMonth, 
        selectedYear,
        comparisonMonth,
        comparisonYear
      );
      setComparisonResult(response.data);
      toast.success("Comparison completed");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsComparing(false);
    }
  };

  // Submit for processing
  const submitForProcessing = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await (selectedMonth, selectedYear);
      if (response.data.success) {
        toast.success("PF details submitted for processing");
        // Reset form
        setEmployees([]);
        setComparisonResult(null);
        setSelectedMonth("");
        setSelectedYear("");
        setComparisonMonth("");
        setComparisonYear("");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  // Download Excel
  const downloadPFDetailsExcel = () => {
    if (employees.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const formattedData = employees.map(emp => ({
      "Employee Name": `${emp.firstName} ${emp.lastName}`,
      "Email": emp.emailId,
      "UAN Number": emp.uanNumber || "Not Provided",
      "PAN": emp.panNo,
      "Aadhaar": emp.aadhaarId,
      "Salary": emp.employeeSalary,
      "PF Amount": emp.pfAmount,
      "Month": selectedMonth,
      "Year": selectedYear
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PF Details");
    XLSX.writeFile(wb, `PF_Details_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Company Provident Fund Submission</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">Provident Fund Submission</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Provident Fund Management
                </h5>
              </div>
              <div className="card-body">
                {/* Step 1: Fetch PF Details */}
                <div className="mb-4">
                  <h5>1. Fetch Employee Provident Fund Details</h5>
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Select Month</label>
                      <select 
                        className="form-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                      >
                        <option value="">Select Month</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                          return <option key={month} value={month}>{month}</option>;
                        })}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label">Select Year</label>
                      <select 
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <button 
                        className="btn btn-primary"
                        onClick={fetchPFDetails}
                        disabled={!selectedMonth || !selectedYear || isLoading}
                      >
                        {isLoading ? 'Fetching...' : 'Fetch Details'}
                      </button>
                    </div>
                  </div>
                  
                  {employees.length > 0 && (
                    <>
                      <div className="table-responsive mb-3">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Employee</th>
                              <th>UAN Number</th>
                              <th>PAN</th>
                              <th>Salary</th>
                              <th>Provident Fund Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((emp, i) => (
                              <tr key={i}>
                                <td>{`${emp.firstName} ${emp.lastName}`}</td>
                                <td className={emp.uanNumber ? '' : 'text-danger'}>
                                  {emp.uanNumber || 'Not Provided'}
                                </td>
                                <td>{emp.panNo}</td>
                                <td>{emp.employeeSalary}</td>
                                <td>{emp.pfAmount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-4">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={downloadPFDetailsExcel}
                        >
                          <Download className="me-2" />
                          Download Provident Fund Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Step 2: Compare with Previous Month */}
                <div className="mb-4">
                  <h5>2. Compare with Previous Month</h5>
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Current Month</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={`${selectedMonth} ${selectedYear}`}
                        readOnly 
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label">Compare With Month</label>
                      <select 
                        className="form-select"
                        value={comparisonMonth}
                        onChange={(e) => setComparisonMonth(e.target.value)}
                      >
                        <option value="">Select Month</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                          return <option key={month} value={month}>{month}</option>;
                        })}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label">Compare With Year</label>
                      <select 
                        className="form-select"
                        value={comparisonYear}
                        onChange={(e) => setComparisonYear(e.target.value)}
                      >
                        <option value="">Select Year</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                    </div>
                    
                    <div className="col-md-3">
                      <button 
                        className="btn btn-primary"
                        onClick={compareWithPreviousMonth}
                        disabled={!comparisonMonth || !comparisonYear || isComparing || employees.length === 0}
                      >
                        {isComparing ? 'Comparing...' : 'Compare'}
                      </button>
                    </div>
                  </div>
                  
                  {comparisonResult && (
                    <>
                      {/* Comparison Results */}
                      <div className="mb-3">
                        {comparisonResult.newEmployees?.length > 0 && (
                          <div className="alert alert-success">
                            <strong>New Employees:</strong> {comparisonResult.newEmployees.length} employees added this month
                          </div>
                        )}
                        
                        {comparisonResult.missingEmployees?.length > 0 && (
                          <div className="alert alert-danger">
                            <strong>Missing Employees:</strong> {comparisonResult.missingEmployees.length} employees from last month not found
                          </div>
                        )}
                        
                        {comparisonResult.changedDetails?.length > 0 && (
                          <div className="alert alert-warning">
                            <strong>Changed Details:</strong> {comparisonResult.changedDetails.length} Provident Fund details modified
                          </div>
                        )}
                        
                        {(!comparisonResult.newEmployees || comparisonResult.newEmployees.length === 0) &&
                         (!comparisonResult.missingEmployees || comparisonResult.missingEmployees.length === 0) &&
                         (!comparisonResult.changedDetails || comparisonResult.changedDetails.length === 0) && (
                          <div className="alert alert-info">
                            No differences found between the selected months.
                          </div>
                        )}
                      </div>
                      
                      {/* Submit for Processing */}
                      <div className="d-flex justify-content-end">
                        <button 
                          className="btn btn-success"
                          onClick={submitForProcessing}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit for Processing'}
                        </button>
                      </div>
                    </>
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

export default CompanyPFSubmission;