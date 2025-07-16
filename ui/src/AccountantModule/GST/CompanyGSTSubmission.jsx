import React, { useRef, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import { Link } from 'react-router-dom';
import { ArrowClockwise, Download, Upload } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

// ✅ Static original invoice data
export const invoiceData = [
  {
    invoiceDate: "2025-06-18",
    invoiceNumber: "202526003",
    customerName: "Rakesh",
    customerGst: "36AAEPM1234C1Z5",
    subTotal: 9175680,
    cGstAmount: 825811.00,
    sGstAmount: 825811.00,
    iGstAmount: 0.00,
    totalAmount: 10575360,
  },
  {
    invoiceDate: "2025-06-28",
    invoiceNumber: "202526004",
    customerName: "Rakesh",
    customerGst: "27AAEPM1234C1Z5",
    subTotal: 79331.20,
    cGstAmount: 6050.72,
    sGstAmount: 6050.72,
    iGstAmount: 0.00,
    totalAmount: 91433.12,
  }
];

// ✅ Simulated uploaded Excel data with mismatches
const uploadedExcelData = [
  {
    invoiceNumber: "202526003",
    invoiceDate: "2025-06-18",
    customerName: "Rakesh",
    customerGst: "27AAEPM1234C1Z5", // GST mismatch
    totalAmount: 10575360
  },
  {
    invoiceNumber: "202526004",
    invoiceDate: "2025-06-28",
    customerName: "Rakesh",
    customerGst: "27AAEPM1234C1Z5",
    totalAmount: 91433.12
  },
  {
    invoiceNumber: "202526004", // Duplicate
    invoiceDate: "2025-06-28",
    customerName: "Rakesh",
    customerGst: "27AAEPM1234C1Z5",
    totalAmount: 91433.12
  }
];

const CompanyGSTSubmission = () => {
  const [comparisonFile, setComparisonFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [comparisonResult, setComparisonResult] = useState(null);
  const formRef = useRef(null);

  const downloadPTDetailsExcel = () => {
    const exportData = invoiceData.map(emp => ({
      "Invoice Number": emp.invoiceNumber,
      "Invoice Date": emp.invoiceDate,
      "Customer Name": emp.customerName,
      "Customer Gst": emp.customerGst,
      "Total Amount": emp.totalAmount,
      "SGST Amount": emp.sGstAmount,
      "CGST Amount": emp.cGstAmount,
      "IGST Amount": emp.iGstAmount,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoice Details");
    XLSX.writeFile(wb, `Invoice_Details.xlsx`);
    toast.success("Excel template downloaded");
  };

  const handleComparisonFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.xlsx')) {
      toast.error("Please upload a valid .xlsx file");
      return;
    }

    setFileName(file.name);
    setComparisonFile(file);
    runComparison(uploadedExcelData); // Use static data directly
  };

  const runComparison = (uploadedData) => {
    const gstMismatches = [];
    const duplicateInvoices = [];
    const seenInvoices = new Set();

    uploadedData.forEach((row) => {
      const matched = invoiceData.find(inv => inv.invoiceNumber === row.invoiceNumber);

      if (matched && matched.customerGst !== row.customerGst) {
        gstMismatches.push({
          invoiceNumber: row.invoiceNumber,
          expectedGst: matched.customerGst,
          uploadedGst: row.customerGst
        });
      }

      if (seenInvoices.has(row.invoiceNumber)) {
        duplicateInvoices.push(row.invoiceNumber);
      } else {
        seenInvoices.add(row.invoiceNumber);
      }
    });

    setComparisonResult({
      gstMismatches,
      duplicateInvoices,
      remarks: {
        gstMismatches: "",
        duplicateInvoices: ""
      }
    });
  };

  const handleReupload = () => {
    setComparisonFile(null);
    setFileName("");
    setComparisonResult(null);
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
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">GST</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">GST</h5>
          </div>
          <div className="card-body">
            {/* Download */}
            <div className="mb-4">
              <h5>1. Download Invoice Details</h5>
              <button className="btn btn-primary d-flex align-items-center mt-2" onClick={downloadPTDetailsExcel}>
                <Download className="me-2" />
                Download Invoice Details
              </button>
              <div className="alert alert-info mt-2">
                <strong>Note:</strong> Download the Excel, make changes, then upload.
              </div>
            </div>

            {/* Upload */}
            <div className="mb-4" ref={formRef}>
              <h5>2. Compare Invoice Data</h5>
              <div className="row g-3 align-items-end mb-2 mt-1">
                <div className="col-md-3">
                  <label className="form-label">Select Month</label>
                  <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                      return <option key={i} value={month}>{month}</option>;
                    })}
                  </select>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Select Year</label>
                  <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="">Select Year</option>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={i} value={year}>{year}</option>;
                    })}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Upload Excel</label>
                  <div className="input-group">
                    <input
                      type="file"
                      className="form-control"
                      accept=".xlsx"
                      onChange={handleComparisonFileUpload}
                      id="excelUpload"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="excelUpload" className="btn btn-outline-secondary d-flex align-items-center">
                      <Upload className="me-2" /> Choose File
                    </label>
                    <input type="text" className="form-control" value={fileName || "No file chosen"} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* Display Comparison Result */}
            {comparisonResult && (
              <div className="mt-4">
                <h5>Comparison Results</h5>

                {comparisonResult.gstMismatches.length > 0 && (
                  <div className="alert alert-danger">
                    <strong>GST Mismatches:</strong>
                    <ul>
                      {comparisonResult.gstMismatches.map((item, index) => (
                        <li key={index}>
                          Invoice <strong>{item.invoiceNumber}</strong>: Expected GST <code>{item.expectedGst}</code>, uploaded <code>{item.uploadedGst}</code>
                        </li>
                      ))}
                    </ul>
                    <textarea
                      className="form-control"
                      placeholder="Add review for GST mismatches"
                      value={comparisonResult.remarks.gstMismatches}
                      onChange={(e) =>
                        setComparisonResult(prev => ({
                          ...prev,
                          remarks: { ...prev.remarks, gstMismatches: e.target.value }
                        }))
                      }
                    />
                  </div>
                )}

                {comparisonResult.duplicateInvoices.length > 0 && (
                  <div className="alert alert-warning">
                    <strong>Duplicate Invoice Numbers:</strong>
                    <ul>
                      {comparisonResult.duplicateInvoices.map((inv, i) => (
                        <li key={i}>{inv}</li>
                      ))}
                    </ul>
                    <textarea
                      className="form-control"
                      placeholder="Add review for duplicate invoices"
                      value={comparisonResult.remarks.duplicateInvoices}
                      onChange={(e) =>
                        setComparisonResult(prev => ({
                          ...prev,
                          remarks: { ...prev.remarks, duplicateInvoices: e.target.value }
                        }))
                      }
                    />
                  </div>
                )}

                <button className="btn btn-outline-primary mt-3 d-flex align-items-center" onClick={handleReupload}>
                  <ArrowClockwise className="me-2" />
                  Update & Reupload
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default CompanyGSTSubmission;
