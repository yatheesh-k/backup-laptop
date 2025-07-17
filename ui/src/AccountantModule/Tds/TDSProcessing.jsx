import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  GetPFForMonthAndYearAPI,
  AddTDSReceiptsAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download, Upload } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const TDSProcessing = () => {
  const { register, handleSubmit,trigger,setValue, formState: { errors }, reset } = useForm();
  const [approvalMonth, setApprovalMonth] = useState("");
  const [approvalYear, setApprovalYear] = useState("");
  const [approvalList, setApprovalList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [acknowledgementFile, setAcknowledgementFile] = useState(null);

   
  const noTrailingSpaces = (value, fieldName) => {
    // Check if the value ends with a space
    if (value.endsWith(' ')) {
      return "Spaces are not allowed at the end";
    }

    // Check if the value is less than 3 characters long
    if (value.length < 3) {
      return "Minimum 3 characters Required";
    }
    // If no error, return true
    return true;
  };
  const handleInputChange = (e, fieldName) => {
    let value = e.target.value.trimStart().replace(/ {2,}/g, " "); // Remove leading spaces and extra spaces

    if (fieldName !== "email") {
      value = value.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter after space
    }

    setValue(fieldName, value);
    trigger(fieldName); // Trigger validation
  };

  const preventInvalidInput = (e, type) => {
    const key = e.key;

    // Prevent non-numeric input for amount fields
    if (
      type === "numeric" &&
      (!/^[0-9.]$/.test(key) || (key === '.' && e.target.value.includes('.')))
    ) {
      e.preventDefault();
    }


    // Prevent special characters in receipt number except hyphens and slashes
    if (type === "receiptNumber" && /[^a-zA-Z0-9/-]/.test(key)) {
      e.preventDefault();
    }
  };

  const validateField = (value, type) => {
    switch (type) {
      case "amount":
        return (
          /^[0-9]+(\.[0-9]{1,2})?$/.test(value) ||
          "Enter a valid amount (e.g., 1000 or 1000.50)"
        );
      case "receiptNumber":
        return (
          /^[a-zA-Z0-9/-]+$/.test(value) ||
          "Only letters, numbers, hyphens and slashes allowed"
        );
      case "date":
        const selectedDate = new Date(value);
        const currentDate = new Date();
        return (
          selectedDate <= currentDate ||
          "Date cannot be in the future"
        );
      case "file":
        if (!value) return "File is required";
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        return (
          validTypes.includes(value.type) ||
          "Only PDF, JPG, and PNG files are allowed"
        );
      default:
        return true;
    }
  };

  // Calculate total TDS amount
  const calculateTotalTDS = () => {
    return approvalList.reduce((total, emp) => {
      const tdsAmount = parseFloat(emp.tdsAmount) || 0;
      return total + tdsAmount;
    }, 0);
  };
  // Fetch approval list
  const fetchApprovalList = async () => {
    if (!approvalMonth || !approvalYear) {
      toast.error("Please select both month and year");
      return;
    }

    setIsFetching(true);
    try {
      const response = await GetPFForMonthAndYearAPI(approvalMonth, approvalYear);
      if (response && response.data) {
        setApprovalList(response.data.data || []);
        toast.success("Approval list fetched successfully");
      } else {
        toast.warning("No data found for the selected month and year");
        setApprovalList([]);
      }
    } catch (error) {
      handleApiError(error);
      setApprovalList([]);
    } finally {
      setIsFetching(false);
    }
  };

  // Upload acknowledgement with all required TDS receipt fields
  const uploadAcknowledgement = async (data) => {
    if (!approvalMonth || !approvalYear) {
      toast.error("Please select month and year first");
      return;
    }

    setIsUploading(true);
    try {
      const response = await AddTDSReceiptsAPI({
        month: approvalMonth,
        year: approvalYear,
        tdsTotalAmount: data.tdsTotalAmount,
        tdsReceiptNumber: data.tdsReceiptNumber,
        tdsReceiptDate: data.tdsReceiptDate,
        file: data.file[0], // pass File object
      });

      if (response.data.success) {
        toast.success("TDS acknowledgement uploaded successfully");
        reset();
        setAcknowledgementFile(null);
        setApprovalList([]);
        setApprovalMonth("");
        setApprovalYear("");
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApiError = (error) => {
    const errorMsg = error.response?.data?.message ||
      error.response?.data?.error?.message ||
      error.message ||
      "An error occurred";
    toast.error(errorMsg);
    console.error("API Error:", error);
  };

  // Download Excel
  const downloadApprovalListExcel = () => {
    if (approvalList.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const formattedData = approvalList.map(emp => ({
      "Employee Name": emp.employeeName,
      "PAN": (emp.panNo),
      "TDS Amount": emp.tdsAmount ? (emp.tdsAmount) : "N/A",
      "Month": emp.month,
      "Year": emp.year,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TDS Approval List");
    XLSX.writeFile(wb, `TDS_Approval_${approvalMonth}_${approvalYear}.xlsx`);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Accounts TDS Processing</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">TDS Processing</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  TDS Payment Processing
                </h5>
              </div>
              <div className="card-body">
                {/* Step 1: Fetch Approved List */}
                <div className="mb-4">
                  <h5 className="mb-3">1. Fetch Approved TDS List</h5>
                  <div className="row g-3 align-items-end mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Select Month</label>
                      <select
                        className="form-select"
                        value={approvalMonth}
                        onChange={(e) => setApprovalMonth(e.target.value)}
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
                        value={approvalYear}
                        onChange={(e) => setApprovalYear(e.target.value)}
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
                        onClick={fetchApprovalList}
                        disabled={!approvalMonth || !approvalYear || isFetching}
                      >
                        {isFetching ? 'Fetching...' : 'Fetch List'}
                      </button>
                    </div>
                  </div>

                  {approvalList.length > 0 && (
                    <>
                      <div className="table-responsive mb-3">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Employee Name</th>
                              <th>PAN</th>
                              <th>TDS Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalList.map((emp, i) => (
                              <tr key={i}>
                                <td>{emp.employeeName}</td>
                                <td>{(emp.panNo)}</td>
                                <td>{emp.tdsAmount ? (emp.tdsAmount) : "N/A"}</td>
                              </tr>
                            ))}
                            {approvalList.length > 0 && (
                              <tr className="fw-bold">
                                <td colSpan="2" className="text-end">Total TDS Amount</td>
                                <td>{calculateTotalTDS().toFixed(2)}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="d-flex justify-content-between mb-4">
                        <button
                          className="btn btn-outline-primary"
                          onClick={downloadApprovalListExcel}
                        >
                          <Download className="me-2 d-inline-flex align-items-center" />
                          Download TDS List
                        </button>

                        {/* <a
                          href="https://tdspro.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info"
                        >
                          Proceed to TDS Portal
                        </a> */}
                      </div>
                    </>
                  )}
                </div>

                {/* Step 2: Updated Acknowledgement Upload Form */}
                {approvalList.length > 0 && (
                  <div>
                    <h5 className="mb-3">2. Upload Payment Acknowledgement</h5>
                    <form onSubmit={handleSubmit(uploadAcknowledgement)}>
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="form-label">TDS Total Amount</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("tdsTotalAmount", {
                              required: "TDS Total Amount is required",
                              validate: (value) => validateField(value, "amount"),
                              maxLength: {
                                value: 10,
                                message: "TDS Amount must not be exceed 10 digits.",
                              },
                            })}
                            onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                            onChange={(e) => handleInputChange(e, "tdsTotalAmount")}
                          />
                          {errors.tdsTotalAmount && (
                            <p className="errorMsg">
                              {errors.tdsTotalAmount.message}
                            </p>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">TDS Receipt Number</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("tdsReceiptNumber", {
                             required: "Provident Fund Receipt Number is required",
                              maxLength: {
                                value: 10,
                                message: "PF Receipt Number must not be exceed 10 digits.",
                              },
                              validate: (value) => {
                                return noTrailingSpaces(value, "tdsReceiptNumber") || validateField(value, "receiptNumber");
                              }
                            })}
                            onKeyPress={(e) => preventInvalidInput(e, "receiptNumber")}
                            onChange={(e) => handleInputChange(e, "tdsReceiptNumber")}
                          />
                          {errors.tdsReceiptNumber && (
                            <p className="errorMsg">
                              {errors.tdsReceiptNumber.message}
                            </p>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">TDS Receipt Date</label>
                          <input
                            type="date"
                            className="form-control"
                            {...register("tdsReceiptDate", {
                              required: "TDS Receipt Date is required",
                              validate: (value) => validateField(value, "date"),
                            })}
                          />
                          {errors.tdsReceiptDate && (
                            <div className="text-danger small mt-1">
                              {errors.tdsReceiptDate.message}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Acknowledgement File</label>
                          <input
                            type="file"
                            className="form-control"
                            accept=".pdf,.jpg,.png"
                            {...register("file", {
                              required: "Please upload acknowledgement file",
                              validate: (value) => validateField(value, "file"),
                            })}
                            onChange={(e) => setAcknowledgementFile(e.target.files[0])}
                          />
                          {errors.file && (
                            <div className="text-danger small mt-1">
                              {errors.file.message}
                            </div>
                          )}
                          <div className="form-text">
                            Upload the payment acknowledgement from TDS portal (PDF or image)
                          </div>
                        </div>

                        <div className="col-md-12 mt-3">
                          <button
                            type="submit"
                            className="btn btn-success"
                            disabled={isUploading || !acknowledgementFile}
                          >
                            {isUploading ? 'Uploading...' : 'Upload Acknowledgement'}
                          </button>
                        </div>
                      </div>
                    </form>
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

export default TDSProcessing;