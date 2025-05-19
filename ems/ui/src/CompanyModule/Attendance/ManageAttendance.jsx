import React, { useState, useEffect } from "react";
import LayOut from "../../LayOut/LayOut";
import { AttendanceManagementApi, EmployeeGetApi } from "../../Utils/Axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { Download } from "react-bootstrap-icons";
import * as XLSX from "xlsx";

const ManageAttendance = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await EmployeeGetApi();
        const formattedData = data
          .filter(
            (employee) =>
              employee.firstName !== null && employee.status !== "InActive"
          )
          .map(
            ({
              employeeId,
              firstName,
              lastName,
              emailId,
              Month,
              Year,
              workingDays,
            }) => ({
              employeeId,
              firstName,
              lastName,
              emailId,
              Month,
              Year,
              workingDays,
            })
          );
        setEmployees(formattedData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employee data");
      }
    };

    fetchEmployees();
  }, []);

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
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString("default", {
      month: "long",
    });
    const currentYear = currentDate.getFullYear();
    const updatedEmployees = employees.map((employee) => ({
      ...employee,
      Month: currentMonth,
      Year: currentYear,
    }));

    const worksheet = XLSX.utils.json_to_sheet(updatedEmployees, {
      header: [
        "employeeId",
        "firstName",
        "lastName",
        "emailId",
        "Month",
        "Year",
        "workingDays",
      ],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "attendance_data.xlsx");
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
                  <a href="/main">Home</a>
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
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Manage Attendance
                </h5>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={downloadExcel}
                >
                  Download Attendance Excel Sheet{" "}
                  <Download size={20} className="ml-1" />
                </button>
              </div>
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
