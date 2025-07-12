import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { 
//   EmployeeTDSDetailsGetAPI, 
//   TDSComparisonAPI,
//   SubmitTDSForProcessingAPI 
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, ArrowLeftRight } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const CompanyTDSSubmission = () => {
  const [selectedQuarter, setSelectedQuarter] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [comparisonQuarter, setComparisonQuarter] = useState("");
  const [comparisonYear, setComparisonYear] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTDSDetails = async () => {
    if (!selectedQuarter || !selectedYear) {
      toast.error("Please select both quarter and year");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await (selectedQuarter, selectedYear);
      setEmployees(response.data.data || []);
      toast.success("TDS details fetched successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const compareWithPreviousQuarter = async () => {
    if (!selectedQuarter || !selectedYear || !comparisonQuarter || !comparisonYear) {
      toast.error("Please select all quarter and year fields");
      return;
    }
    
    setIsComparing(true);
    try {
      const response = await (
        selectedQuarter, 
        selectedYear,
        comparisonQuarter,
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
    if (!selectedQuarter || !selectedYear) {
      toast.error("Please select quarter and year first");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await (selectedQuarter, selectedYear);
      if (response.data.success) {
        toast.success("TDS details submitted for processing");
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
    setSelectedQuarter("");
    setSelectedYear("");
    setComparisonQuarter("");
    setComparisonYear("");
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  const downloadTDSDetailsExcel = () => {
    if (employees.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const formattedData = employees.map(emp => ({
      "Employee Name": `${emp.firstName} ${emp.lastName}`,
      "PAN": emp.panNo,
      "Financial Year": emp.financialYear,
      "Total Salary": emp.totalSalary,
      "TDS Amount": emp.tdsAmount,
      "TDS Section": emp.tdsSection,
      "Quarter": selectedQuarter,
      "Year": selectedYear
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TDS Details");
    XLSX.writeFile(wb, `TDS_Details_Q${selectedQuarter}_${selectedYear}.xlsx`);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Company TDS Submission</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">TDS Submission</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  TDS Management
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <h5>1. Fetch Employee TDS Details</h5>
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Select Quarter</label>
                      <select 
                        className="form-select"
                        value={selectedQuarter}
                        onChange={(e) => setSelectedQuarter(e.target.value)}
                      >
                        <option value="">Select Quarter</option>
                        <option value="1">Q1 (Apr-Jun)</option>
                        <option value="2">Q2 (Jul-Sep)</option>
                        <option value="3">Q3 (Oct-Dec)</option>
                        <option value="4">Q4 (Jan-Mar)</option>
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
                        onClick={fetchTDSDetails}
                        disabled={!selectedQuarter || !selectedYear || isLoading}
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
                              <th>PAN</th>
                              <th>Financial Year</th>
                              <th>Total Salary</th>
                              <th>TDS Amount</th>
                              <th>TDS Section</th>
                            </tr>
                          </thead>
                          <tbody>
                            {employees.map((emp, i) => (
                              <tr key={i}>
                                <td>{`${emp.firstName} ${emp.lastName}`}</td>
                                <td>{emp.panNo}</td>
                                <td>{emp.financialYear}</td>
                                <td>{emp.totalSalary}</td>
                                <td>{emp.tdsAmount}</td>
                                <td>{emp.tdsSection}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="d-flex justify-content-between mb-4">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={downloadTDSDetailsExcel}
                        >
                          <Download className="me-2" />
                          Download TDS Details
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="mb-4">
                  <h5>2. Compare with Previous Quarter</h5>
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Current Quarter</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={`Q${selectedQuarter} ${selectedYear}`}
                        readOnly 
                      />
                    </div>
                    
                    <div className="col-md-3">
                      <label className="form-label">Compare With Quarter</label>
                      <select 
                        className="form-select"
                        value={comparisonQuarter}
                        onChange={(e) => setComparisonQuarter(e.target.value)}
                      >
                        <option value="">Select Quarter</option>
                        <option value="1">Q1 (Apr-Jun)</option>
                        <option value="2">Q2 (Jul-Sep)</option>
                        <option value="3">Q3 (Oct-Dec)</option>
                        <option value="4">Q4 (Jan-Mar)</option>
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
                        onClick={compareWithPreviousQuarter}
                        disabled={!comparisonQuarter || !comparisonYear || isComparing || employees.length === 0}
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
                            <strong>New Employees:</strong> {comparisonResult.newEmployees.length} employees added this quarter
                          </div>
                        )}
                        
                        {comparisonResult.missingEmployees?.length > 0 && (
                          <div className="alert alert-danger">
                            <strong>Missing Employees:</strong> {comparisonResult.missingEmployees.length} employees from last quarter not found
                          </div>
                        )}
                        
                        {comparisonResult.changedDetails?.length > 0 && (
                          <div className="alert alert-warning">
                            <strong>Changed Details:</strong> {comparisonResult.changedDetails.length} TDS details modified
                          </div>
                        )}
                        
                        {(!comparisonResult.newEmployees || comparisonResult.newEmployees.length === 0) &&
                         (!comparisonResult.missingEmployees || comparisonResult.missingEmployees.length === 0) &&
                         (!comparisonResult.changedDetails || comparisonResult.changedDetails.length === 0) && (
                          <div className="alert alert-info">
                            No differences found between the selected quarters.
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

export default CompanyTDSSubmission;