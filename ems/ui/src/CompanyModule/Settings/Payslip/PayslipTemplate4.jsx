import React from "react";
import { useAuth } from "../../../Context/AuthContext";

const PayslipTemplate4 = () => {
    const { logoFileName } = useAuth();

    return (
        <div>
            <div className="container mt-4" style={{ pointerEvents: "none" }}>
                <div className="card">
                    <div className="card-header mt-4" style={{ background: "none", paddingBottom: "0px", paddingLeft: "30px", paddingRight: "30px" }}>
                        <div className="header-content mt-4" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                {logoFileName ? (
                                    <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
                                ) : (
                                    <p>Logo</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="card-body m-0 p-2">
                        <div className="payslip-details">
                            <div style={{ padding: "20px" }}>
                                <table style={{ borderCollapse: "collapse", border: "1px solid black", width: "100%" }}>
                                    <tbody>
                                        <tr>
                                            <th colSpan={4} style={{ background: "#d3d3d3", color: 'black', paddingLeft: "5px", border: "1px solid black" }}><b>Company Name</b></th>
                                        </tr>
                                        <tr>
                                            <th colSpan={4} style={{ background: "#d3d3d3", color: 'black', paddingLeft: "5px", border: "1px solid black" }}><b>Payslip for Month-year</b></th>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Employee ID</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Name</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Department</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>PAN</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Designation</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>UAN</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Bank ACC No</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>IFSC</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Bank Name</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Location</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Total Days</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Worked Days</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                        <tr>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>LOP Days</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                            <th style={{ padding: "4px", width: "150px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black" }}>Date of Birth</th>
                                            <td style={{ padding: "4px", textAlign: "left", border: "1px solid black" }}></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="salary-details" style={{ padding: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ flex: 1, border: "1px solid black", borderRight: "none", borderBottom: "none" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "#d3d3d3", borderBottom: "1px solid black" }}>
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
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", background: "#d3d3d3", borderBottom: "1px solid black" }}>
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
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderTop: "1px solid black", borderBottom: "1px solid black", background: "#d3d3d3" }}>
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
                                                <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black", width: "25%" }}><b>Net Pay (A-B-C)</b></td>
                                                <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>0</b></td>
                                            </tr>
                                            <tr>
                                                <td className="earnings" colSpan={1} style={{ padding: "4px", textAlign: "left", background: "#d3d3d3", color: 'black', border: "1px solid black", width: "25%" }}><b>Net Salary (in words)</b></td>
                                                <td className="earnings" colSpan={3} style={{ textAlign: "left", border: "1px solid black" }}><b>Zero</b></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <span className="ms-4"><em>This is a computer-generated payslip and does not require authentication</em></span>
                            <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "1px", paddingBottom: "30px" }}>
                                &nbsp;&nbsp;
                            </div>
                            <div className="line" style={{ marginLeft: "20px", marginRight: "20px", color: "black " }}><hr /></div>
                            <div className="bottom" style={{ marginLeft: "50px", marginRight: "50px", marginTop: "20px", paddingBottom: "2px" }}>
                                <div className="line"></div>
                                <div className="company-details text-center" style={{ padding: "2px" }}>
                                    <h6>Company Address.</h6>
                                    <h6>Mobile No: </h6>
                                    <h6>Mail Id:</h6>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PayslipTemplate4;
