import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import Select from "react-select";
import DataTable from "react-data-table-component";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import {
  EmployeeGetApi,
  EmployeePayslipsGet,
  AllEmployeePayslipsGet,
  TemplateGetAPI,
} from "../../Utils/Axios";

const ViewPaySlips = () => {
  const { control } = useForm();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [payslipData, setPayslipData] = useState([]);
  const [noRecords, setNoRecords] = useState(false);
  const [apiSource, setApiSource] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  const navigate = useNavigate();

  // Fetch employees list on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await EmployeeGetApi();
        const formattedData = data
          .filter((employee) => employee.firstName)
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
  }, []);

  // Fetch payslip template (if needed to choose a payslip document)
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await TemplateGetAPI();
        setCurrentTemplate(response.data.data);
        console.log("Fetched Payslip Template:", response.data.data);
      } catch (error) {
        console.error("Error fetching payslip template:", error);
        toast.error("Failed to fetch payslip template.");
      }
    };
    fetchTemplate();
  }, []);

  // Utility: Get last month's name
  const getLastMonth = () => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return now.toLocaleString("en-US", { month: "long" });
  };

  // Set default month/year on mount and fetch all payslips initially
  useEffect(() => {
    const defaultMonth = getLastMonth();
    const defaultYear = new Date().getFullYear().toString();
    setSelectedMonth(defaultMonth);
    setSelectedYear(defaultYear);
    // Fetch all payslips when no employee is selected
    fetchPayslipData("", defaultMonth, defaultYear);
  }, []);

  // Fetch payslip data
  const fetchPayslipData = async (empId, month, year) => {
    try {
      if (empId && month && year) {
        setApiSource("individual");
        const response = await EmployeePayslipsGet(empId, month, year);
        if (response.data.data.length === 0) {
          setNoRecords(true);
        } else {
          setPayslipData(response.data.data);
          setNoRecords(false);
        }
      } else {
        setApiSource("all");
        const response = await AllEmployeePayslipsGet(month, year);
        if (response.data.data.length === 0) {
          setNoRecords(true);
        } else {
          setPayslipData(response.data.data);
          setNoRecords(false);
        }
      }
    } catch (error) {
      console.error("Error fetching payslip data:", error);
      setNoRecords(true);
      toast.error("Error fetching payslip data.");
    }
  };

  // Get recent years for dropdown (last 11 years)
  const getRecentYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => (currentYear - i).toString());
  };

  // Handle employee selection change
  const handleEmployeeChange = (selectedOption) => {
    setSelectedEmployee(selectedOption);
    setSelectedEmployeeId(selectedOption.value);
  };

  // Filter payslip data based on selections
  const handleFilter = () => {
    if (selectedEmployeeId || selectedYear) {
      fetchPayslipData(selectedEmployeeId, selectedMonth, selectedYear);
    } else {
      toast.error("Please select at least a Year or Employee.");
    }
  };

  // Handle view payslip action
  const handleViewPayslip = (employeeId, payslipId) => {
    const templateNo = currentTemplate?.payslipTemplateNo || "default";
    let url = "";
    switch (templateNo) {
      case "1":
        url = `/payslipDoc1?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "2":
        url = `/payslipDoc2?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "3":
        url = `/payslipDoc3?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      case "4":
        url = `/payslipDoc4?employeeId=${employeeId}&payslipId=${payslipId}`;
        break;
      default:
        toast.error("Invalid payslip template number.");
        return;
    }
    navigate(url);
  };

  // DataTable columns (for "all" vs "individual" sources)
  const columns =
    apiSource === "all"
      ? [
          {
            name: (
              <h6>
                <b>S No</b>
              </h6>
            ),
            selector: (row, index) =>
              (currentPage - 1) * rowsPerPage + index + 1,
            width: "100px",
          },
          {
            name: (
              <h6>
                <b>Name</b>
              </h6>
            ),
            selector: (row) =>
              `${row.attendance.firstName} ${row.attendance.lastName}`,
            width: "200px",
          },
          {
            name: (
              <h6>
                <b>Month</b>
              </h6>
            ),
            selector: (row) => row.month,
            width: "150px",
          },
          {
            name: (
              <h6>
                <b>Year</b>
              </h6>
            ),
            selector: (row) => row.year,
            width: "100px",
          },
          {
            name: (
              <h6>
                <b>Net Amount</b>
              </h6>
            ),
            selector: (row) => parseFloat(row.salary.netSalary).toFixed(2),
            width: "150px",
          },
          {
            name: (
              <h6>
                <b>Actions</b>
              </h6>
            ),
            cell: (row) => (
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: "0",
                }}
                onClick={() => handleViewPayslip(row.employeeId, row.payslipId)}
                title="View Payslip"
              >
                <Eye size={22} color="green" />
              </button>
            ),
          },
        ]
      : [
          {
            name: (
              <h6>
                <b>Net Amount</b>
              </h6>
            ),
            selector: (row) => parseFloat(row.salary.netSalary).toFixed(2),
            width: "600px",
          },
          {
            name: (
              <h6>
                <b>Actions</b>
              </h6>
            ),
            cell: (row) => (
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  padding: "0",
                }}
                onClick={() => handleViewPayslip(row.employeeId, row.payslipId)}
                title="View Payslip"
              >
                <Eye size={22} color="green" />
              </button>
            ),
          },
        ];

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>PaySlips</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Payroll</li>
                <li className="breadcrumb-item active">PaySlips</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="card mb-3">
          <div className="card-header" style={{ paddingLeft: "90px" }}>
            <div className="row d-flex justify-content-start align-items-center">
              <div className="col-12 col-md-3 col-lg-3">
                <label className="card-title">
                  Select Employee <span className="text-danger">*</span>
                </label>
                <Select
                  options={employees}
                  onChange={handleEmployeeChange}
                  placeholder="Select Employee"
                  menuPortalTarget={document.body}
                />
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <label className="card-title">Select Month<span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
                  {Array.from({ length: 12 }, (_, i) =>
                    new Date(0, i).toLocaleString("en-US", { month: "long" })
                  ).map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-3 col-lg-3">
                <label className="card-title">
                  Select Year <span className="text-danger fw-100">*</span>
                </label>
                <select
                  className="form-select"
                  style={{
                    paddingBottom: "6px",
                    zIndex: "1",
                    height: "37px",
                  }}
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    fetchPayslipData(
                      selectedEmployeeId,
                      selectedMonth,
                      e.target.value
                    );
                  }}
                >
                  <option value="">Select Year</option>
                  {getRecentYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className="col-12 col-md-3 col-lg-3 d-flex justify-content-center align-items-center"
                style={{ marginTop: "30px" }}
              >
                <button
                  className="btn btn-primary"
                  onClick={handleFilter}
                  disabled={!selectedYear || !selectedEmployeeId}
                  style={{ paddingBottom: "8px" }}
                >
                  Go
                </button>
              </div>
            </div>
          </div>
          <div className="card-body">
            <h5 className="card-title mt-2 text-secondary">
              {selectedEmployee
                ? `${selectedEmployee.firstName} ${selectedEmployee.lastName} (${selectedEmployee.employeeId})`
                : "Employees"}{" "}
              in {selectedMonth ? selectedMonth : "Month"}{" "}
              {selectedYear ? `, ${selectedYear}` : ""}
            </h5>
            <hr />
            <div>
              {noRecords ? (
                <p className="text-center">No Payslip Found</p>
              ) : (
                <DataTable
                  columns={columns}
                  data={payslipData}
                  pagination
                  highlightOnHover
                  pointerOnHover
                  dense
                  onChangePage={(page) => setCurrentPage(page)}
                  onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </LayOut>
  );
};

export default ViewPaySlips;
