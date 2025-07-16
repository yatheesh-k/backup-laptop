import React, { useRef, useState } from 'react';
import LayOut from '../../LayOut/LayOut';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowClockwise, Download, Upload } from 'react-bootstrap-icons';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { GstPostApi, getGstResponse, GstPostResponse } from '../../Api/GstApis';

const CompanyGSTSubmission = () => {
  const [fileName, setFileName] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [gstResponse, setGstResponse] = useState(null);
  const [remarks, setRemarks] = useState({ mismatchCustomer: '', ignoredCustomer: '' });
  const [uploading, setUploading] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a valid .xlsx file');
      return;
    }

    if (!selectedMonth || !selectedYear) {
      toast.error('Please select both Month and Year');
      return;
    }

    setUploading(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('month', selectedMonth);
    formData.append('year', selectedYear);

    try {
      await GstPostApi(formData);
      const response = await getGstResponse(selectedMonth, selectedYear);
      setGstResponse(response);
      toast.success('GST uploaded and comparison done');
    } catch (error) {
      toast.error('Failed to upload or fetch GST response');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await GstPostResponse({
        month: selectedMonth,
        year: selectedYear,
        mismatchCustomer: remarks.mismatchCustomer,
        ignoredCustomer: remarks.ignoredCustomer,
      });
      toast.success('GST review submitted successfully');
      navigate('/gstView');
    } catch (error) {
      toast.error('Failed to submit GST response');
    }
  };

  const handleReupload = () => {
    setFileName('');
    setGstResponse(null);
    setRemarks({ mismatchCustomer: '', ignoredCustomer: '' });
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InvoiceTemplate');
    XLSX.writeFile(wb, 'Invoice_Template.xlsx');
    toast.success('Sample Excel downloaded');
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3"><strong>Company GST Submission</strong></h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link to="/main" className="custom-link">Home</Link></li>
                <li className="breadcrumb-item active">Finance</li>
                <li className="breadcrumb-item active">GST</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">GST Upload & Comparison</h5>
          </div>
          <div className="card-body">
            {/* Download Template */}
            <div className="mb-4">
              <h5>1. Download Invoice Template</h5>
              <button className="btn btn-primary d-flex align-items-center mt-2" onClick={downloadSampleExcel}>
                <Download className="me-2" />
                Download Template
              </button>
            </div>

            {/* Upload Excel */}
            <div className="mb-4" ref={formRef}>
              <h5>2. Upload Invoice Data</h5>
              <div className="row g-3 align-items-end">
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
                      id="excelUpload"
                      style={{ display: 'none' }}
                      onChange={handleExcelUpload}
                    />
                    <label htmlFor="excelUpload" className="btn btn-outline-secondary d-flex align-items-center">
                      <Upload className="me-2" /> Choose File
                    </label>
                    <input type="text" className="form-control" value={fileName || "No file chosen"} readOnly />
                  </div>
                </div>
              </div>
            </div>

            {/* GST Response Result */}
            {gstResponse && (
              <div className="mt-4">
                <h5>3. Comparison Results</h5>

                {gstResponse.mismatchCustomer && (
                  <div className="alert alert-danger">
                    <strong>Mismatch Customers:</strong>
                    <pre>{gstResponse.mismatchCustomer}</pre>
                    <textarea
                      className="form-control"
                      placeholder="Add comments for mismatch"
                      value={remarks.mismatchCustomer}
                      onChange={(e) => setRemarks(prev => ({ ...prev, mismatchCustomer: e.target.value }))}
                    />
                  </div>
                )}

                {gstResponse.ignoredCustomer && (
                  <div className="alert alert-warning">
                    <strong>Ignored Customers:</strong>
                    <pre>{gstResponse.ignoredCustomer}</pre>
                    <textarea
                      className="form-control"
                      placeholder="Add comments for ignored"
                      value={remarks.ignoredCustomer}
                      onChange={(e) => setRemarks(prev => ({ ...prev, ignoredCustomer: e.target.value }))}
                    />
                  </div>
                )}

                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-outline-primary" onClick={handleReupload}>
                    <ArrowClockwise className="me-2" />
                    Reupload
                  </button>

                  <button className="btn btn-success" onClick={handleSubmitReview}>
                    Submit Review
                  </button>
                </div>
              </div>
            )}

            {uploading && <p className="text-info mt-3">Uploading and comparing, please wait...</p>}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default CompanyGSTSubmission;

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