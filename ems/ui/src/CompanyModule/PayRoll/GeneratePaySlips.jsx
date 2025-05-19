import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Controller, useForm } from "react-hook-form";
import { Bounce, toast } from "react-toastify";
import DataTable from "react-data-table-component";
import LayOut from "../../LayOut/LayOut";
import {
  EmployeePayslipGeneration,
  EmployeePayslipGenerationPostById,
  EmployeePayslipResponse,
  TemplateGetAPI,
} from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";
import { PencilSquare } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";

const GeneratePaySlip = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();
  const [view, setView] = useState([]);
  const [show, setShow] = useState(false);
  const [attendanceNull, setAttendanceNull] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();

  const years = Array.from(
    { length: new Date().getFullYear() - 1999 },
    (_, i) => 2000 + i
  ).reverse();
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(0, i).toLocaleString("default", { month: "long" }),
  }));

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await TemplateGetAPI();
        setCurrentTemplate(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch payslip templates.");
      }
    };
    fetchTemplate();
  }, []);

  const handleEditClick = (employeeId, payslipId, salaryId, month, year) => {
    const payslipTemplateNo = currentTemplate?.payslipTemplateNo;

    if (payslipTemplateNo) {
      navigate(
        `/payslipUpdate${payslipTemplateNo}?employeeId=${employeeId}&payslipId=${payslipId}&salaryId=${salaryId}&month=${month}&year=${year}`
      );
    } else {
      toast.error("Payslip template number not found.");
    }
  };

  const onSubmit = async ({ month, year }) => {
    try {
      const response = await EmployeePayslipResponse(user.salaryId, {
        companyName: user.company,
        month: month.label,
        year: year.label,
      });
      setView(response.data.data.generatePayslip);

      // Log the attendance data received from the API
      console.log(
        "Attendance Data from API:",
        response.data.data.employeesWithoutAttendance
      );

      setAttendanceNull(response.data.data.employeesWithoutAttendance || []); // Ensure it's always an array
      setSelectedMonthYear(`${month.label} ${year.label}`);
      setShow(true);
    } catch (error) {
      // Try to get the error message from the response data
      const errorData = error.response?.data?.data;
      if (errorData) {
        const attendanceError =
          typeof errorData === "string" ? [errorData] : errorData;
        setAttendanceNull(attendanceError);
        console.log("Attendance Error Data:", attendanceError);
      } else {
        setAttendanceNull([]);
        console.log("Attendance Error Data: []");
      }
      const errorMessage =
        error.response?.data?.error?.message || "Error fetching payslip data.";
      // toast.error(errorMessage);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedEmployees(
      selectAll
        ? []
        : view.map((emp) => ({
            employeeId: emp.employeeId,
            salaryId: emp.salaryId,
          }))
    );
  };

  const handleCheckboxChange = (employeeId, salaryId) => {
    setSelectedEmployees((prev) =>
      prev.some((emp) => emp.employeeId === employeeId)
        ? prev.filter((emp) => emp.employeeId !== employeeId)
        : [...prev, { employeeId, salaryId }]
    );
  };

  const handleGeneratePaySlips = async () => {
    if (selectedEmployees.length === 0)
      return toast.error("Please select at least one employee.");
    if (!selectedMonthYear) return toast.error("Please select month and year.");

    try {
      const [month, year] = selectedMonthYear.split(" ");
      await Promise.all(
        selectedEmployees.map(({ employeeId, salaryId }) =>
          EmployeePayslipGenerationPostById(employeeId, salaryId, {
            companyName: user.company,
            month,
            year,
          })
        )
      );
      toast.success("PaySlips Generated Successfully", {
        transition: Bounce,
        autoClose: 3000,
      });
      navigate("/payslipsList");
    } catch (error) {
      toast.error("Failed to generate payslips.");
    }
  };

  const columns = [
    {
      name: (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
      ),
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedEmployees.some(
            (emp) => emp.employeeId === row.employeeId
          )}
          onChange={() => handleCheckboxChange(row.employeeId, row.salaryId)}
        />
      ),
      width: "90px",
    },
    {
      name: (
        <h6>
          <b>S No</b>
        </h6>
      ),
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      width: "90px",
    },
    {
      name: (
        <h6>
          <b>Name</b>
        </h6>
      ),
      selector: (row) => {
        const firstName = row.attendance.firstName || ""; // Ensure firstName is a string
        const lastName = row.attendance.lastName || ""; // Ensure lastName is a string

        return (
          <div title={`${firstName} ${lastName}`}>
            {`${
              firstName.length > 18 ? firstName.slice(0, 10) + "..." : firstName
            } ${
              lastName.length > 10 ? lastName.slice(0, 10) + "..." : lastName
            }`}
          </div>
        );
      },
      width: "190px",
    },
    {
      name: (
        <h6>
          <b>Email ID</b>
        </h6>
      ),
      selector: "attendance.emailId",
      cell: (row) => row.attendance.emailId,
      width: "220px",
    },
    {
      name: (
        <h6>
          <b>Net Salary</b>
        </h6>
      ),
      selector: "salary.netSalary",
      cell: (row) => row.salary.netSalary,
      width: "150px",
    },
    {
      name: (
        <h6>
          <b>Month/Year</b>
        </h6>
      ),
      cell: (row) => `${row.month}/${row.year}`,
      width: "200px",
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
            marginRight: "10px",
          }}
          onClick={() =>
            handleEditClick(
              row.employeeId,
              row.payslipId,
              row.salaryId,
              row.month,
              row.year
            )
          } // Pass employeeId, month, and year
          title="Edit"
        >
          <PencilSquare size={22} color="#2255a4" />
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
              <strong>Generate Payslips</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Payroll</li>
                <li className="breadcrumb-item active">Generate Payslips</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title" style={{ marginBottom: "0px" }}>
                  Generate PaySlips
                </h5>
                <div
                  className="dropdown-divider"
                  style={{ borderTopColor: "#D7D9DD" }}
                />
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Select Year</label>
                      <Controller
                        name="year"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={years.map((y) => ({ value: y, label: y }))}
                          />
                        )}
                      />
                      {errors.year && <p>Year is Required</p>}
                    </div>
                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                      <label className="form-label">Select Month</label>
                      <Controller
                        name="month"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={months}
                          />
                        )}
                      />
                      {errors.month && <p>Month is Required</p>}
                    </div>
                    <div className="col-12 col-md-6 col-lg-2 mt-4">
                      <button
                        className="btn btn-primary btn-lg"
                        type="submit"
                        style={{ marginRight: "65px" }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              {attendanceNull.length > 0 && (
                <div className="col-md-6 col-lg-4 mx-auto alert alert-danger text-center">
                  {attendanceNull.map((error, index) => (
                    <p style={{ marginBottom: "0px" }} key={index}>
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {show && (
        <DataTable
          data={view}
          columns={columns}
          pagination
          paginationPerPage={rowsPerPage}
          onChangePage={setCurrentPage}
          onChangeRowsPerPage={setRowsPerPage}
        />
      )}
      {show && (
        <div className="m-3 d-flex justify-content-end bg-transparent">
          <button
            className="btn btn-primary"
            type="button"
            onClick={handleGeneratePaySlips}
          >
            Generate PaySlips
          </button>
        </div>
      )}
    </LayOut>
  );
};

export default GeneratePaySlip;
