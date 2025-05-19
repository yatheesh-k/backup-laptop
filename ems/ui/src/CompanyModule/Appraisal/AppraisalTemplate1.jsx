import React, { useEffect, useState } from 'react';
import { companyViewByIdApi, EmployeeGetApiById } from '../../Utils/Axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';
import { useLocation } from 'react-router-dom';

const AppraisalTemplate1 = ({
  companyLogo,
  companyAddress,
  companyName,
  contactNumber,
  mailId,
  employeeName,
  designation,
  employeeId, // Ensure employeeId is passed as a prop
  period,
  effectiveDate,
  salaryIncrease,
  allowances,
}) => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState(null);
  const { user, logoFileName } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const idFromQuery = queryParams.get('employeeId'); // Extract employeeId from URL query params if needed

  // Function to fetch company data
  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      const data = response.data;
      setCompanyDetails(data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  // Function to fetch employee details using employeeId
  const fetchEmployeeDetails = async (id) => {
    try {
      console.log("Fetching details for employeeId:", id);
      const response = await EmployeeGetApiById(id);
      console.log(response.data); // Inspect the structure of the response
      setEmployeeDetails(response.data);
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      // toast.error("Failed to fetch employee details");
    }
  };

  useEffect(() => {
    const idToUse = employeeId || idFromQuery || user.userId; // Fallback to employeeId, query param, or userId
    setLoading(true);
    if (idToUse) {
      fetchEmployeeDetails(idToUse); // Fetch employee details using employeeId
    }
    setLoading(false);
  }, [employeeId, idFromQuery, user.userId]);

  return (
    <div className="watermarked" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <div style={{ textAlign: "right" }}>
        {logoFileName ? (
          <img className="align-middle" src={logoFileName} alt="Logo" style={{ height: "80px", width: "180px" }} />
        ) : (
          <p>Logo</p>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          backgroundImage: `url(${logoFileName})`,
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />

      <h4 className="text-center p-3">APPRAISAL LETTER</h4>

      {loading ? (
        <p>Loading employee details...</p>
      ) : employeeDetails ? (
        <div className="row d-flex justify-content-between p-1">
          <div className="col-6">
            <p className="mb-0"><h6>To</h6></p>
            <p><strong>{employeeDetails?.firstName || "N/A"}</strong></p>
            <p><strong>Designation: {designation || "N/A"}</strong></p>
            <p><strong>Emp Id: {employeeDetails?.employeeId || "N/A"}</strong></p>
          </div>
          <div className="col-6">
            <p className="mb-0 text-end">
              {new Date().toISOString().split('T')[0]}
            </p>
          </div>
        </div>
      ) : (
        <p>No employee details available</p>
      )}

      <div style={{ position: "relative", zIndex: 2, backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(2px)" }}>
        <p className="p-2">
          Sub: <strong>Increment of Salary</strong>
        </p>
        <p className="p-2">
          Dear <strong>{employeeDetails?.firstName || "Employee"}</strong>,
        </p>
        <p>
          We would like to congratulate you on completing a {period} year period with us. We are pleased to inform you of your salary increase effective from{" "}
          <strong>{effectiveDate}</strong>. The amount of your salary increase is <strong>Rs. {salaryIncrease} pa</strong>. We understand this is a sustainable increase in your pay and we appreciate your hard work and dedication to the company. All other T&C are the same as per the original offer letter.
        </p>
        <table className="table border-collapse mb-5">
          <thead>
            <tr className='text-center'>
              <th>Particulars</th>
              <th>Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            {allowances && Object.keys(allowances).map((key, index) => {
              const value = allowances[key];

              let allowanceAmount = 0;

              // Check if the value contains a '%' (percentage)
              if (typeof value === 'string' && value.includes('%')) {
                // Extract the numeric part and calculate the allowance as a percentage of salaryIncrease
                const percentageValue = parseFloat(value.slice(0, -1)); // Remove '%' and convert to a number
                allowanceAmount = salaryIncrease * (percentageValue / 100);
              } else {
                // Otherwise, treat the value as a fixed amount
                allowanceAmount = parseFloat(value); // Convert to number directly
              }

              return (
                <tr key={index}>
                  <td>{key}</td>
                  {/* Show the allowance amount (rounded to nearest integer) */}
                  <td>{Math.floor(allowanceAmount.toFixed(2))}</td>
                </tr>
              );
            })}
            <tr>
              <td><strong>Other Allowance</strong></td>
              {/* <td>{Math.floor(grossAmount - calculatedValues.totalAllowances)}</td> */}
            </tr>
            {/* Add a row for Gross Salary after the allowances */}
            {salaryIncrease && (
              <tr>
                <td><strong>Gross Salary</strong></td>
                <td><strong>{salaryIncrease}</strong></td>
              </tr>
            )}
          </tbody>

        </table>

        <p>
          We appreciate your initiative and expect you to take many more such responsibilities in future assignments to ensure company’s growth.
        </p>

        <div className="mt-5 pt-3">
          <p className="mb-5">With Best Wishes,</p>
          <div className="mt-5 pt-5">
            <p>Authorized Signature</p>
            <h6>{companyDetails?.companyName}</h6>
            <h6>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId} </h6>
            <h6>{companyDetails?.companyAddress}</h6>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppraisalTemplate1;
