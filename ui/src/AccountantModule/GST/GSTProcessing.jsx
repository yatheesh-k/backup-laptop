import React, { useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
    GetGSTAccountsByYearAndMonthAPI,
    AddGSTReceiptsAPI
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download, Upload } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const GSTProcessing = () => {
    const { register, trigger, setValue, handleSubmit, formState: { errors }, reset } = useForm();
    const [approvalMonth, setApprovalMonth] = useState("");
    const [approvalYear, setApprovalYear] = useState("");
    const [approvalList, setApprovalList] = useState([]);
    const [isFetching, setIsFetching] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [acknowledgementFile, setAcknowledgementFile] = useState(null);

    const noTrailingSpaces = (value, fieldName) => {
        if (value.endsWith(' ')) {
            return "Spaces are not allowed at the end";
        }
        if (value.length < 3) {
            return "Minimum 3 characters Required";
        }
        return true;
    };

    const handleInputChange = (e, fieldName) => {
        let value = e.target.value.trimStart().replace(/ {2,}/g, " ");
        if (fieldName !== "email") {
            value = value.replace(/\b\w/g, (char) => char.toUpperCase());
        }
        setValue(fieldName, value);
        trigger(fieldName);
    };

    const preventInvalidInput = (e, type) => {
        const key = e.key;
        if (
            type === "numeric" &&
            (!/^[0-9.]$/.test(key) || (key === '.' && e.target.value.includes('.')))
        ) {
            e.preventDefault();
        }
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


    const calculateTotalTax = (type) => {
        return approvalList.reduce((total, invoice) => {
            const taxAmount = parseFloat(invoice[type]) || 0;
            return total + taxAmount;
        }, 0);
    };

    const calculateTotalSubTotal = () => {
        return approvalList.reduce((total, invoice) => {
            const amount = parseFloat(invoice.subTotal) || 0;
            return total + amount;
        }, 0);
    };

    const calculateTotalInvoiceAmount = () => {
        return approvalList.reduce((total, invoice) => {
            const amount = parseFloat(invoice.totalAmount) || 0;
            return total + amount;
        }, 0);
    };

    const fetchApprovalList = async () => {
        if (!approvalMonth || !approvalYear) {
            toast.error("Please select both month and year");
            return;
        }

        setIsFetching(true);
        try {
            const response = await GetGSTAccountsByYearAndMonthAPI(approvalMonth, approvalYear);

            const gstData = response?.data?.data;

            if (Array.isArray(gstData) && gstData.length > 0) {
                setApprovalList(gstData);
                toast.success("GST approval list fetched successfully");
            } else {
                toast.warning("No GST data found for the selected month and year");
                setApprovalList([]);
            }
        } catch (error) {
            handleApiError(error);
            setApprovalList([]);
        } finally {
            setIsFetching(false);
        }
    };


    const uploadAcknowledgement = async (data) => {
        if (!approvalMonth || !approvalYear) {
            toast.error("Please select month and year first");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("month", approvalMonth);
            formData.append("year", approvalYear);
            formData.append("gstTotalAmount", data.gstTotalAmount);
            formData.append("gstReceiptNumber", data.gstReceiptNumber);
            formData.append("gstReceiptDate", data.gstReceiptDate);
            formData.append("file", data.file[0]);

            // To see all entries in FormData (since FormData isn't directly console.log-able)
            for (let [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const response = await AddGSTReceiptsAPI(formData);

            if (response.data.success) {
                toast.success("GST payment acknowledgement uploaded successfully");
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

    const downloadApprovalListExcel = () => {
        if (approvalList.length === 0) {
            toast.warning("No GST data to export");
            return;
        }

        const formattedData = approvalList.map(invoice => ({
            "Customer Name": invoice.customerName,
            "Customer GST No": invoice.customerGstNo || "N/A",
            "Invoice Number": invoice.invoiceNumber,
            "Invoice Date": invoice.invoiceDate,
            "Total Amount": invoice.totalAmount ? parseFloat(invoice.totalAmount).toFixed(2) : "N/A",
            "Sub Total": invoice.subTotal ? parseFloat(invoice.subTotal).toFixed(2) : "N/A",
            "IGST": invoice.igst ? parseFloat(invoice.igst).toFixed(2) : "0.00",
            "CGST": invoice.cgst ? parseFloat(invoice.cgst).toFixed(2) : "0.00",
            "SGST": invoice.sgst ? parseFloat(invoice.sgst).toFixed(2) : "0.00",
            "Month": invoice.month,
            "Year": invoice.year,
        }));

        const ws = XLSX.utils.json_to_sheet(formattedData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "GST Approval List");
        XLSX.writeFile(wb, `GST_Approval_${approvalMonth}_${approvalYear}.xlsx`);
    };

    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3">
                            <strong>Accounts GST Processing</strong>
                        </h1>
                    </div>
                    <div className="col-auto" style={{ paddingBottom: "20px" }}>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <Link to="/main" className="custom-link">Home</Link>
                                </li>
                                <li className="breadcrumb-item active">Finance</li>
                                <li className="breadcrumb-item active">GST Processing</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0">
                                    GST Payment Processing
                                </h5>
                            </div>
                            <div className="card-body">
                                {/* Step 1: Fetch Approved List */}
                                <div className="mb-4">
                                    <h5 className="mb-3">1. Fetch Approved GST List</h5>
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
                                                            <th>Customer Name</th>
                                                            <th>GST No</th>
                                                            <th>Invoice Number</th>
                                                            <th>Invoice Date</th>
                                                            <th>Sub Total</th>
                                                            <th>Total Amount</th>
                                                            <th>IGST</th>
                                                            <th>CGST</th>
                                                            <th>SGST</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {approvalList.map((invoice, i) => (
                                                            <tr key={i}>
                                                                <td>{invoice.customerName}</td>
                                                                <td>{invoice.customerGstNo || "N/A"}</td>
                                                                <td>{invoice.invoiceNumber}</td>
                                                                <td>{invoice.invoiceDate}</td>
                                                                <td>{parseFloat(invoice.subTotal).toFixed(2)}</td>
                                                                <td>{parseFloat(invoice.totalAmount).toFixed(2)}</td>
                                                                <td>{parseFloat(invoice.igst || 0).toFixed(2)}</td>
                                                                <td>{parseFloat(invoice.cgst || 0).toFixed(2)}</td>
                                                                <td>{parseFloat(invoice.sgst || 0).toFixed(2)}</td>
                                                            </tr>
                                                        ))}
                                                        {approvalList.length > 0 && (
                                                            <>
                                                                <tr className="fw-bold">
                                                                    <td colSpan="4" className="text-end">Totals</td>
                                                                    <td>{calculateTotalSubTotal().toFixed(2)}</td>
                                                                    <td>{calculateTotalInvoiceAmount().toFixed(2)}</td>
                                                                    <td>{calculateTotalTax("igst").toFixed(2)}</td>
                                                                    <td>{calculateTotalTax("cgst").toFixed(2)}</td>
                                                                    <td>{calculateTotalTax("sgst").toFixed(2)}</td>
                                                                </tr>
                                                            </>
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
                                                    Download GST List
                                                </button>

                                                <a
                                                    href="https://www.gst.gov.in/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-info"
                                                >
                                                    Proceed to GST Portal
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
                                                    <label className="form-label">GST Total Amount</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        {...register("gstTotalAmount", {
                                                            required: "GST Total Amount is required",
                                                            validate: (value) => validateField(value, "amount"),
                                                            maxLength: {
                                                                value: 10,
                                                                message: "GST Amount must not exceed 10 digits.",
                                                            },
                                                        })}
                                                        onKeyPress={(e) => preventInvalidInput(e, "numeric")}
                                                        onChange={(e) => handleInputChange(e, "gstTotalAmount")}
                                                    />
                                                    {errors.gstTotalAmount && (
                                                        <p className="errorMsg">
                                                            {errors.gstTotalAmount.message}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">GST Receipt Number</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        {...register("gstReceiptNumber", {
                                                            required: "GST Receipt Number is required",
                                                            maxLength: {
                                                                value: 10,
                                                                message: "GST Receipt Number must not exceed 10 digits.",
                                                            },
                                                            validate: (value) => {
                                                                return noTrailingSpaces(value, "gstReceiptNumber") || validateField(value, "receiptNumber");
                                                            }
                                                        })}
                                                        onKeyPress={(e) => preventInvalidInput(e, "receiptNumber")}
                                                        onChange={(e) => handleInputChange(e, "gstReceiptNumber")}
                                                    />
                                                    {errors.gstReceiptNumber && (
                                                        <p className="errorMsg">
                                                            {errors.gstReceiptNumber.message}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">GST Receipt Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        {...register("gstReceiptDate", {
                                                            required: "GST Receipt Date is required",
                                                            validate: (value) => validateField(value, "date"),
                                                        })}
                                                    />
                                                    {errors.gstReceiptDate && (
                                                        <p className="errorMsg">
                                                            {errors.gstReceiptDate.message}
                                                        </p>
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
                                                        })}
                                                        onChange={(e) => setAcknowledgementFile(e.target.files[0])}
                                                    />
                                                    {errors.file && (
                                                        <p className="errorMsg">
                                                            {errors.file.message}
                                                        </p>
                                                    )}
                                                    <div className="form-text">
                                                        Upload the payment acknowledgement from GST portal (PDF or image)
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

export default GSTProcessing;