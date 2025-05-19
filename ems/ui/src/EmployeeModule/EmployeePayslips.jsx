import React, { useEffect, useState } from "react";
import Select from "react-select";
import LayOut from "../LayOut/LayOut";
import { useNavigate } from "react-router-dom";
import { Eye, XSquareFill } from "react-bootstrap-icons";
import { toast, Bounce } from "react-toastify";
import DataTable from "react-data-table-component";
import DeletePopup from "../Utils/DeletePopup";
import {EmployeePayslipDeleteById, EmployeePayslipsGet, EmployeeGetApiById, TemplateGetAPI } from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";

const EmployeePayslips = () => {
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const [employeeDetails, setEmployeeDetails] = useState({});
  const [showFields, setShowFields] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState("");
  const [refreshData, setRefreshData] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const { user} = useAuth();
  const navigate = useNavigate();
  console.log("userId:", user.userId);
  const id = user.userId;
  console.log(id);

  const fetchTemplate = async () => {
    try {
      const response = await TemplateGetAPI();
      const templateData = response.data.data; // Assuming this is where your template details are
      setCurrentTemplate(templateData); // Set the template data correctly
      console.log("Fetched Payslip Template:", templateData); // Log for debugging
    } catch (error) {
      console.error("API fetch error:", error);
      toast.error("Failed to fetch payslip templates. Please try again.");
    }
  };

  useEffect(() => {
    fetchTemplate();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) { console.log("userId",id);
          const [employeeDetailsResponse, payslipsResponse] = await Promise.all(
            [
              EmployeeGetApiById(id),
             
              EmployeePayslipsGet(
                id,
                selectedMonth,
                selectedYear
              ),
            ]
          );
          setEmployeeDetails(employeeDetailsResponse.data);
          setEmployeeSalaryView(payslipsResponse.data.data);
        } else {
          setEmployeeDetails({});
          setEmployeeSalaryView([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setEmployeeDetails({});
        setEmployeeSalaryView([]);

        const currentYear = new Date().getFullYear();
        const startYear = 2000;
        const years = Array.from(
          { length: currentYear - startYear + 1 },
          (_, index) => ({
            value: (startYear + index).toString(),
            label: (startYear + index).toString(),
          })
        ).reverse();
        const months = Array.from({ length: 12 }, (_, index) => ({
          value: { value: (index + 1).toString().padStart(2, "0"), label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }) },
          label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }),
        }));


      }
    };

    fetchData();
  }, [id, selectedMonth, selectedYear, refreshData]);

  const handleGoClick = () => {
    setShowFields(true); // Display payslip details
    setRefreshData(prev => !prev); // Trigger fetchData with updated selectedYear and selectedMonth
  };


  const handleViewSalary = (employeeId, payslipId) => {
    const payslipTemplateNo = currentTemplate?.payslipTemplateNo || "default";
    let url;
    switch (payslipTemplateNo) {
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
        console.error("Invalid payslip template number:", payslipTemplateNo);
        return;
    }

    navigate(url, {
      state: {
        employeeDetails: selectedEmployeeDetails,
      },
    });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedPayslipId("");
  };

  const handleShowDeleteModal = (payslipId) => {
    setSelectedPayslipId(payslipId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await EmployeePayslipDeleteById(id, selectedPayslipId);
      toast.success("Payslip deleted successfully!", {
        position: "top-right",
        transition: Bounce,
        hideProgressBar: true,
        theme: "colored",
        autoClose: 3000,
      });
      handleCloseDeleteModal();
      setRefreshData((prev) => !prev); // Toggle refreshData state
    } catch (error) {
      handleApiErrors(error);
    }
  };

  const handleApiErrors = (error) => {
    if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
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
          <b>S No</b>
        </h6>
      ),
      selector: (row, index) => index + 1,
      width: "150px",
    },
    {
      name: (
        <h6>
          <b>Net Amount</b>
        </h6>
      ),
      selector: (row) => parseFloat(row.salary.netSalary).toFixed(2),
      sortable: true,
    },
    {
      name: (
        <h6>
          <b>Month</b>
        </h6>
      ),
      selector: (row) => row.month,
      sortable: true,
    },
    {
      name: (
        <h6>
          <b>Year</b>
        </h6>
      ),
      selector: (row) => row.year,
      sortable: true,
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
              padding: "0",
              marginLeft: "5px",
            }}
            onClick={() => handleViewSalary(row.employeeId, row.payslipId)}
          >
            <Eye size={22} color="green" />
          </button>
        </div>
      ),
    },
  ];

  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, index) => ({
      value: (startYear + index).toString(),
      label: (startYear + index).toString(),
    })
  ).reverse();
  const months = Array.from({ length: 12 }, (_, index) => ({
    value: (index + 1).toString().padStart(2, "0"),
    label: new Date(2000, index, 1).toLocaleString("default", { month: "long" }),
  }));

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>PaySlips</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: '20px' }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">PaySlips</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">PaySlips</h5>
                <div className="dropdown-divider" style={{ borderTopColor: "#D7D9DD" }} />
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-12 col-md-6 col-lg-5 mb-3">
                    <label className="form-label">Select Year</label>
                    <Select
                      options={years}
                      value={years.find(option => option.value === selectedYear)}
                      onChange={(selectedOption) => setSelectedYear(selectedOption.value)}
                      placeholder="Select Year"
                      style={{ marginLeft: "10px" }}
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-5 mb-3">
                    <label className="form-label">Select Month</label>
                    <Select
                      options={months}
                      value={months.find(option => option.label === selectedMonth)}
                      onChange={(selectedOption) => setSelectedMonth(selectedOption.label)}
                      placeholder="Select Month"
                    />
                  </div>
                  <div className="col-12 col-md-6 col-lg-2 mt-4">
                    <button
                      className="btn btn-primary btn-lg"
                      type="submit"
                      style={{ marginRight: "65px" }}
                      onClick={handleGoClick}
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showFields && (
          <div className="card">
            <div className="card-body">
              <DataTable
                columns={columns}
                data={employeeSalaryView}
                pagination
                progressPending={showSpinner}
              />
            </div>
          </div>
        )}
        <DeletePopup
          show={showDeleteModal}
          onHide={handleCloseDeleteModal}
          onDelete={handleDelete}
        />
      </div>
    </LayOut>
  );
};

export default EmployeePayslips;
