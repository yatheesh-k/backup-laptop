import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { 
//   EmployeePTDetailsGetAPI, 
//   PTComparisonAPI,
//   SubmitPTForProcessingAPI 
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, ArrowLeftRight, } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const CompanyPTSubmission = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [comparisonMonth, setComparisonMonth] = useState("");
  const [comparisonYear, setComparisonYear] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPTDetails = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select both month and year");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await (selectedMonth, selectedYear);
      setEmployees(response.data.data || []);
      toast.success("Professional Tax details fetched successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const submitForProcessing = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await (selectedMonth, selectedYear);
      if (response.data.success) {
        toast.success("Professional Tax details submitted for processing");
        resetForm();
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmployees([]);
    setComparisonResult(null);
    setSelectedMonth("");
    setSelectedYear("");
    setComparisonMonth("");
    setComparisonYear("");
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  const downloadPTDetailsExcel = () => {
    if (employees.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const formattedData = employees.map(emp => ({
      "Employee Name": `${emp.firstName} ${emp.lastName}`,
      "PT Number": emp.ptNumber || "Not Provided",
      "State": emp.stateCode,
      "Salary": emp.employeeSalary,
      "PT Amount": emp.ptAmount,
      "Month": selectedMonth,
      "Year": selectedYear
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PT Details");
    XLSX.writeFile(wb, `PT_Details_${selectedMonth}_${selectedYear}.xlsx`);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Company Professional Tax Submission</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">Professional Tax Submission</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Professional Tax Management
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h5>1. Fetch Employee Professional Tax Details</h5>
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
                        onClick={fetchPTDetails}
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
                              <th>Professional Tax Number</th>
                              <th>State</th>
                              <th>Salary</th>
                              <th>Professional Tax Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((emp, i) => (
                              <tr key={i}>
                                <td>{`${emp.firstName} ${emp.lastName}`}</td>
                                <td className={emp.ptNumber ? '' : 'text-danger'}>
                                  {emp.ptNumber || 'Not Provided'}
                                </td>
                                <td>{emp.stateCode}</td>
                                <td>{emp.employeeSalary}</td>
                                <td>{emp.ptAmount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-4">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={downloadPTDetailsExcel}
                        >
                          <Download className="me-2" />
                          Download Professional Tax Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
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
                            <strong>Changed Details:</strong> {comparisonResult.changedDetails.length} Professional Tax details modified
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

export default CompanyPTSubmission;