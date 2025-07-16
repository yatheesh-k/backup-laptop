import React, { useState, useRef } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeePFDetailsGetAPI,
  EmployeeTDSComparingAPI,
  SubmitTDSForProcessingAPI,
  AddTDSResponseAPI,
  RegisterPFEmployeeAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, Upload, PlusCircle, CheckCircle, ArrowClockwise } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const CompanyTDSSubmission = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonFile, setComparisonFile] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    emailId: "",
    mobileNumber: "",
    panNo: "",
    employeeSalary: "",
    tds: ""
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRemarkItem, setCurrentRemarkItem] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [savedRemarks, setSavedRemarks] = useState({
    "Company Employees Who are not in the Sheet": "",
    "TDS Mismatch Employees": ""
  });
  const [fileName, setFileName] = useState("");

  const formRef = useRef(null);

  const downloadTDSDetailsExcel = async () => {
    setIsLoading(true);
    try {
      const response = await EmployeePFDetailsGetAPI();
      const filteredData = response.data.data.map(emp => ({
        "Employee Name": `${emp.firstName} ${emp.lastName}`,
        "PAN No": emp.panNo,
        "Salary": emp.employeeSalary,
        "TDS Amount": emp.tds
      }));

      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "TDS Details");
      XLSX.writeFile(wb, `TDS_Details_Template.xlsx`);

      setEmployees(filteredData);
      toast.success("Excel template downloaded successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComparisonFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error("Please upload an Excel file (.xlsx)");
      return;
    }

    setComparisonFile(file);
    setFileName(file.name);
    setComparisonResult(null);
    setSavedRemarks({
      "Company Employees Who are not in the Sheet": "",
      "TDS Mismatch Employees": ""
    });
  };

  const compareTDSData = async () => {
    if (!comparisonFile) {
      toast.error("Please upload an Excel file first");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year for comparison");
      return;
    }

    setIsComparing(true);
    try {
      const response = await EmployeeTDSComparingAPI(
        selectedMonth,
        selectedYear,
        comparisonFile
      );

      setComparisonResult(response.data);
      toast.success("Comparison completed");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsComparing(false);
    }
  };

  const registerNewEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.panNo || !newEmployee.tds) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await RegisterPFEmployeeAPI({
        firstName: newEmployee.firstName,
        lastName: newEmployee.lastName,
        emailId: newEmployee.emailId,
        mobileNumber: newEmployee.mobileNumber,
        panNo: newEmployee.panNo,
        employeeSalary: newEmployee.employeeSalary,
        tds: newEmployee.tds
      });

      if (response.data.success) {
        toast.success("Employee registered successfully");
        const newEmployeeData = {
          "Employee Name": `${newEmployee.firstName} ${newEmployee.lastName}`,
          "PAN No": newEmployee.panNo,
          "Salary": newEmployee.employeeSalary,
          "TDS Amount": newEmployee.tds
        };
        
        setEmployees(prevEmployees => [...prevEmployees, newEmployeeData]);

        if (comparisonResult) {
          const updatedNotExisted = comparisonResult.data["Employees Not existed in company"]
            .filter(name => name !== `${newEmployee.firstName} ${newEmployee.lastName}`);
          
          setComparisonResult(prev => ({
            ...prev,
            data: {
              ...prev.data,
              "Employees Not existed in company": updatedNotExisted
            }
          }));
        }

        setNewEmployee({
          firstName: "",
          lastName: "",
          emailId: "",
          mobileNumber: "",
          panNo: "",
          employeeSalary: "",
          tds: ""
        });
        setShowAddEmployee(false);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTDSForProcessing = async () => {
    if (!comparisonFile) {
      toast.error("Please upload an Excel file first");
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error("Please select month and year");
      return;
    }

    setIsSubmitting(true);
    try {
      // First save the remarks
      if (savedRemarks["Company Employees Who are not in the Sheet"] || 
          savedRemarks["TDS Mismatch Employees"]) {
        const responseData = {
          month: selectedMonth,
          year: selectedYear,
          ignoredCompanyEmployees: savedRemarks["Company Employees Who are not in the Sheet"] || "N/A",
          invalidTDSAmounts: savedRemarks["TDS Mismatch Employees"] || "N/A"
        };

        await AddTDSResponseAPI(responseData);
      }

      // Then submit for processing
      const response = await SubmitTDSForProcessingAPI(
        selectedMonth,
        selectedYear,
        comparisonFile
      );

      if (response.data && response.data.message === "Success") {
        toast.success("TDS submitted for processing successfully");
        setComparisonFile(null);
        setComparisonResult(null);
        setSelectedMonth("");
        setSelectedYear("");
        setSavedRemarks({
          "Company Employees Who are not in the Sheet": "",
          "TDS Mismatch Employees": ""
        });
        setFileName("");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRemarksModal = (category) => {
    setCurrentRemarkItem(category);
    setRemarks(savedRemarks[category] || "");
    setShowRemarksModal(true);
  };

  const saveRemarks = () => {
    if (!currentRemarkItem) return;
    
    setSavedRemarks(prev => ({
      ...prev,
      [currentRemarkItem]: remarks
    }));
    
    setShowRemarksModal(false);
    toast.success("Remarks saved successfully");
  };

  const allIssuesHaveRemarks = () => {
  if (!comparisonResult) return false;
  const categoriesToCheck = Object.keys(comparisonResult.data).filter(
    key => Array.isArray(comparisonResult.data[key]) && comparisonResult.data[key].length > 0 && (key === "Company Employees Who are not in the Sheet" || key === "TDS Mismatch Employees")
  );
  return categoriesToCheck.every(category => !!savedRemarks[category]);
};

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  const handleReupload = () => {
    setComparisonResult(null);
    setSavedRemarks({
      "Company Employees Who are not in the Sheet": "",
      "TDS Mismatch Employees": ""
    });
    setFileName("");
    setComparisonFile(null);
    
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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
                {/* Step 1: Download Template */}
                <div className="mb-4">
                  <h5 className="mb-3">1. Download Employee TDS Details</h5>
                  <div className="mb-3">
                    <button
                      className="btn btn-primary"
                      onClick={downloadTDSDetailsExcel}
                      disabled={isLoading}
                    >
                      <Download className="me-2 d-inline-flex align-items-center" />
                      {isLoading ? 'Preparing...' : 'Download TDS Details'}
                    </button>
                  </div>
                  <div className="alert alert-info">
                    <strong>Note:</strong> Download the Excel, make necessary changes, and upload for comparison.
                  </div>
                </div>

                {/* Step 2: Compare TDS Data */}
                <div className="mb-4" ref={formRef}>
                  <h5 className="mb-3">2. Compare TDS Data</h5>
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

                    <div className="col-md-4">
                      <label className="form-label">Upload Modified Excel</label>
                      <div className="input-group">
                        <input
                          type="file"
                          className="form-control"
                          accept=".xlsx"
                          onChange={handleComparisonFileUpload}
                          id="tdsFileUpload"
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor="tdsFileUpload" 
                          className="btn btn-outline-secondary"
                        >
                          <Upload className="me-2 d-inline-flex align-items-center" />
                          Choose File
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={fileName || "No file chosen"}
                          readOnly
                          placeholder="Select Excel file"
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <button
                        className="btn btn-primary"
                        onClick={compareTDSData}
                        disabled={!comparisonFile || !selectedMonth || !selectedYear || isComparing}
                      >
                        {isComparing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Comparing...
                          </>
                        ) : (
                          'Compare'
                        )}
                      </button>
                    </div>
                  </div>

                  {comparisonResult && (
  <div className="mb-4">
    <h5 className="mb-4">Comparison Results</h5>

    {/* Company Employees Who are not in the Sheet */}
    {comparisonResult.data["Company Employees Who are not in the Sheet"]?.length > 0 && (
      <div className="card mb-3 border-danger">
        <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
          <span>Employees Missing from TDS Sheet ({comparisonResult.data["Company Employees Who are not in the Sheet"].length})</span>
          <button
            className="btn btn-sm btn-light"
            onClick={() => openRemarksModal("Company Employees Who are not in the Sheet")}
          >
            {savedRemarks["Company Employees Who are not in the Sheet"] ? (
              <span>Edit Remarks</span>
            ) : (
              <span>Add Remarks</span>
            )}
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>PAN Number</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.data["Company Employees Who are not in the Sheet"].map((emp, i) => {
                  const match = emp.match(/(.*?) \(PAN: (.*?)\)/);
                  return match ? (
                    <tr key={i}>
                      <td>{match[1]}</td>
                      <td>{match[2]}</td>
                    </tr>
                  ) : (
                    <tr key={i}>
                      <td colSpan="2">{emp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {savedRemarks["Company Employees Who are not in the Sheet"] && (
            <div className="mt-3">
              <strong className="me-2">Remarks:</strong>
              <span>{savedRemarks["Company Employees Who are not in the Sheet"]}</span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* TDS Mismatch Employees */}
    {comparisonResult.data["TDS Mismatch Employees"]?.length > 0 && (
      <div className="card mb-3 border-warning">
        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <span>TDS Amount Mismatches ({comparisonResult.data["TDS Mismatch Employees"].length})</span>
          <button
            className="btn btn-sm btn-light"
            onClick={() => openRemarksModal("TDS Mismatch Employees")}
          >
            {savedRemarks["TDS Mismatch Employees"] ? (
              <span>Edit Remarks</span>
            ) : (
              <span>Add Remarks</span>
            )}
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Expected TDS Amount</th>
                  <th>Uploaded TDS Amount</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResult.data["TDS Mismatch Employees"].map((mismatch, i) => {
                  const match = mismatch.match(/(.*?) \(Expected: (.*?), Uploaded: (.*?)\)/);
                  return match ? (
                    <tr key={i}>
                      <td>{match[1]}</td>
                      <td>{match[2]}</td>
                      <td>{match[3]}</td>
                    </tr>
                  ) : (
                    <tr key={i}>
                      <td colSpan="3">{mismatch}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {savedRemarks["TDS Mismatch Employees"] && (
            <div className="mt-3">
              <strong className="me-2">Remarks:</strong>
              <span>{savedRemarks["TDS Mismatch Employees"]}</span>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Employees Not existed in company */}
    {comparisonResult.data["Employees Not existed in company"]?.length > 0 && (
      <div className="card mb-3 border-warning">
        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
          <span>Employees Not Found in Company Records ({comparisonResult.data["Employees Not existed in company"].length})</span>
          <button
            className="btn btn-sm btn-light me-2"
            onClick={() => setShowAddEmployee(true)}
          >
            <PlusCircle className="me-1 d-inline-flex align-items-center" />
            Add Employee
          </button>
        </div>
        <div className="card-body">
          <ul className="list-group">
            {comparisonResult.data["Employees Not existed in company"].map((emp, i) => (
              <li key={i} className="list-group-item">
                <span>{emp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}

    {/* TDS Already Updated Employees */}
    {comparisonResult.data["TDS Already Updated Employees"]?.length > 0 && (
      <div className="card mb-3 border-success">
        <div className="card-header bg-success text-white">
          TDS Already Updated Employees ({comparisonResult.data["TDS Already Updated Employees"].length})
        </div>
        <div className="card-body">
          <ul className="list-group">
            {comparisonResult.data["TDS Already Updated Employees"].map((emp, i) => (
              <li key={i} className="list-group-item">
                <span>{emp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}

    {/* Reupload Section */}
    <div className="mb-3">
      <button
        className="btn btn-outline-primary"
        onClick={handleReupload}
      >
        <ArrowClockwise className="me-2 d-inline-flex align-items-center" />
        Reupload
      </button>
    </div>

    {/* Submit for Processing */}
    <div className="d-flex justify-content-between mt-3">
      <div>
        {!allIssuesHaveRemarks() && (
          <div className="alert alert-warning">
            Please add remarks for all issues before submitting
          </div>
        )}
      </div>
      <div>
        <button
          className="btn btn-success"
          onClick={submitTDSForProcessing}
          disabled={isSubmitting || !allIssuesHaveRemarks()}
        >
          <CheckCircle className="me-2 d-inline-flex align-items-center" />
          {isSubmitting ? 'Submitting...' : 'Submit for Processing'}
        </button>
      </div>
    </div>
  </div>
)}
                </div>

                {/* Add New Employee Modal */}
                {showAddEmployee && (
                  <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Register New Employee for TDS</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowAddEmployee(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="row">
                            <div className="mb-3">
                              <label className="form-label">First Name*</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newEmployee.firstName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label">Last Name*</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newEmployee.lastName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Email ID</label>
                            <input
                              type="email"
                              className="form-control"
                              value={newEmployee.emailId}
                              onChange={(e) => setNewEmployee({ ...newEmployee, emailId: e.target.value })}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Mobile Number</label>
                            <input
                              type="tel"
                              className="form-control"
                              value={newEmployee.mobileNumber}
                              onChange={(e) => setNewEmployee({ ...newEmployee, mobileNumber: e.target.value })}
                              maxLength="10"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">PAN Number*</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newEmployee.panNo}
                              onChange={(e) => setNewEmployee({ ...newEmployee, panNo: e.target.value })}
                              maxLength="10"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Salary</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEmployee.employeeSalary}
                              onChange={(e) => setNewEmployee({ ...newEmployee, employeeSalary: e.target.value })}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">TDS Amount*</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEmployee.tds}
                              onChange={(e) => setNewEmployee({ ...newEmployee, tds: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowAddEmployee(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={registerNewEmployee}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Registering...' : 'Register Employee'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remarks Modal */}
                {showRemarksModal && currentRemarkItem && (
                  <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">Add Remarks for {currentRemarkItem}</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowRemarksModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <textarea
                              className="form-control"
                              rows="4"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder={`Enter remarks for ${currentRemarkItem}...`}
                            />
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowRemarksModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={saveRemarks}
                          >
                            Save Remarks
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default CompanyTDSSubmission;