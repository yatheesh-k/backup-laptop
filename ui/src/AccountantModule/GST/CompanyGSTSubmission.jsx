import React, { useState, useRef } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  GetCompanyInvoicesAPI,
  GSTComparingAPI,
  RegisterGSTAccountAPI,
  AddGSTResponseAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { Download, Upload, PlusCircle, CheckCircle, ArrowClockwise } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const CompanyGSTSubmission = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonFile, setComparisonFile] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [currentRemarkItem, setCurrentRemarkItem] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [savedRemarks, setSavedRemarks] = useState({
    "Company Customers Who are not in the Sheet": "",
    "GST Mismatch Customers": ""
  });
  const [fileName, setFileName] = useState("");
  const { employee } = useAuth();
  const companyId = employee?.companyId;

  const formRef = useRef(null);

  const downloadGSTDetailsExcel = async () => {
    setIsLoading(true);
    try {
      const response = await GetCompanyInvoicesAPI(companyId);
      
      // Convert the response data to Excel format
      const filteredData = response.data.data.map(item => ({
        "Customer Name": item.customer.customerName,
        "Customer GST No": item.customer.customerGstNo,
        "Invoice Number": item.invoice.invoiceNo,
        "Invoice Date": item.invoice.invoiceDate,
        "Total Amount": item.invoice.grandTotal,
        "subTotal": item.invoice.subTotal,
        "IGST Amount": item.invoice.igst || "0.00",
        "CGST Amount": item.invoice.cgst || "0.00",
        "SGST Amount": item.invoice.sgst || "0.00",
      }));

      const ws = XLSX.utils.json_to_sheet(filteredData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GST Invoices");
      XLSX.writeFile(wb, `GST_Invoices_Template.xlsx`);

      setInvoices(filteredData);
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
      "Company Customers Who are not in the Sheet": "",
      "GST Mismatch Customers": ""
    });
  };

  const compareGSTData = async () => {
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
      const response = await GSTComparingAPI(
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

  const submitGSTForProcessing = async () => {
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
      if (savedRemarks["Company Customers Who are not in the Sheet"] || 
          savedRemarks["GST Mismatch Customers"]) {
        const responseData = {
          month: selectedMonth,
          year: selectedYear,
          missingCustomers: savedRemarks["Company Customers Who are not in the Sheet"] || "N/A",
          gstMismatches: savedRemarks["GST Mismatch Customers"] || "N/A"
        };

        await AddGSTResponseAPI(responseData);
      }

      // Then submit for processing
      const response = await RegisterGSTAccountAPI(
        selectedMonth,
        selectedYear,
        comparisonFile
      );

      if (response.data && response.data.message === "Success") {
        toast.success("GST data submitted for processing successfully");
        setComparisonFile(null);
        setComparisonResult(null);
        setSelectedMonth("");
        setSelectedYear("");
        setSavedRemarks({
          "Company Customers Who are not in the Sheet": "",
          "GST Mismatch Customers": ""
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
    
    const hasMissingCustomerRemark = 
      comparisonResult.data["Company Customers Who are not in the Sheet"]?.length > 0 && 
      !savedRemarks["Company Customers Who are not in the Sheet"];
    
    const hasMismatchCustomerRemark = 
      comparisonResult.data["GST Mismatch Customers"]?.length > 0 && 
      !savedRemarks["GST Mismatch Customers"];
    
    return !hasMissingCustomerRemark && !hasMismatchCustomerRemark;
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.error?.message || "An error occurred";
    toast.error(errorMsg);
    console.error(error);
  };

  const handleReupload = () => {
    setComparisonResult(null);
    setSavedRemarks({
      "Company Customers Who are not in the Sheet": "",
      "GST Mismatch Customers": ""
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
              <strong>Company GST Submission</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">GST Submission</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  GST Management
                </h5>
              </div>
              <div className="card-body">
                {/* Step 1: Download Template */}
                <div className="mb-4">
                  <h5 className="mb-3">1. Download Company GST Invoices</h5>
                  <div className="mb-3">
                    <button
                      className="btn btn-primary"
                      onClick={downloadGSTDetailsExcel}
                      disabled={isLoading}
                    >
                      <Download className="me-2 d-inline-flex align-items-center" />
                      {isLoading ? 'Preparing...' : 'Download GST Invoices'}
                    </button>
                  </div>
                  <div className="alert alert-info">
                    <strong>Note:</strong> Download the Excel, make necessary changes, and upload for comparison.
                  </div>
                </div>

                {/* Step 2: Compare GST Data */}
                <div className="mb-4" ref={formRef}>
                  <h5>2. Compare GST Data</h5>
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
                          id="gstFileUpload"
                          style={{ display: 'none' }}
                        />
                        <label 
                          htmlFor="gstFileUpload" 
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
                        onClick={compareGSTData}
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

                      {/* Customers Not in Sheet (Company customers missing from uploaded file) */}
                      {comparisonResult.data["Company Customers Who are not in the Sheet"]?.length > 0 && (
                        <div className="card mb-3 border-danger">
                          <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                            <span>Customers Missing from Uploaded Sheet ({comparisonResult.data["Company Customers Who are not in the Sheet"].length})</span>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => openRemarksModal("Company Customers Who are not in the Sheet")}
                            >
                              {savedRemarks["Company Customers Who are not in the Sheet"] ? (
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
                                    <th>Customer Name</th>
                                    <th>GST Number</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comparisonResult.data["Company Customers Who are not in the Sheet"].map((customer, i) => (
                                    <tr key={i}>
                                      <td>{customer.customerName}</td>
                                      <td>{customer.customerGstNo}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {savedRemarks["Company Customers Who are not in the Sheet"] && (
                              <div className="mt-3">
                                <strong className="me-2">Remarks:</strong>
                                <span>{savedRemarks["Company Customers Who are not in the Sheet"]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customers Not in Company (Uploaded customers not in company records) */}
                      {comparisonResult.data["Customers Not existed in company"]?.length > 0 && (
                        <div className="card mb-3 border-warning">
                          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span>Customers Not Found in Company Records ({comparisonResult.data["Customers Not existed in company"].length})</span>
                            <div>
                              <button
                                className="btn btn-sm btn-light me-2"
                                onClick={() => {
                                  navigate("/customers/create");
                                }}
                              >
                                <PlusCircle className="me-1 d-inline-flex align-items-center" />
                                Create Customer
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={downloadGSTDetailsExcel}
                              >
                                <Download className="me-1 d-inline-flex align-items-center" />
                                Get Excel to Update
                              </button>
                            </div>
                          </div>
                          <div className="card-body">
                            <div className="alert alert-info mb-3">
                              <strong>Note:</strong> These customers are in your uploaded file but not in company records. 
                              You can either create them as new customers or remove them from your Excel file and reupload.
                            </div>
                            <div className="table-responsive">
                              <table className="table table-bordered">
                                <thead>
                                  <tr>
                                    <th>Customer Name</th>
                                    <th>GST Number</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comparisonResult.data["Customers Not existed in company"].map((customer, i) => (
                                    <tr key={i}>
                                      <td>{customer.customerName}</td>
                                      <td>{customer.customerGstNo}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* GST Mismatch Customers */}
                      {comparisonResult.data["GST Mismatch Customers"]?.length > 0 && (
                        <div className="card mb-3 border-warning">
                          <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span>GST Customer Mismatches ({comparisonResult.data["GST Mismatch Customers"].length})</span>
                            <button
                              className="btn btn-sm btn-light"
                              onClick={() => openRemarksModal("GST Mismatch Customers")}
                            >
                              {savedRemarks["GST Mismatch Customers"] ? (
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
                                    <th>Customer Name</th>
                                    <th>Expected GST No</th>
                                    <th>Uploaded GST No</th>
                                    <th>Expected State</th>
                                    <th>Uploaded State</th>
                                    <th>Expected State Code</th>
                                    <th>Uploaded State Code</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comparisonResult.data["GST Mismatch Customers"].map((mismatch, i) => (
                                    <tr key={i}>
                                      <td>{mismatch.customerName}</td>
                                      <td>{mismatch.expectedGstNo}</td>
                                      <td>{mismatch.uploadedGstNo}</td>
                                      <td>{mismatch.expectedState}</td>
                                      <td>{mismatch.uploadedState}</td>
                                      <td>{mismatch.expectedStateCode}</td>
                                      <td>{mismatch.uploadedStateCode}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {savedRemarks["GST Mismatch Customers"] && (
                              <div className="mt-3">
                                <strong className="me-2">Remarks:</strong>
                                <span>{savedRemarks["GST Mismatch Customers"]}</span>
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
                            onClick={submitGSTForProcessing}
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

export default CompanyGSTSubmission;
