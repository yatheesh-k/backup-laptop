import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  AttendanceManagementApi,
  EmployeeNoAttendanceGetAPI,
} from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const PFEmployeesDocUpload = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to Fetch Data
  const fetchEmployeeData = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Please select both month and year!");
      return;
    }
    try {
      const response = await EmployeeNoAttendanceGetAPI(
        selectedMonth,
        selectedYear
      );
      const allEmployees = response.data.data || []; // Ensure it's an array

      // Filter out "CompanyAdmin" employees
      const filteredEmployees = allEmployees.filter(
        (emp) => emp.employeeType !== "CompanyAdmin"
      );
      setEmployees(filteredEmployees);
      console.log("Filtered Employees", filteredEmployees);
      setIsDataFetched(true);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setIsDataFetched(false);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("file", data.attendanceFile[0]);
    try {
      const response = await AttendanceManagementApi(formData);

      if (response.data.path) {
        toast.success("Attendance Added Successfully");
        reset();
        setSelectedFile(null);
      } else {
        toast.error(response.data.error.message);
      }
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const handleApiErrors = (error) => {
    if (
      error.response &&
      error.response.data &&
      error.response.data.error &&
      error.response.data.error.message
    ) {
      const errorMessage = error.response.data.error.message;
      toast.error(errorMessage);
    } else {
      toast.error("Network Error !");
    }
    console.error(error.response);
  };
  const downloadExcel = () => {
      const employeesWithMonthYear = employees.map(emp => ({
    ...emp,
    month: selectedMonth,
    year: selectedYear
  }));
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(employeesWithMonthYear, {
      header: [     
        "employeeId",
        "employeeName",     
        "departmentName",   
        "designationName",
        "dateOfJoining",
        "email",        
        "mobileNo",
        "pfNo", 
        "accountNumber",
        "ifscCode",
        "uanNo",  
        "aadhaarId",
        "panNo",    
        "bankName",
        "bankBranch",
        "salary",
        "pfPercentage",
        "pfAmount",
        "tdsTax",
          "netSalary",
        "pfTax",
        "incomeTax",
        "month",
        "year",
      ],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Generate and Download Excel File
    XLSX.writeFile(
      workbook,
      `Employees_PF_${selectedMonth}_${selectedYear}.xlsx`
    );
    setIsDataFetched(false);
  };
  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>PF Submission</strong>
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
                <li className="breadcrumb-item active">PF</li>
                <li className="breadcrumb-item active">PF Submission</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header" style={{ paddingLeft: "90px" }}>
                <div className="row d-flex align-items-center">
                  {/* Title - Always Left-Aligned */}
                  <div className="col-12 col-md-2 col-lg-2 d-flex align-items-center">
                    <h5 className="card-title mt-4">PF Submission</h5>
                  </div>

                  {/* Select Month Dropdown */}
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Month <span className="text-danger fw-100">*</span>
                    </label>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthName = new Date(2000, i).toLocaleString(
                          "default",
                          { month: "long" }
                        );
                        return (
                          <option key={i} value={monthName}>
                            {monthName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Select Year Dropdown */}
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Year <span className="text-danger fw-100">*</span>
                    </label>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 30 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  {/* Fetch / Download Button */}
                  <div className="col-12 col-md-4 col-lg-4  mt-4 align-items-center">
                    {/* {!isDataFetched ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={fetchEmployeeData}
                        disabled={!selectedMonth || !selectedYear}
                      >
                        Fetch Data
                      </button>
                    ) : employees.length > 0 ? (
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={downloadExcel}
                      >
                        Download Excel <Download size={20} className="ml-1" />
                      </button>
                    ) : (
                      <p className="text-danger m-0">No Data Available</p>
                    )} */}
                    
                     <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={downloadExcel}
                        disabled={!selectedMonth || !selectedYear}
                      >
                        <Download size={20} className="ml-1" />
                        Download Excel 
                      </button>
                  </div>
                </div>
              </div>
              <div
                className="dropdown-divider"
                style={{ borderTopColor: "#d7d9dd" }}
              />
              <div className="card-body">
                <div className="row">
                  <div className="col-12">  
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="mb-3">
                        <label className="form-label">
                          Upload Attendance File
                        </label>
                        <input
                          type="file"
                          className={`form-control ${
                            errors.attendanceFile ? "is-invalid" : ""
                          }`}
                          {...register("attendanceFile", {
                            required: "Attendance file is required",
                            validate: {
                              acceptedFormats: (value) =>
                                value[0] &&
                                [".xlsx", ".xls"].includes(
                                  value[0].name.slice(-5)
                                ) ||
                                "Only .xlsx or .xls files are allowed",
                            },
                          })}
                        />
                        {errors.attendanceFile && (
                          <div className="invalid-feedback">
                            {errors.attendanceFile.message}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!selectedMonth || !selectedYear}
                      >
                        Submit Attendance
                      </button>
                    </form> 
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default PFEmployeesDocUpload;
