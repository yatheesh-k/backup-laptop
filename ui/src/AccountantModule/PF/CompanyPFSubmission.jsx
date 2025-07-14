import React, { useState, useRef } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeePFDetailsGetAPI,
  EmployeePFComparingAPI,
  RegisterPFEmployeeAPI,
  SubmitPFForProcessingAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, Upload, PlusCircle, CheckCircle, XCircle, ArrowClockwise } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const CompanyPFSubmission = () => {
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
    uanNo: "",
    pfAmount: ""
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRemarkItem, setCurrentRemarkItem] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [savedRemarks, setSavedRemarks] = useState({});
  const [fileName, setFileName] = useState("");

  // Create a ref for the form section
  const formRef = useRef(null);

  // Download Excel template
  const downloadPFDetailsExcel = async () => {
    setIsLoading(true);
    try {
      const response = await EmployeePFDetailsGetAPI();
      const filteredData = response.data.data.map(emp => ({
        "Employee Name": `${emp.firstName} ${emp.lastName}`,
        "PAN No": emp.panNo,
        "UAN No": emp.uanNumber || "",
        "PF Amount": emp.pfAmount
      }));

      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PF Details");
      XLSX.writeFile(wb, `PF_Details_Template.xlsx`);

      setEmployees(filteredData);
      toast.success("Excel template downloaded successfully");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle comparison file upload
  const handleComparisonFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast.error("Please upload an Excel file (.xlsx)");
      return;
    }

    setComparisonFile(file);
    setFileName(file.name);
    setComparisonResult(null); // Clear previous comparison results
    setSavedRemarks({}); // Clear previous remarks
  };

  // Compare PF data
  const comparePFData = async () => {
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
      const response = await EmployeePFComparingAPI(
        selectedMonth,
        selectedYear,
        comparisonFile
      );

      setComparisonResult(response.data);
      setSavedRemarks({}); // Clear previous remarks when new comparison is done
      toast.success("Comparison completed");
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsComparing(false);
    }
  };

  // Register new employee
  const registerNewEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.panNo || !newEmployee.pfAmount) {
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
        uanNo: newEmployee.uanNo,
        pfAmount: newEmployee.pfAmount
      });

      if (response.data.success) {
        toast.success("Employee registered successfully");
        // Add to employees list without updating Excel
        const newEmployeeData = {
          "Employee Name": `${newEmployee.firstName} ${newEmployee.lastName}`,
          "PAN No": newEmployee.panNo,
          "UAN No": newEmployee.uanNo,
          "PF Amount": newEmployee.pfAmount
        };
        
        setEmployees(prevEmployees => [...prevEmployees, newEmployeeData]);

        // Remove this employee from "Employees Not existed in company" list
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

        // Reset form
        setNewEmployee({
          firstName: "",
          lastName: "",
          emailId: "",
          mobileNumber: "",
          panNo: "",
          uanNo: "",
          pfAmount: ""
        });
        setShowAddEmployee(false);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit PF for processing
  const submitPFForProcessing = async () => {
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
      const response = await SubmitPFForProcessingAPI(
        selectedMonth,
        selectedYear,
        comparisonFile
      );

      if (response.data && response.data.message === "Success") {
        toast.success("Provident Fund submitted for processing successfully");
        // Reset form
        setComparisonFile(null);
        setComparisonResult(null);
        setSelectedMonth("");
        setSelectedYear("");
        setSavedRemarks({});
        setFileName("");
      } else {
        toast.error("Submission completed but with unexpected response");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open remarks modal
  const openRemarksModal = (item, category) => {
    setCurrentRemarkItem({ item, category });
    setRemarks(savedRemarks[`${category}-${item}`] || "");
    setShowRemarksModal(true);
  };

  // Save remarks
  const saveRemarks = () => {
    if (!currentRemarkItem) return;
    
    const key = `${currentRemarkItem.category}-${currentRemarkItem.item}`;
    setSavedRemarks(prev => ({
      ...prev,
      [key]: remarks
    }));
    
    setShowRemarksModal(false);
    toast.success("Remarks saved successfully");
  };

  // Check if all issues have remarks
  const allIssuesHaveRemarks = () => {
    if (!comparisonResult) return false;
    
    // Check if there's a remark for each category (not each item)
    const hasMissingRemark = comparisonResult.data["Company Employees Who are not in the Sheet"]?.length > 0 && 
      !savedRemarks["Company Employees Who are not in the Sheet-remark"];
    const hasNotExistedRemark = comparisonResult.data["Employees Not existed in company"]?.length > 0 && 
      !savedRemarks["Employees Not existed in company-remark"];
    const hasMismatchRemark = comparisonResult.data["PF Mismatch Employees"]?.length > 0 && 
      !savedRemarks["PF Mismatch Employees-remark"];
    
    return !hasMissingRemark && !hasNotExistedRemark && !hasMismatchRemark;
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  // Handle reupload - scroll to form and clear comparison results
  const handleReupload = () => {
    setComparisonResult(null);
    setSavedRemarks({});
    setFileName("");
    setComparisonFile(null);
    
    // Scroll to the form section
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
                {/* Step 1: Download Template */}
                <div className="mb-4">
                  <h5>1. Download Employee Provident Fund Details</h5>
                  <div className="mb-3">
                    <button
                      className="btn btn-primary"
                      onClick={downloadPFDetailsExcel}
                      disabled={isLoading}
                    >
                      <Download className="me-2 d-inline-flex align-items-center" />
                      {isLoading ? 'Preparing...' : 'Download PF Details'}
                    </button>
                  </div>
                  <div className="alert alert-info">
                    <strong>Note:</strong> Download the Excel, make necessary changes, and upload for comparison.
                  </div>
                </div>

                {/* Step 2: Compare PF Data */}
                <div className="mb-4" ref={formRef}>
                  <h5>2. Compare Provident Fund Data</h5>
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
                          id="pfFileUpload"
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor="pfFileUpload" 
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
                        onClick={comparePFData}
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

                      {/* Employees Not in Sheet (Company employees missing from uploaded file) */}
                      {comparisonResult.data["Company Employees Who are not in the Sheet"]?.length > 0 && (
                        <div className="card mb-3 border-danger">
                          <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                            <span>Employees Missing from Uploaded Sheet ({comparisonResult.data["Company Employees Who are not in the Sheet"].length})</span>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => openRemarksModal("remark", "Company Employees Who are not in the Sheet")}
                            >
                              {savedRemarks["Company Employees Who are not in the Sheet-remark"] ? (
                                <span>Edit Remarks</span>
                              ) : (
                                <span>Add Remarks</span>
                              )}
                            </button>
                          </div>
                          <div className="card-body">
                            <ul className="list-group">
                              {comparisonResult.data["Company Employees Who are not in the Sheet"].map((emp, i) => (
                                <li key={i} className="list-group-item">
                                  <span>{emp}</span>
                                </li>
                              ))}
                            </ul>
                            {savedRemarks["Company Employees Who are not in the Sheet-remark"] && (
                              <div className="mt-3">
                                <strong className="me-2">Remarks:</strong>
                                <span>{savedRemarks["Company Employees Who are not in the Sheet-remark"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Employees Not in Company (Uploaded employees not in company records) */}
                      {comparisonResult.data["Employees Not existed in company"]?.length > 0 && (
                        <div className="card mb-3 border-warning">
                          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span>Employees Not Found in Company Records ({comparisonResult.data["Employees Not existed in company"].length})</span>
                            <div>
                              <button
                                className="btn btn-sm btn-light me-2"
                                onClick={() => setShowAddEmployee(true)}
                              >
                                <PlusCircle className="me-1 d-inline-flex align-items-center" />
                                Add Employee
                              </button>
                              <button
                                className="btn btn-sm btn-light"
                                onClick={() => openRemarksModal("remark", "Employees Not existed in company")}
                              >
                                {savedRemarks["Employees Not existed in company-remark"] ? (
                                  <span>Edit Remarks</span>
                                ) : (
                                  <span>Add Remarks</span>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            <ul className="list-group">
                              {comparisonResult.data["Employees Not existed in company"].map((emp, i) => (
                                <li key={i} className="list-group-item">
                                  <span>{emp}</span>
                                </li>
                              ))}
                            </ul>
                            {savedRemarks["Employees Not existed in company-remark"] && (
                              <div className="mt-3">
                                <strong className="me-2">Remarks:</strong>
                                <span>{savedRemarks["Employees Not existed in company-remark"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* PF Mismatch Employees */}
                      {comparisonResult.data["PF Mismatch Employees"]?.length > 0 && (
                        <div className="card mb-3 border-warning">
                          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span>PF Amount Mismatches ({comparisonResult.data["PF Mismatch Employees"].length})</span>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => openRemarksModal("remark", "PF Mismatch Employees")}
                            >
                              {savedRemarks["PF Mismatch Employees-remark"] ? (
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
                                    <th>Expected PF Amount</th>
                                    <th>Uploaded PF Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comparisonResult.data["PF Mismatch Employees"].map((mismatch, i) => {
                                    // Assuming mismatch is in format: "Name (Expected: X, Uploaded: Y)"
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
                            {savedRemarks["PF Mismatch Employees-remark"] && (
                              <div className="mt-3">
                                <strong className="me-2">Remarks:</strong>
                                <span>{savedRemarks["PF Mismatch Employees-remark"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Reupload Section */}
                      <div className="mb-3">
                        <button
                          className="btn btn-outline-primary"
                          onClick={handleReupload}
                        >
                          <ArrowClockwise className="me-2" />
                          Update & Reupload
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
                            onClick={submitPFForProcessing}
                            disabled={isSubmitting || !allIssuesHaveRemarks()}
                          >
                            <CheckCircle className="me-2" />
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
                          <h5 className="modal-title">Register New Employee for PF</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowAddEmployee(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label className="form-label">First Name*</label>
                              <input
                                type="text"
                                className="form-control"
                                value={newEmployee.firstName}
                                onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                              />
                            </div>
                            <div className="col-md-6 mb-3">
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
                            <label className="form-label">UAN Number</label>
                            <input
                              type="text"
                              className="form-control"
                              value={newEmployee.uanNo}
                              onChange={(e) => setNewEmployee({ ...newEmployee, uanNo: e.target.value })}
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">PF Amount*</label>
                            <input
                              type="number"
                              className="form-control"
                              value={newEmployee.pfAmount}
                              onChange={(e) => setNewEmployee({ ...newEmployee, pfAmount: e.target.value })}
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
                          <h5 className="modal-title">Add Remarks</h5>
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setShowRemarksModal(false)}
                          ></button>
                        </div>
                        <div className="modal-body">
                          <div className="mb-3">
                            <label className="form-label">
                              <strong>{currentRemarkItem.category}</strong>
                            </label>
                            <textarea
                              className="form-control"
                              rows="4"
                              value={remarks}
                              onChange={(e) => setRemarks(e.target.value)}
                              placeholder="Enter your remarks here..."
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

export default CompanyPFSubmission;