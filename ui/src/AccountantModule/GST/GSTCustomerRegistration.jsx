// /components/GSTCustomerRegistration.jsx
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { Download } from "react-bootstrap-icons";
import LayOut from "../../LayOut/LayOut";
import {
  PostGstAccountExcel,
  postGstAccountRegistration,
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import {
  gstValidation,
  invoiceNumberValidation,
  nameValidation,
  numberValidation,
} from "../../Utils/Validate";

const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
  XLSX.writeFile(workbook, "CustomersTemplate.xlsx");
};

const templateHeaders = [
  "Invoice Date",
  "Invoice Number",
  "Customer Name",
  "Customer GST",
  "Sub Total",
  "CGST",
  "SGST",
  "IGST",
  "Total Amount",
];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

 const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();


const ExcelUpload = () => {
  const [excelData, setExcelData] = useState([]);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const file = data.file?.[0];
    if (!file) {
      setError("file", { message: "Excel file is required" });
      return;
    }
    const formData = new FormData();
    formData.append("file", data.file[0]);
      try {
        setUploading(true);
        await PostGstAccountExcel(formData, data.month, data.year);
        toast.success("Excel uploaded successfully!");
        setExcelData([]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to upload Excel.");
      } finally {
        setUploading(false);
      }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      <div className="row mb-3">
        <div className="col-md-4">
          <label>
            Month <small className="text-danger">*</small>
          </label>
          <select
            className="form-select"
            {...register("month", { required: "Month is required" })}
          >
            <option value="">-- Select a month --</option>
            {monthNames.map((m, index) => {
              const disabled = parseInt(watch("year")) === currentYear && index > currentMonthIndex;
              return (
                <option key={index} value={m} disabled={disabled}>
                  {m}
                </option>
              );
            })}
          </select>
          <small className="text-danger">{errors.month?.message}</small>
        </div>

        <div className="col-md-4">
          <label>
            Year <small className="text-danger">*</small>
          </label>
          <select
            className="form-select"
            {...register("year", { required: "Year is required" })}
          >
            <option value="">Select Year</option>
            {Array.from({ length: 11 }, (_, i) => {
              const y = currentYear - 10 + i;
              return (
                <option key={y} value={y} disabled={y > currentYear}>
                  {y}
                </option>
              );
            })}
          </select>
          <small className="text-danger">{errors.year?.message}</small>
        </div>

        <div className="col-md-4">
          <label>
            Upload Excel Sheet <small className="text-danger">*</small>
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            {...register("file", { required: "Excel file is required" })}
            className="form-control mb-3"
            onChange={() => clearErrors("file")}
          />
          <small className="text-danger">{errors.file?.message}</small>
        </div>
      </div>

      {excelData.length > 0 && (
        <>
          <div className="mt-3">
            <h6>Preview Data</h6>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              <table className="table table-bordered table-sm">
                <thead>
                  <tr>
                    {Object.keys(excelData[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="mt-2 text-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Submit Excel"}
        </button>
      </div>
    </form>
  );
};

const CustomerForm = () => {
  const {
    register,
    handleSubmit,
    reset,control,
    formState: { errors },
  } = useForm({ mode: "onBlur" ,
    defaultValues: {
      month: "",
      year: "",
    },
  });
  const onSubmit = async (data) => {
    try {
      const response = await postGstAccountRegistration(data);
      console.log("Form submitted:", response);
      reset();
    } catch (error) {
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label>
            Customer Name <small className="text-danger">*</small>
          </label>
          <input
            className="form-control"
            {...register("customerName", nameValidation)}
          />
          <small className="text-danger">{errors.customerName?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            Customer GST No <small className="text-danger">*</small>
          </label>
          <input
            className="form-control"
            {...register("customerGstNo", gstValidation)}
          />
          <small className="text-danger">{errors.customerGstNo?.message}</small>
        </div>

 {/* Month */}
        <div className="col-md-6 mb-3">
          <label>
            Month <span className="text-danger">*</span>
          </label>
          <Controller
            name="month"
            control={control}
            rules={{ required: "Month is required" }}
            render={({ field, fieldState }) => (
              <select
                className="form-select"
                {...field}
                onBlur={field.onBlur}
              >
                <option value="">-- Select a month --</option>
                {monthNames.map((month, index) => (
                  <option
                    key={month}
                    value={month}
                    disabled={
                      field.value?.year === currentYear &&
                      index > currentMonthIndex
                    }
                  >
                    {month}
                  </option>
                ))}
              </select>
            )}
          />
          <small className="text-danger">{errors.month?.message}</small>
        </div>

        {/* Year */}
        <div className="col-md-6 mb-3">
          <label>
            Year <span className="text-danger">*</span>
          </label>
          <Controller
            name="year"
            control={control}
            rules={{ required: "Year is required" }}
            render={({ field }) => (
              <select className="form-select" {...field} onBlur={field.onBlur}>
                <option value="">Select Year</option>
                {Array.from({ length: 11 }, (_, i) => {
                  const y = currentYear - 10 + i;
                  return (
                    <option key={y} value={y} disabled={y > currentYear}>
                      {y}
                    </option>
                  );
                })}
              </select>
            )}
          />
          <small className="text-danger">{errors.year?.message}</small>
        </div>
    
        <div className="col-md-6 mb-3">
          <label>
            Invoice Number <small className="text-danger">*</small>
          </label>
          <input
            className="form-control"
            {...register("invoiceNumber", invoiceNumberValidation)}
          />
          <small className="text-danger">{errors.invoiceNumber?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            Invoice Date <small className="text-danger">*</small>
          </label>
          <input
            type="date"
            className="form-control"
            {...register("invoiceDate")}
          />
          <small className="text-danger">{errors.invoiceDate?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            Sub Total <small className="text-danger">*</small>
          </label>
          <input
            type="number"
            className="form-control"
            {...register("subTotal", numberValidation("Sub Total"))}
          />
          <small className="text-danger">{errors.subTotal?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            CGST <small className="text-danger">*</small>
          </label>
          <input
            type="number"
            className="form-control"
            {...register("cgst", numberValidation("CGST"))}
          />
          <small className="text-danger">{errors.cgst?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            SGST <small className="text-danger">*</small>
          </label>
          <input
            type="number"
            className="form-control"
            {...register("sgst", numberValidation("SGST"))}
          />
          <small className="text-danger">{errors.sgst?.message}</small>
        </div>

        <div className="col-md-6 mb-3">
          <label>
            IGST <small className="text-danger">*</small>
          </label>
          <input
            type="number"
            className="form-control"
            {...register("igst", numberValidation("IGST"))}
          />
          <small className="text-danger">{errors.igst?.message}</small>
        </div>
                <div className="col-md-6 mb-3">
          <label>
            Total Amount <small className="text-danger">*</small>
          </label>
          <input
            type="number"
            className="form-control"
            {...register("totalAmount", numberValidation("Total Amount"))}
          />
          <small className="text-danger">{errors.totalAmount?.message}</small>
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-success">
          Submit
        </button>
      </div>
    </form>
  );
};

const GSTCustomerRegistration = () => {
  const [mode, setMode] = useState("upload");

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>Invoice Data Management</strong>
          </h1>
        </div>
        <div className="col-auto" style={{ paddingBottom: "20px" }}>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/main" className="custom-link">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active">Invoice Data Management</li>
              <li className="breadcrumb-item active">Invoice Data Registration</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Invoice Data Registration</h2>
            <div className="mb-3 row">
              <div className="col d-flex justify-content-between align-items-end">
                {/* Left buttons */}
                <div>
                  <button
                    className="btn btn-outline-primary me-2"
                    onClick={() => setMode("upload")}
                  >
                    Upload Excel
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setMode("manual")}
                  >
                    Manual Entry
                  </button>
                </div>

                {/* Right button shown only in upload mode */}
                {mode === "upload" && (
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-success d-flex align-items-center"
                      onClick={downloadTemplate}
                    >
                      <Download className="me-2" /> Download Template
                    </button>
                  </div>
                )}
              </div>
            </div>

            {mode === "upload" ? <ExcelUpload /> : <CustomerForm />}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default GSTCustomerRegistration;
