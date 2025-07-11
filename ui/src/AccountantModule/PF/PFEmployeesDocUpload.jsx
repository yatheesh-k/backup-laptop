import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import {
  AttendanceManagementApi,
  EmployeesAccountGetAll,
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
  const [employees, setEmployees] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showUploadOption, setShowUploadOption] = useState(false);

  // User role and company modules from sessionStorage
  const userRole = sessionStorage.getItem("userRole");
  const companyModules = JSON.parse(sessionStorage.getItem("companyModules") || "[]");

  const isAccountant = userRole === "Accountant";
  const hasHRModule = companyModules.includes("HR");

  useEffect(() => {
    if (isAccountant) {
      if (hasHRModule) {
        fetchEmployeeAccounts();
      } else {
        setShowUploadOption(true);
      }
    }
  }, []);

  const fetchEmployeeAccounts = async () => {
    try {
      const response = await EmployeesAccountGetAll();
      const filteredEmployees = response.data?.data || [];
      setEmployees(filteredEmployees);
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
      } else {
        toast.error(response.data.error.message);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.error?.message
      ) {
        toast.error(error.response.data.error.message);
      } else {
        toast.error("Network Error!");
      }
    }
  };

  const downloadExcel = () => {
    const headers = [
      "firstName",
      "lastName",
      "aadhaarId",
      "emailId",
      "employeeSalary",
      "panNo",
      "pfAmount",
      "pfTax",
      "tds",
      "uanNumber",
      "month",
      "year",
    ];

    const employeesAccountDetails = Array.isArray(employees) && employees.length > 0
      ? employees.map((emp) => ({
          firstName: emp.firstName || emp.employeeName?.split(" ")[0] || "",
          lastName: emp.lastName || emp.employeeName?.split(" ")[1] || "",
          aadhaarId: emp.aadhaarId || "",
          emailId: emp.email || emp.emailId || "",
          employeeSalary: emp.salary || emp.employeeSalary || "",
          panNo: emp.panNo || "",
          pfAmount: emp.pfAmount || "",
          pfTax: emp.pfTax || "",
          tds: emp.tdsTax || emp.tds || "",
          uanNumber: emp.uanNo || emp.uanNumber || "",
          month: selectedMonth,
          year: selectedYear,
        }))
      : [];

    const worksheet = XLSX.utils.json_to_sheet(employeesAccountDetails, {
      header: headers,
      skipHeader: false,
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    XLSX.writeFile(workbook, `Employees_PF_${selectedMonth}_${selectedYear}.xlsx`);
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
                  <div className="col-12 col-md-2 col-lg-2 d-flex align-items-center">
                    <h5 className="card-title mt-4">PF Submission</h5>
                  </div>

                  {/* Month Dropdown */}
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Month <span className="text-danger fw-100">*</span>
                    </label>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      value={selectedMonth}
                    >
                      <option value="">Select Month</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const monthName = new Date(2000, i).toLocaleString("default", {
                          month: "long",
                        });
                        return (
                          <option key={i} value={monthName}>
                            {monthName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Year Dropdown */}
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Year <span className="text-danger fw-100">*</span>
                    </label>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedYear(e.target.value)}
                      value={selectedYear}
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

                  {/* Download Button */}
                  <div className="col-12 col-md-4 col-lg-4 mt-4 d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-outline-primary d-flex align-items-center"
                      onClick={downloadExcel}
                      disabled={!selectedMonth || !selectedYear}
                    >
                      <Download size={20} className="me-2" />
                      <span>Download Excel</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="dropdown-divider"
                style={{ borderTopColor: "#d7d9dd" }}
              />

              <div className="card-body">
                {showUploadOption && (
                  <div className="row">
                    <div className="col-12">
                      <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                          <label className="form-label">
                            Upload Attendance File
                          </label>
                          <input
                            type="file"
                            className={`form-control ${errors.attendanceFile ? "is-invalid" : ""}`}
                            {...register("attendanceFile", {
                              required: "Attendance file is required",
                              validate: {
                                acceptedFormats: (value) =>
                                  value[0] &&
                                  [".xlsx", ".xls"].some(ext =>
                                    value[0].name.endsWith(ext)
                                  ) || "Only .xlsx or .xls files are allowed",
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default PFEmployeesDocUpload;
