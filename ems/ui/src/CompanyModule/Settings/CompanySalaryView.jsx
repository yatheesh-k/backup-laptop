import React, { useEffect, useState } from "react";
import LayOut from "../../LayOut/LayOut";
import { useForm } from "react-hook-form";
import { CompanySalaryStructureGetApi } from "../../Utils/Axios";
import { Link } from "react-router-dom";
import {
  ChevronBarDown,
  ChevronDown,
  PencilSquare,
} from "react-bootstrap-icons";
import { useAuth } from "../../Context/AuthContext";

const CompanySalaryView = () => {
  const {
    register,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const { user } = useAuth();

  const fetchSalary = async () => {
    try {
      const response = await CompanySalaryStructureGetApi();
      setSalaryStructures(response.data.data);
      console.log("Fetched salary structures:", response.data.data);
    } catch (error) {
      console.error("API fetch error:", error);
    }
  };

  useEffect(() => {
    fetchSalary();
  }, []);

  const formatFieldName = (fieldName) => {
    return fieldName
      .split(" ")
      .map((token) => {
        if (token === token.toUpperCase()) {
          return token;
        }
        return token
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
      })
      .join(" ");
  };  
  
  const toggleExpand = (id) => {
    console.log("Current expandedId:", expandedId);
    console.log("Clicked id:", id);
    setExpandedId((prevId) => (prevId === id ? null : id));
  };

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

  return (
    <LayOut>
      <div className="container-fluid p-0">
        <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
          <div className="col">
            <h1 className="h3 mb-3">
              <strong>Salary View</strong>
            </h1>
          </div>
          <div className="col-auto" style={{ paddingBottom: "20px" }}>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/main">Home</Link>
                </li>
                <li className="breadcrumb-item active">Salary View</li>
              </ol>
            </nav>
          </div>
        </div>
        {user && user.userRole && user.userRole.includes("company_admin") && (
          <div className="col-12 col-md-6 col-lg-4 mb-3">
            <Link to="/companySalaryStructure">
              <button className="btn btn-primary">Add Salary Structure</button>
            </Link>
          </div>
        )}
        <div className="row">
          {salaryStructures.map((structure, index) => {
            // const isReadOnly = structure.status === 'InActive';
            return (
              <div key={structure.id}>
                <div className="card">
                  <div
                    className="card-header d-flex justify-content-between align-items-center"
                    style={{ cursor: "pointer" }}
                  >
                    <h5 className="mb-0 card-title">S.No: {index + 1}</h5>
                    <div className="d-flex align-items-center">
                      <span
                        className="me-3"
                        style={getStatusStyle(structure.status)}
                      >
                        {structure.status}
                      </span>
                      <ChevronDown
                        size={22}
                        color="#fff"
                        onClick={() => {
                          toggleExpand(structure.id); // Use id from the response
                        }}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                  {expandedId === structure.id && ( // Compare with id
                    <div className="card-body">
                      <div className="row">
                        <div className="col-12 col-md-5 mb-3">
                          <h5>Allowances</h5>
                          <hr />
                          {Object.keys(structure.allowances).length > 0 ? (
                            Object.keys(structure.allowances)
                              .sort((a, b) => {
                                if (a === "Basic Salary") return -1;
                                if (b === "Basic Salary") return 1;
                                if (a === "HRA") return -1;
                                if (b === "HRA") return 1;
                                return 0;
                              })
                              .map((allowance) => (
                                <div key={allowance} className="mb-2">
                                  <label className="form-label">
                                    {formatFieldName(allowance)}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    readOnly
                                    defaultValue={
                                      structure.allowances[allowance]
                                    }
                                    {...register(`allowances.${allowance}`, {
                                      required: "Value is required",
                                      pattern: {
                                        value: /^[0-9]+$/,
                                        message:
                                          "This field accepts only integers",
                                      },
                                    })}
                                  />
                                  {errors.allowances?.[allowance] && (
                                    <p className="text-danger">
                                      {errors.allowances[allowance]?.message}
                                    </p>
                                  )}
                                </div>
                              ))
                          ) : (
                            <p>No allowances found.</p>
                          )}
                        </div>
                        <div className="col-lg-1"></div>
                        <div className="col-12 col-md-5 mb-3">
                          <h5>Deductions</h5>
                          <hr />
                          {Object.keys(structure.deductions).length > 0 ? (
                            Object.keys(structure.deductions).map(
                              (deduction) => (
                                <div key={deduction} className="mb-2">
                                  <label className="form-label">
                                    {formatFieldName(deduction)}
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    readOnly
                                    defaultValue={
                                      structure.deductions[deduction]
                                    }
                                    {...register(`deductions.${deduction}`, {
                                      required: "Value is required",
                                      pattern: {
                                        value: /^[0-9]+$/,
                                        message:
                                          "This field accepts only integers",
                                      },
                                    })}
                                  />
                                  {errors.deductions?.[deduction] && (
                                    <p className="text-danger">
                                      {errors.deductions[deduction]?.message}
                                    </p>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <p>No deductions found.</p>
                          )}
                        </div>
                        {/* <div className="col-lg-1"></div>
                                                <div className="col-12 d-flex justify-content-end mt-5">
                                                    <button type="submit" className="btn btn-primary">
                                                        Update
                                                    </button>
                                                </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LayOut>
  );
};

export default CompanySalaryView;
