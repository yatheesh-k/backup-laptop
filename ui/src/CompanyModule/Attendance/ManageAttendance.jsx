import React, { useState} from "react";
import LayOut from "../../LayOut/LayOut";
import { AttendanceManagementApi, EmployeeNoAttendanceGetAPI } from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const ManageAttendance = () => {
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
  const [selectedFile, setSelectedFile] = useState(null);

  // Function to Fetch Data
  const fetchEmployeeData = async () => {
    if (!selectedMonth || !selectedYear) {
      alert("Please select both month and year!");
      return;
    }
    try {
      const response = await EmployeeNoAttendanceGetAPI(selectedMonth, selectedYear);
      const allEmployees = response.data.data || [];  // Ensure it's an array
  
      // Filter out "CompanyAdmin" employees
      const filteredEmployees = allEmployees.filter(emp => emp.employeeType !== "CompanyAdmin");
  
      if (filteredEmployees.length === 0) {
        alert("No Attendance Pending");  // Show message if no valid employees remain
        setEmployees([]);  // Clear employee list
        setIsDataFetched(false);
        return;
      }
      setEmployees(filteredEmployees);
      console.log("Filtered Employee Attendance", filteredEmployees);
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
    if (employees.length === 0) {
      alert("No data available to export!");
      return;
    }
 // Filtering out employees where firstName is null
 const filteredEmployees = employees.filter((employee) => employee.firstName);

 if (filteredEmployees.length === 0) {
   alert("No valid employee data to export!");
   return;
 }
    // Formatting employee data for Excel
    const updatedEmployees = filteredEmployees.map((employee) => ({
       EmployeeId: employee.employeeId,
      "First Name": `${employee.firstName || ""}`.trim(),
      "Last Name" :`${employee.lastName || ""}`.trim(),
      "Email Id": employee.emailId || "", // Ensure default value
      Month: selectedMonth,
      Year: selectedYear,
      "Working Days": "", // Placeholder
    }));

    console.log("Updated Employees:", updatedEmployees);

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(updatedEmployees);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Generate and Download Excel File
    XLSX.writeFile(workbook, `Attendance_${selectedMonth}_${selectedYear}.xlsx`);
    setIsDataFetched(false);
  };

  const clearForm = () => {
    reset();
    setSelectedFile(null); // Clear the file selection
  };

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Manage Attendance</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main" className="custom-link">Home</Link>
                </li>
                <li className="breadcrumb-item active">Attendance</li>
                <li className="breadcrumb-item active">Manage Attendance</li>
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
  <div className="col-12 col-md-3 col-lg-3 d-flex align-items-center">
    <h5 className="card-title mt-4">Manage Attendance</h5>
  </div>

  {/* Select Month Dropdown */}
  <div className="col-12 col-md-3 col-lg-3">
    <label className="card-title">
      Select Month <span className="text-danger fw-100">*</span>
    </label>
    <select className="form-select" onChange={(e) => setSelectedMonth(e.target.value)}>
      <option value="">Select Month</option>
      {Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(2000, i).toLocaleString("default", { month: "long" });
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
    <select className="form-select" onChange={(e) => setSelectedYear(e.target.value)}>
      <option value="">Select Year</option>
      {Array.from({ length: 30 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return <option key={year} value={year}>{year}</option>;
      })}
    </select>
  </div>

  {/* Fetch / Download Button */}
  <div className="col-12 col-md-3 col-lg-3 d-flex justify-content-start mt-4 align-items-center">
    {!isDataFetched ? (
      <button type="button" className="btn btn-primary" onClick={fetchEmployeeData} disabled={!selectedMonth || !selectedYear}>
        Fetch Data
      </button>
    ) : employees.length > 0 ? (
      <button type="button" className="btn btn-outline-primary d-inline-flex align-items-center" onClick={downloadExcel}>
        Download Excel <Download size={20} className="ml-1" />
      </button>
    ) : (
      <p className="text-danger m-0">No Data Available</p>
    )}
  </div>
</div>

              </div>
            {/* <div className="card-header">
  <h5 className="col-2  mb-0">Manage Attendance</h5>

  <div className="d-flex col-10 justify-content-between align-items-center w-100">
    
    <div className="d-flex">
      <label className="form-label">Select Month</label>
      <select className="form-control" onChange={(e) => setSelectedMonth(e.target.value)}>
        <option value="">Select Month</option>
        {Array.from({ length: 12 }, (_, i) => {
          const monthNumber = (i + 1).toString().padStart(2, "0");
          const monthName = new Date(2000, i).toLocaleString("default", { month: "long" });
          return (
            <option key={monthNumber} value={monthName}>
              {monthName}
            </option>
          );
        })}
      </select>
    </div>

    <div className="d-flex flex-column">
      <label className="form-label">Select Year</label>
      <select className="form-control" onChange={(e) => setSelectedYear(e.target.value)}>
        <option value="">Select Year</option>
        {Array.from({ length: 5 }, (_, i) => {
          const year = new Date().getFullYear() - i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>

    <button type="button" className="btn btn-primary" onClick={fetchEmployeeData} disabled={!selectedMonth || !selectedYear}>
      Fetch Data
    </button>

    {isDataFetched && employees.length > 0 && (
      <button type="button" className="btn btn-outline-primary" onClick={downloadExcel}>
        Download Excel <Download size={20} className="ml-1" />
      </button>
    )}
  </div>
</div> */}

              <div
                className="dropdown-divider"
                style={{ borderTopColor: "#d7d9dd" }}
              />
              <div className="card-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-4">
                    <div className="col-12 row d-flex justify-content-center">
                      <div
                        className="col-6 col-md-6 col-lg-6 mt-2"
                        style={{ maxWidth: "400px" }}
                      >
                        <label className="form-label">
                          Select Attendance File
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          {...register("attendanceFile", {
                            required: "Upload Attendance File",
                          })}
                        />
                        {errors.attendanceFile && (
                          <p className="errorMsg">
                            {errors.attendanceFile.message}
                          </p>
                        )}
                      </div>
                      <div className="col-4 col-md-4 col-lg-4 mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary me-1 mt-2"
                          onClick={clearForm}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary mt-2">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ManageAttendance;
