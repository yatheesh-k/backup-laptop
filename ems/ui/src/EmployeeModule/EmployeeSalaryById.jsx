import React, { useEffect, useState } from "react";
import { EmployeeSalaryGetApi } from "../Utils/Axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "react-bootstrap-icons";
import LayOut from "../LayOut/LayOut";
import { useAuth } from "../Context/AuthContext";

const EmployeeSalaryById = () => {
  const [employeeSalaryView, setEmployeeSalaryView] = useState([]);
  const [expanded, setExpanded] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toggleExpand = (index) => {
    setExpanded((prevState) => ({ ...prevState, [index]: !prevState[index] }));
  };

  useEffect(() => {
    if (user.userId) {
      EmployeeSalaryGetApi(user.userId).then((response) => {
        setEmployeeSalaryView(response.data.data);
      });
    }
  }, [user.userId]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active":
        return {
          backgroundColor: "green",
          color: "white",
          padding: "2px 8px",
          borderRadius: "4px",
        };
      case "InActive":
        return {
          backgroundColor: "red",
          color: "white",
          padding: "2px 8px",
          borderRadius: "4px",
        };
      default:
        return {
          backgroundColor: "gray",
          color: "white",
          padding: "2px 8px",
          borderRadius: "4px",
        };
    }
  };

  const handleEditClick = (salaryId, event) => {
    event.stopPropagation(); // Prevent the card from toggling when editing
    navigate(
      `/employeeSalaryView?salaryId=${salaryId}&employeeId=${user.userId}`
    ); // Navigate with both parameters
  };

  return (
    <LayOut>
      <div className="container mt-4">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Salary List</strong>{" "}
            </h1>
          </div>
          <div className="col-auto">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/main">Home</a>
                </li>
                <li className="breadcrumb-item active">Salary List</li>
              </ol>
            </nav>
          </div>
        </div>
        {employeeSalaryView.length > 0 ? (
          employeeSalaryView.map((item, index) => (
            <div key={index} className="card mb-3">
              <div
                className="card-header d-flex justify-content-between align-items-center"
                onClick={(e) => handleEditClick(item.salaryId, e)}
              >
                <h5 style={{ color: "#fff" }} className="mb-0">
                  {" "}
                  {index + 1}. Net Salary: {item.netSalary}
                </h5>
                <div className="d-flex align-items-center">
                  <span className="me-3" style={getStatusStyle(item.status)}>
                    {item.status}
                  </span>
                  <ChevronRight size={18} color="#fff" />
                </div>
              </div>
              {expanded[index] && (
                <div className="card-body">
                  <div className="row mb-3">
                    <div>
                      <h3>Salary</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Fixed Amount:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.fixedAmount}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Variable Amount:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.variableAmount}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Gross Amount:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.grossAmount}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row mb-3">
                    <div className="col mb-1">
                      <h3>Allowances</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Basic Salary:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.allowances
                              .basicSalary
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Travel Allowance:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.allowances
                              .travelAllowance
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    {/* <div className="col mb-3">
                      <div className="form-group">
                        <label>PF Contribution (Employee):</label>
                        <input type="text" className="form-control" value={item.allowances.pfContributionEmployee} readOnly />
                      </div>
                    </div> */}
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>HRA:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.salaryConfigurationEntity?.allowances.hra}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Special Allowance:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.allowances
                              .specialAllowance
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Other Allowances:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.allowances
                              .otherAllowances
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col-12 mb-3">
                      <div className="form-group">
                        <label>Total Earnings:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.totalEarnings}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row mt-4 mb-3">
                    <div className="col mb-1">
                      <h3>Deductions</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>PF (Employee):</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.deductions
                              .pfEmployee
                          }
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>PF (Employer):</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            item.salaryConfigurationEntity?.deductions
                              .pfEmployer
                          }
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>PF Tax:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.pfTax}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Income Tax:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.incomeTax}
                          readOnly
                        />
                      </div>
                    </div>
                    <div className="col mb-3">
                      <div className="form-group">
                        <label>Total Tax:</label>
                        <input
                          type="text"
                          className="form-control"
                          value={item.totalTax}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="row mt-4 mb-3">
                    <div className="col mb-1">
                      <h3>Net Amount</h3>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col mb-3">
                      <div className="form-group">
                        <input
                          type="text"
                          className="form-control"
                          value={item.netSalary}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center mt-5">
            <p className="mt-2 fw-bold">No salary data available.</p>
            <p className="mt-2 fw-500">
              For Any Query,please consider your Management.
            </p>
          </div>
        )}
      </div>
    </LayOut>
  );
};
export default EmployeeSalaryById;
