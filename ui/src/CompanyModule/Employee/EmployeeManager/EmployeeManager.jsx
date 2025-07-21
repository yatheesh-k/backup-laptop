// /components/EmployeeManager.jsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as XLSX from "xlsx";
import LayOut from "../../../LayOut/LayOut";
import { Link } from "react-router-dom";
import {
  validateAadhar,
  validateEmail,
  validateFirstName,
  validateLastName,
  validatePAN,
  validatePhoneNumber,
  validateUAN,
} from "../../../Utils/Validate";
import { Download } from "react-bootstrap-icons";
import { EmployeePostApi, PostEmployeeExcel } from "../../../Utils/Axios";
import { toast } from "react-toastify";

const templateHeaders = ['First Name', 'Last Name', 'Email ID', 'Mobile No', 'UAN No', 'PAN No', 'Aadhar No', 'PF No', 'Gross Salary'];

const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([templateHeaders]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, 'EmployeeTemplate.xlsx');
};

const ExcelUpload = () => {
  const {
    register,
    handleSubmit,
    setError,reset,
    formState: { errors },
  } = useForm();


 const onSubmit = async (data) => {
    const file = data.file[0];

    try {
      const result = await PostEmployeeExcel(file);
      console.log('Upload successful:', result);
      toast.success(result.data.data)
      reset();
    } catch (error) {
      console.error('Upload failed:', error);
        // Show backend error using setError under the file input
      setError('excelFile', {
        type: 'manual',
        message: 'Upload failed. Please try again.',
      });
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="excelFile" className="form-label mb-0">Upload Excel (.xlsx)</label>
          <button
            type="button"
            className="btn btn-sm btn-outline-success d-flex align-items-center"
            onClick={downloadTemplate}
          >
            <Download className="me-1" size={16} />
            Download Template
          </button>
        </div>
        <input
          type="file"
          id="file"
          accept=".xlsx, .xls .csv"
          className={`form-control ${errors.file ? 'is-invalid' : ''}`}
          {...register('file', { required: 'Excel file is required' })}
        />
        {errors.file && <div className="invalid-feedback">{errors.file.message}</div>}
      </div>
      <button type="submit" className="btn btn-primary">Upload</button>
    </form>
  );
};

const EmployeeForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onBlur" });
  // Watch DOB & Hiring Date to validate them dynamically
//   const dob = watch("dateOfBirth");
//   const hiringDate = watch("dateOfHiring");

//   // Custom Validation Function
//   const validateDOB = (value) => {
//     if (!value) return "Date of Birth is required";

//     // Validate year format (must be 4 digits)
//     const year = new Date(value).getFullYear();
//     if (year.toString().length !== 4) {
//       return "Year must be exactly 4 digits";
//     }

//     const dobDate = new Date(value);
//     const minHiringDate = new Date(dobDate);
//     minHiringDate.setFullYear(minHiringDate.getFullYear() + 16); // Add 16 years

//     if (hiringDate && new Date(hiringDate) < minHiringDate) {
//       return "Employee must be at least 16 years old at hiring.";
//     }

//     return true;
//   };

//   const validateHiringDate = (value) => {
//     if (!value) return "Date of Hiring is required";

//     // Validate year format (must be 4-digit)
//     const year = new Date(value).getFullYear();
//     if (year.toString().length !== 4) {
//       return "Year must be exactly 4 digits";
//     }

//     // Validate hiring date is at least 16 years after DOB
//     const hiringDate = new Date(value);
//     const dobDate = new Date(dob);

//     if (
//       dob &&
//       hiringDate < new Date(dobDate.setFullYear(dobDate.getFullYear() + 16))
//     ) {
//       return "Hiring date must be at least 16 years after DOB.";
//     }

//     return true;
//   };

  const onSubmit = async (data) => {
    try {
      const response = await EmployeePostApi(data)
      const result = await response.json();
      console.log('Registration response:', result);
      reset();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label>First Name <small className="text-danger">*</small></label>
          <input
            className="form-control"
            {...register("firstName", {
              required: "First Name is required",
              validate: validateFirstName,
            })}
          />
          <small className="text-danger">{errors.firstName?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Last Name <small className="text-danger">*</small></label>
          <input
            className="form-control"
            {...register("lastName", {
              required: "Last Name is required",
              validate: validateLastName,
            })}
          />
          <small className="text-danger">{errors.lastName?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Email <small className="text-danger">*</small></label>
          <input
            type="email"
            className="form-control"
            {...register("emailId", {
              required: "Email is required",
              validate: validateEmail,
            })}
          />
          <small className="text-danger">{errors.emailId?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Mobile Number <small className="text-danger">*</small></label>
          <input
            type="tel"
            className="form-control"
            {...register("mobileNo", {
              required: "Mobile Number is required",
              validate: validatePhoneNumber,
            })}
          />
          <small className="text-danger">{errors.mobileNo?.message}</small>
        </div>
        {/* <div className="col-md-6 mb-3">
          <label>Date of Birth <small className="text-danger">*</small></label>
          <input
            type="date"
            className="form-control"
            onClick={(e) => e.target.showPicker()}
            {...register("dateOfBirth", {
              required: "Date of Birth is required",
              validate: validateDOB,
            })}
          />
          <small className="text-danger">{errors.dateOfBirth?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Date of Hiring <small className="text-danger">*</small></label>
          <input
            type="date"
            className="form-control"
            onClick={(e) => e.target.showPicker()}
            {...register("dateOfHiring", {
              required: "Date of Hiring is required",
              validate: validateHiringDate,
            })}
          />
          <small className="text-danger">{errors.dateOfHiring?.message}</small>
        </div> */}
       <div className="col-md-6 mb-3">
          <label>Gross Salary <small className="text-danger">*</small></label>
          <input type="number" className="form-control" {...register('grossSalary', { required: 'Gross Salary is required', min: { value: 0, message: 'Must be non-negative' } })} />
          <small className="text-danger">{errors.grossSalary?.message}</small>
        </div>
        {/* <div className="col-md-6 mb-3">
          <label>PF Amount <small className="text-danger">*</small></label>
          <input type="number" className="form-control" {...register('pfAmount', { required: 'PF Amount is required', min: { value: 0, message: 'Must be non-negative' } })} />
          <small className="text-danger">{errors.pfAmount?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>TDS Amount <small className="text-danger">*</small></label>
          <input type="number" className="form-control" {...register('tdsAmount', { required: 'TDS Amount is required', min: { value: 0, message: 'Must be non-negative' } })} />
          <small className="text-danger">{errors.tdsAmount?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Professional Tax <small className="text-danger">*</small></label>
          <input type="number" className="form-control" {...register('professionalTax', { required: 'Professional Tax is required', min: { value: 0, message: 'Must be non-negative' } })} />
          <small className="text-danger">{errors.professionalTax?.message}</small>
        </div> */}
        <div className="col-md-6 mb-3">
          <label>PAN <small className="text-danger">*</small></label>
          <input
            className="form-control"
            {...register("panNo", {
              required: "PAN Number is required",
              validate: validatePAN,
            })}
          />
          <small className="text-danger">{errors.panNo?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Aadhar <small className="text-danger">*</small></label>
          <input
            className="form-control"
            {...register("aadhaarId", {
              required: "Aadhar Number is required",
              validate: validateAadhar,
            })}
          />
          <small className="text-danger">{errors.aadhaarId?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>UAN (Optional)</label>
          <input
            className="form-control"
            {...register("uanNo", {
              validate: validateUAN,
            })}
          />
          <small className="text-danger">{errors.uanNo?.message}</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Status <small className="text-danger">*</small></label>
          <select
            className="form-control"
            {...register("status", { required: "Select Status" })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">InActive</option>
          </select>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end">
      <button type="submit" className="btn btn-success ">
        Register
      </button>
      </div>
    </form>
  );
};

const EmployeeManager = () => {
  const [mode, setMode] = useState("upload");

  return (
    <LayOut>
      <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
        <div className="col">
          <h1 className="h3 mb-3">
            <strong>Employee Management</strong>
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
              <li className="breadcrumb-item active">Employee</li>
              <li className="breadcrumb-item">
                 <a href="/employeeSummary">Employees Summary</a>
              </li>
              <li className="breadcrumb-item active">Employee Registration</li>
            </ol>
          </nav>
        </div>
      </div>
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Employee Registration</h2>
            <div className="mb-3">
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
            {mode === "upload" ? <ExcelUpload /> : <EmployeeForm />}
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default EmployeeManager;
