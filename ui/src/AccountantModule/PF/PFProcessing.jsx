import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  GetPFForMonthAndYearAPI,
  AddPFReceiptsAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download, Upload } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const PFProcessing = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [approvalMonth, setApprovalMonth] = useState("");
  const [approvalYear, setApprovalYear] = useState("");
  const [approvalList, setApprovalList] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [acknowledgementFile, setAcknowledgementFile] = useState(null);


  const calculateTotalPF = () => {
    return approvalList.reduce((total, emp) => {
      const pfAmount = parseFloat(emp.providentFund) || 0;
      return total + pfAmount;
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

  // Upload acknowledgement with all required PF receipt fields
  const uploadAcknowledgement = async (data) => {
    if (!approvalMonth || !approvalYear) {
      toast.error("Please select month and year first");
      return;
    }

    setIsUploading(true);
    try {
      const response = await AddPFReceiptsAPI({
        month: approvalMonth,
        year: approvalYear,
        pfTotalAmount: data.pfTotalAmount,
        pfReceiptNumber: data.pfReceiptNumber,
        pfReceiptDate: data.pfReceiptDate,
        file: data.file[0], // pass File object
      });

      if (response.data.success) {
        toast.success("Provident Fund acknowledgement uploaded successfully");
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

  // Download Excel (unchanged)
  const downloadApprovalListExcel = () => {
    if (approvalList.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const formattedData = approvalList.map(emp => ({
      "Employee Name": emp.employeeName,
      "UAN Number": (emp.uanNo),
      "PAN": (emp.panNo),
      "Provident Fund": emp.providentFund ? (emp.providentFund) : "N/A",
      "Month": emp.month,
      "Year": emp.year,
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PF Approval List");
    XLSX.writeFile(wb, `PF_Approval_${approvalMonth}_${approvalYear}.xlsx`);
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Accounts Provident Fund Processing</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">Provident Fund Processing</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Provident Fund Payment Processing
                </h5>
              </div>
              <div className="card-body">
                {/* Step 1: Fetch Approved List */}
                <div className="mb-4">
                  <h5 className="mb-3">1. Fetch Approved Provident Fund List</h5>
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
                              <th>UAN Number</th>
                              <th>PAN</th>
                              <th>Provident Fund Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalList.map((emp, i) => (
                              <tr key={i}>
                                <td>{emp.employeeName}</td>
                                <td>{(emp.uanNo)}</td>
                                <td>{(emp.panNo)}</td>
                                <td>{emp.providentFund ? (emp.providentFund) : "N/A"}</td>
                              </tr>
                            ))}
                            {approvalList.length > 0 && (
                              <tr className="fw-bold">
                                <td colSpan="3" className="text-end">Total Provident Fund Amount</td>
                                <td>{calculateTotalPF().toFixed(2)}</td>
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
                          Download Approval List
                        </button>

                        <a
                          href="https://unifiedportal-epfo.epfindia.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-info"
                        >
                          Proceed to EPFO Portal
                        </a>
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
                          <label className="form-label">Provident Fund Total Amount</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("pfTotalAmount", {
                              required: "PF Total Amount is required",
                              pattern: {
                                value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                message: "Enter a valid amount"
                              }
                            })}
                          />
                          {errors.pfTotalAmount && (
                            <div className="text-danger small mt-1">
                              {errors.pfTotalAmount.message}
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Provident Fund Receipt Number</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("pfReceiptNumber", {
                              required: "Provident Fund Receipt Number is required"
                            })}
                          />
                          {errors.pfReceiptNumber && (
                            <div className="text-danger small mt-1">
                              {errors.pfReceiptNumber.message}
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Provident Fund Receipt Date</label>
                          <input
                            type="date"
                            className="form-control"
                            {...register("pfReceiptDate", {
                              required: "Provident Fund Receipt Date is required"
                            })}
                          />
                          {errors.pfReceiptDate && (
                            <div className="text-danger small mt-1">
                              {errors.pfReceiptDate.message}
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
                              required: "Please upload acknowledgement file"
                            })}
                            onChange={(e) => setAcknowledgementFile(e.target.files[0])}
                          />
                          {errors.file && (
                            <div className="text-danger small mt-1">
                              {errors.file.message}
                            </div>
                          )}
                          <div className="form-text">
                            Upload the payment acknowledgement from EPFO portal (PDF or image)
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

export default PFProcessing;