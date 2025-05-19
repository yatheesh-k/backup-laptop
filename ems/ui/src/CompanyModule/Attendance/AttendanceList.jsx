import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import {
  EmployeeGetApi,
  AttendanceReportApi,
  AttendancePatchById,
} from "../../Utils/Axios";
import { PencilSquare } from "react-bootstrap-icons";
import DataTable from "react-data-table-component";
import { useNavigate } from "react-router-dom";
import { ModalTitle, ModalHeader, ModalBody } from "react-bootstrap";

const AttendanceReport = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({ mode: "onChange" });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState({});
  const [editAttendance, setEditAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [refreshData, setRefreshData] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  // const [columns, setColumns] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [noDataFound, setNoDataFound] = useState(false); // State to track if no data is found
  const [isFilterClicked, setIsFilterClicked] = useState(false); // New state to track "Go" button click

  const navigate = useNavigate();

  const getLastMonth = () => {
    const current = new Date();
    const previousMonth = new Date(current.setMonth(current.getMonth() - 1));
    return previousMonth.toLocaleString("en-US", { month: "long" }); // Get month name
  };

  useEffect(() => {
    // Set the default selectedMonth to the last month
    setSelectedMonth(getLastMonth());
    fetchAttendanceData(employeeId, getLastMonth(), new Date().getFullYear()); // Fetch attendance data for last month on initial load
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await EmployeeGetApi();
        const formattedData = data
          .filter((employee) => employee.firstName !== null)
          .map(({ id, firstName, lastName, employeeId }) => ({
            label: `${firstName} ${lastName} (${employeeId})`,
            value: id,
            firstName,
            lastName,
            employeeId,
          }));
        setEmployees(formattedData);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
    fetchAttendanceData(); // Fetch all attendance data initially
  }, []);
  // Fetch Attendance Data
  const fetchAttendanceData = async (empId) => {
    try {
      const today = new Date();
      let month = today.getMonth() + 1; // Current month (1-based)
      let year = today.getFullYear();
  
      if (today.getDate() < 25) {
        // Before 25th: Show last month's data
        month -= 1;
        if (month === 0) {
          month = 12; // Handle January case
          year -= 1;
        }
      }
  
      // Fetch attendance data
      const response = await AttendanceReportApi(empId, month, year);
  
      if (response.data.data.length === 0) {
        if (today.getDate() >= 25) {
          // If today is after 25th and no data for current month
          setNoDataFound(true);
          toast.error("Current Month Attendance needs to be uploaded.");
        } else {
          setNoDataFound(true);
          toast.error("No attendance data found for last month.");
        }
      } else {
        setAttendanceData(response.data.data);
        setNoDataFound(false);
      }
    } catch (error) {
      console.log(error.message);
      setNoDataFound(true);
      toast.error("Error fetching attendance data.");
    }
  };
  
  useEffect(() => {
    const lastMonth = getLastMonth(); // Get the last month
    const currentYear = new Date().getFullYear(); // Get the current year
    setSelectedMonth(lastMonth); // Default to last month
    setSelectedYear(currentYear); // Default to current year
    fetchAttendanceData(employeeId, lastMonth, currentYear); // Fetch data with both last month and current year
  }, []);

  const handleEmployeeChange = (selectedOption) => {
    setEmployeeId(selectedOption.value);
    setSelectedEmployee(selectedOption); // Set the selected employee details
  };

  const filterByMonthYear = () => {
    if (!selectedYear || !employeeId) {
      console.log("Please select Employee and Year");
      return;
    }

    setIsFilterClicked(true); // Mark that the "Go" button has been clicked

    // Check if selectedMonth is valid, if not, pass null or empty string
    let monthToSend = selectedMonth === "Select Month" ? "" : selectedMonth;

    fetchAttendanceData(employeeId, monthToSend, selectedYear);
  };

  // Get the months for dropdown
  const getMonthNames = () => {
    return Array.from({ length: 12 }, (_, i) =>
      new Date(0, i).toLocaleString("en-US", { month: "long" })
    );
  };

  const getRecentYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());
  };

  const handleShowEditModal = (row) => {
    setSelectedAttendance(row);
    setSelectedEmployeeId(row.employeeId);
    setSelectedAttendanceId(row.attendanceId);
    reset({
      totalWorkingDays: row.totalWorkingDays,
      noOfWorkingDays: row.noOfWorkingDays,
    });
    setEditAttendance(true);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAttendance({});
  };

  const onSubmit = async (data) => {
    try {
      await AttendancePatchById(selectedEmployeeId, selectedAttendanceId, data);
      toast.success("Attendance Record Updated Successfully", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
      setTimeout(() => {
        handleCloseEditModal();
        setRefreshData((prev) => !prev);
        navigate("/attendanceReport");
        fetchAttendanceData(employeeId, selectedMonth, selectedYear); // Fetch updated attendance
      }, 1000);
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const formatDateHeader = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthNames = getMonthNames();
    const lastMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonth = monthNames[lastMonthIndex];
    return `Attendance Details for ${lastMonth} ${currentYear}`;
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

  const columns = [
    {
      name: (
        <h6>
          <b>#</b>
        </h6>
      ),
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "80px",
    },
    {
      name: (
        <h6>
          <b>Name</b>
        </h6>
      ),
      selector: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      name: (
        <h6>
          <b>Mail</b>
        </h6>
      ),
      selector: (row) => row.emailId,
    },
    {
      name: (
        <h6>
          <b>Month</b>
        </h6>
      ),
      selector: (row) => row.month,
    },
    {
      name: (
        <h6>
          <b>Year</b>
        </h6>
      ),
      selector: (row) => row.year,
    },
    {
      name: (
        <h6>
          <b>No. Of Working Days</b>
        </h6>
      ),
      selector: (row) => row.noOfWorkingDays,
      width: "240px",
    },
    {
      name: (
        <h6>
          <b>Total Working Days</b>
        </h6>
      ),
      selector: (row) => row.totalWorkingDays,
      width: "240px",
    },
    {
      name: (
        <h6>
          <b>Actions</b>
        </h6>
      ),
      cell: (row) => (
        <div>
          <button
            className="btn btn-sm"
            style={{
              backgroundColor: "transparent",
              border: "none",
              padding: "10px",
              marginLeft: "5px",
            }}
            onClick={() => handleShowEditModal(row)}
            title="Edit"
          >
            <PencilSquare size={22} color="#2255a4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Attendance Report</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Attendance</li>
                <li className="breadcrumb-item active">Attendance Report</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header" style={{ paddingLeft: "90px" }}>
                <div className="row d-flex justify-content-start align-items-center">
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Employee <span className="text-danger">*</span>
                    </label>
                    <Select options={employees} onChange={setSelectedEmployee} placeholder="Select Employee" />
                  </div>

                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">Select Month</label>
                    <select className="form-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                      {getMonthNames().map(month => <option key={month} value={month}>{month}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-3 col-lg-3">
                    <label className="card-title">
                      Select Year <span className="text-danger fw-100">*</span>
                    </label>
                    <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                       {getRecentYears().map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                  <div
                    className="col-12 col-md-3 col-lg-3 d-flex justify-content-center align-items-center"
                    style={{ marginTop: "30px" }}
                  >
                    <button className="btn btn-primary" onClick={fetchAttendanceData}>Go</button>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <h5 className="card-title mt-2 text-secondary">
                  {isFilterClicked
                    ? selectedEmployee
                      ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeId})`
                      : "Employees"
                    : "Employees"}{" "}
                  in {selectedMonth ? selectedMonth : "Month"}{" "}
                  {selectedYear ? `, ${selectedYear}` : ""}
                </h5>
                <hr />
                <div>
                  {noDataFound ? (
                    <p className="text-center">No Attendance Found</p>
                  ) : (
                    <DataTable
                      columns={[
                        {
                          name: "#",
                          selector: (row, index) =>
                            (currentPage - 1) * rowsPerPage + index + 1,
                        },
                        {
                          name: "Name",
                          selector: (row) => `${row.firstName} ${row.lastName}`,
                        },
                        {
                          name: "Month",
                          selector: (row) => row.month,
                        },
                        {
                          name: "Total Working Days",
                          selector: (row) => row.totalWorkingDays,
                        },
                        {
                          name: "Days Worked",
                          selector: (row) => row.noOfWorkingDays,
                        },
                        {
                          name: (
                            <h6>
                              <b>Actions</b>
                            </h6>
                          ),
                          cell: (row) => (
                            <div>
                              <button
                                className="btn btn-sm"
                                style={{
                                  backgroundColor: "transparent",
                                  border: "none",
                                  padding: "10px",
                                  marginLeft: "5px",
                                }}
                                onClick={() => handleShowEditModal(row)}
                                title="Edit"
                              >
                                <PencilSquare size={22} color="#2255a4" />
                              </button>
                            </div>
                          ),
                        },
                      ]}
                      data={attendanceData}
                      pagination
                      highlightOnHover
                      pointerOnHover
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fade modal show modal-dialog-centered"
          tabIndex="-1"
          style={{ zIndex: "9999" }}
          
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <ModalHeader>
                <ModalTitle>Edit Attendance</ModalTitle>
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div
                    className="card-body"
                    style={{ width: "1060px", paddingBottom: "0px" }}
                  >
                    <div className="col-12 col-md-6 col-lg-4 mb-2">
                      <label>Total Working Days</label>
                      <input
                        type="number"
                        name="totalWorkingDays"
                        readOnly
                        className="form-control"
                        {...register("totalWorkingDays", { required: true })}
                      />
                      {errors.totalWorkingDays && (
                        <p className="errorMsg">
                          {errors.totalWorkingDays.message}
                        </p>
                      )}
                    </div>
                    <div className="col-12 col-md-6 col-lg-4 mb-2">
                      <label>No. Of Working Days</label>
                      <input
                        type="text"
                        name="noOfWorkingDays"
                        maxLength={2}
                        className="form-control"
                        {...register("noOfWorkingDays", {
                          required: "No. of working days is required",
                          pattern: {
                            value: /^\d+$/,
                            message: "Only numbers are allowed",
                          },
                          min: {
                            value: 0,
                            message: "Cannot be less than 0 days",
                          },
                          validate: {
                            maxTotal: (value) => {
                              const totalWorkingDays =
                                watch("totalWorkingDays"); // Get total working days

                              // Check if value contains "to" (i.e., a range like "4 to 9")
                              if (value.includes("to")) {
                                // Split the value by "to", then trim and convert to numbers
                                const [start, end] = value
                                  .split("to")
                                  .map((val) => parseInt(val.trim(), 10));

                                // Check if the range is valid
                                if (isNaN(start) || isNaN(end)) {
                                  return "Invalid range format.";
                                }

                                // Ensure that the range is within totalWorkingDays
                                if (start > end) {
                                  return "Start value cannot be greater than end value."; // Invalid range
                                }

                                if (
                                  start <= totalWorkingDays &&
                                  end <= totalWorkingDays
                                ) {
                                  return true; // Valid range
                                } else {
                                  return "The range cannot exceed total working days.";
                                }
                              } else {
                                // If it's a single value, check if it's within the working days
                                const numberValue = parseInt(value, 10);

                                if (isNaN(numberValue)) {
                                  return "Invalid number.";
                                }

                                return (
                                  numberValue <= totalWorkingDays ||
                                  "Value cannot exceed total working days."
                                );
                              }
                            },
                          },
                        })}
                      />
                      {errors.noOfWorkingDays && (
                        <p className="errorMsg">
                          {errors.noOfWorkingDays.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-primary" type="submit">
                      Save changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseEditModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </ModalBody>
            </div>
          </div>
        </div>
      )}
    </LayOut>
  );
};

export default AttendanceReport;
