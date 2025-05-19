import React, { useEffect, useState } from "react";
import LayOut from "../LayOut/LayOut";
import { EmployeeGetApiById } from "../Utils/Axios";
import { useAuth } from "../Context/AuthContext";

const EmployeeProfile = () => {
    const [error, setError] = useState("");
    const [employeeData, setEmployeeData] = useState(false);
    const { user } = useAuth();
    console.log("EmployeeProfile", user.userId)
    useEffect(() => {
        if (!user.userId) return; 

        const fetchData = async () => {
            try {
                const response = await EmployeeGetApiById(user.userId);
                console.log("API Response:", response.data);
                setEmployeeData(response.data);
            } catch (error) {
                setError("Failed to fetch employee data");
                console.error("Error fetching employee data:", error);
            }
        };
        fetchData();
    }, [user.userId]); 


    return (
        <LayOut>
            <div className="container-fluid p-0">
                <div className="row d-flex align-items-center justify-content-between mt-1 mb-2">
                    <div className="col">
                        <h1 className="h3 mb-3"><strong>Profile</strong> </h1>
                    </div>
                    <div className="col-auto">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0">
                                <li className="breadcrumb-item">
                                    <a href="/main">Home</a>
                                </li>
                                <li className="breadcrumb-item active">
                                    Profile
                                </li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title ">
                                    Employee Data
                                </h5>
                                <div
                                    className="dropdown-divider"
                                    style={{ borderTopColor: "#d7d9dd" }}
                                />
                            </div>
                            <div className="card-body">
                                <div className="row ">
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">
                                            Employee Type
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="employeeType"
                                            value={employeeData.employeeType}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Employee ID</label>
                                        <input
                                            className="form-control"
                                            name="employeeId"
                                            value={employeeData.employeeId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">First Name </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={employeeData.firstName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={employeeData.lastName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Email Id</label>
                                        <input
                                            className="form-control"
                                            name="emailId"
                                            value={employeeData.emailId}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Date of Hiring</label>
                                        <input
                                            name="dateOfHiring"
                                            className="form-control"
                                            autoComplete="off"
                                            value={employeeData.dateOfHiring}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="department"
                                            value={employeeData.departmentName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                                        <label className="form-label">Designation</label>
                                        <input
                                            name="designation"
                                            type="text"
                                            className="form-control"
                                            value={employeeData.designationName}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">manager</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.manager}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.location}
                                            readOnly
                                        />
                                    </div>

                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Date of Birth</label>
                                        <input
                                            name="dateOfBirth"
                                            className="form-control"
                                            value={employeeData.dateOfBirth}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>

                                    <div className="col-12 col-md-6 col-lg-5 mb-2">
                                        <label className="form-label mb-3">Employee Status </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.status}
                                            name="status"
                                            readOnly
                                        />
                                    </div>
                                    <div className="card-header" style={{ paddingLeft: "0px" }}>
                                        <h5 className="card-title ">
                                            Bank Accoount Details
                                        </h5>
                                        <div
                                            className="dropdown-divider"
                                            style={{ borderTopColor: "#d7d9dd" }}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank Account Number </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.accountNo}
                                            name="accountNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank IFSC Code</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.ifscCode}
                                            name="ifscCode"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Bank Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.bankName}
                                            name="bankName"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">UAN Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.uanNo}
                                            name="uanNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">PAN Number</label>
                                        <input
                                            className="form-control"
                                            value={employeeData.panNo}
                                            name="panNo"
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-lg-1"></div>
                                    <div className="col-12 col-md-6 col-lg-5 mb-3">
                                        <label className="form-label">Aadhaar Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={employeeData.aadhaarId}
                                            name="aadhaarId"
                                            readOnly
                                        />
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

export default EmployeeProfile;