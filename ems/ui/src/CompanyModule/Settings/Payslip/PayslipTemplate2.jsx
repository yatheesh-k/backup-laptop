import React from "react";
import { useAuth } from "../../../Context/AuthContext";

const PayslipTemplate2 = () => {
    const { logoFileName } = useAuth();

    return (
        <div>
            <div className="container mt-4" style={{ pointerEvents: "none" }}>
                <div className="card">
                    <div className="card-header mt-4" style={{ background: "none", padding:"0px 25px",borderBottomWidth:"0px" }}>
                        <div className="header-content mt-4" style={{ textAlign: "center", alignItems: "center", backgroundColor: "#9EEAF9", border: "1px solid black", borderBottom: "none" }}>
                            <div style={{paddingTop:"20px"}}>
                                {logoFileName ? (
                                    <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                                ) : (
                                    <p>Logo</p>
                                )}
                            </div>
                            <div className="company-details text-center" style={{ padding: "2px" }}>
                                <h6>Company Address.</h6>
                                <h6>Mobile No: </h6>
                                <h6>Mail Id:</h6>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: "center", margin:"0px 25px"}}>
                        <h3 style={{marginBottom:"0px", borderLeft:"1px solid black", borderRight:"1px solid black"}}>SALARY SLIP</h3>
                    </div>
                    <div className="card-body" style={{ padding:"0px 25px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", backgroundColor: "#9EEAF9", paddingTop: "10px", borderLeft: "1px solid black", borderRight: "1px solid black" }}>
                            <h4 style={{ textAlign: "center", paddingLeft: "130px" }}>Employee Details</h4>
                            <h4 style={{ textAlign: "center", marginRight: "130px" }}>Month-Year</h4>
                        </div>
                        <div className="salary-details" style={{ borderLeft: "1px solid black", borderRight: "1px solid black" }} >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, borderRight: "none", borderBottom: "none" }}>
                                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2px" }}>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>EmployeeId</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>Department</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>Designation</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>Bank ACC No</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>Total Days</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                    </ul>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black", paddingTop: "10px", paddingBottom: "10px" }}><b>LOP Days</b></span>
                                        <span style={{ marginRight: "15px", color: "black" }}>----</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, borderBottom: "none", overflow: "hidden" }}>
                                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2px" }}>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>Name</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black", paddingTop: "10px" }}><b>PAN</b></span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>----</span>
                                        </li>
                                    </ul>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black", paddingTop: "10px" }}><b>UAN</b></span>
                                        <span style={{ marginRight: "15px", color: "black" }}>----</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black", paddingTop: "10px" }}><b>IFSC</b></span>
                                        <span style={{ marginRight: "15px", color: "black" }}>----</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black", paddingTop: "10px" }}><b>Worked Days</b></span>
                                        <span style={{ marginRight: "15px", color: "black" }}>----</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black", paddingTop: "10px", paddingBottom: "10px" }}><b>Date of Birth</b></span>
                                        <span style={{ marginRight: "15px", color: "black" }}>----</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="salary-details">
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <div style={{ flex: 1, border: "1px solid black", borderRight: "none", borderBottom: "none" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid black" }}>
                                        <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", color: "black", margin: 0 }}>Earnings</p>
                                        <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", color: "black", margin: 0 }}>Amount</p>
                                    </div>
                                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2px" }}>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Allowance 1</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Allowance 2</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Allowance 3</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Allowance 4</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Allowance 5</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                    </ul>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black" }}>Total Earnings (A)</span>
                                        <span style={{ marginRight: "15px", color: "black" }}>0</span>
                                    </div>
                                </div>
                                <div style={{ flex: 1, border: "1px solid black", borderBottom: "none", overflow: "hidden" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid black" }}>
                                        <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", color: "black", margin: 0 }}>Deductions</p>
                                        <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "15px", color: "black", margin: 0 }}>Amount</p>
                                    </div>
                                    <ul style={{ listStyleType: "none", padding: 0, marginBottom: "2px" }}>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Deduction 1</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                        <li style={{ display: "flex", padding: "4px 8px", alignItems: "center" }}>
                                            <span style={{ flex: 1, color: "black" }}>Deduction 2</span>
                                            <span style={{ flex: 1, color: "black", textAlign: "right", marginRight: "15px" }}>0</span>
                                        </li>
                                    </ul>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black" }}>Total Deductions (B)</span>
                                        <span style={{ marginRight: "15px", color: "black" }}>0</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderTop: "1px solid black", borderBottom: "1px solid black" }}>
                                        <p style={{ fontSize: "15px", fontWeight: "bold", color: "black", marginBottom: "0px" }}>Taxes</p>
                                        <p style={{ fontSize: "15px", fontWeight: "bold", color: "black", marginBottom: "0px" }}>Amount</p>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black" }}>Income Tax</span>
                                        <span style={{ marginRight: "15px", color: "black" }}>0</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black" }}>Pf Tax</span>
                                        <span style={{ marginRight: "15px", color: "black" }}>0</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px" }}>
                                        <span style={{ color: "black" }}>Total Tax (C)</span>
                                        <span style={{ marginRight: "15px", color: "black" }}>0</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <tbody>
                                        <tr>
                                            <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#9EEAF9", color: 'black', border: "1px solid black", width: "25%" }}><b>Net Pay (A-B-C)</b></td>
                                            <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>0</b></td>
                                        </tr>
                                        <tr>
                                            <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#9EEAF9", color: 'black', border: "1px solid black", width: "25%" }}><b>Net Salary (in words)</b></td>
                                            <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>Zero</b></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <span className="mt-4"><em>This is a computer-generated payslip and does not require authentication</em></span>
                        <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "1px", paddingBottom: "30px" }}>
                            &nbsp;&nbsp;
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipTemplate2;
