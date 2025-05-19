import React, { useEffect, useMemo, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import AppraisalTemplate1 from "./AppraisalTemplate1";
import AppraisalTemplate2 from "./AppraisalTemplate2";
import { companyViewByIdApi, EmployeeGetApiById } from "../../Utils/Axios";
import { useAuth } from "../../Context/AuthContext";

const AppraisalPreview = ({ previewData, selectedTemplate }) => {
  const [companyData, setCompanyData] = useState({});
  const { user, companyLogo } = useAuth();
  const navigate = useNavigate();

  // Destructure previewData to get all the necessary fields
  const {
    employeeName,
    employeeId,
    designationName,
    dateOfHiring,
    resignationDate,
    lastWorkingDate,
    grossCompensation,
    timePeriod,
    dateOfSalaryIncrement,
    allowances,
    grossAmount
  } = previewData || {}; // Default to empty object if previewData is not available

  // Fetch company data based on the employee's companyId
  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  // Fetch employee details based on the employeeId from previewData
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      console.log("EmployeeId:", employeeId); // Log the employeeId for debugging
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  // When employeeId changes in previewData, fetch employee details
  useEffect(() => {
    if (employeeId) {
      fetchEmployeeDetails(employeeId);  // Use employeeId from previewData
    }
  }, [employeeId]);  // Re-run the effect if employeeId changes

  // Define templates using useMemo to avoid unnecessary re-renders
  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => {
        console.log("Preview Data for Template 1:", {
          companyLogo,
          companyData,
          employeeName,
          employeeId,
          designation: designationName,
          joiningDate: dateOfHiring,
          resignationDate,
          lastWorkingDate,
          salaryIncrease: grossCompensation,
          period: timePeriod,
          effectiveDate: dateOfSalaryIncrement,
          allowances,
        });
        return (
          <AppraisalTemplate1
            companyLogo={companyLogo}
            companyData={companyData}
            employeeName={employeeName}
            employeeId={employeeId}  
            designation={designationName}
            joiningDate={dateOfHiring}
            resignationDate={resignationDate}
            lastWorkingDate={lastWorkingDate}
            salaryIncrease={grossCompensation}
            period={timePeriod}
            effectiveDate={dateOfSalaryIncrement}
            allowances={allowances}
          />
        );
      },
    },
    {
      title: "Template 2",
      name: "2",
      content: () => {
        console.log("Preview Data for Template 2:", {
          companyLogo,
          companyData,
          employeeName,
          employeeId,
          designation: designationName,
          joiningDate: dateOfHiring,
          salaryIncrease: grossAmount, // Assuming you want to use grossAmount for salaryIncrease
          period: timePeriod,
          effectiveDate: dateOfSalaryIncrement,
          allowances,
        });
        return (
          <AppraisalTemplate2
          companyLogo={companyLogo}
          companyData={companyData}
          employeeName={employeeName}
          employeeId={employeeId}  
          designation={designationName}
          joiningDate={dateOfHiring}
          resignationDate={resignationDate}
          lastWorkingDate={lastWorkingDate}
          salaryIncrease={grossCompensation}
          period={timePeriod}
          effectiveDate={dateOfSalaryIncrement}
          allowances={allowances}
          />
        );
      },
    },
  ], [companyLogo, companyData, previewData]); // Recalculate when companyLogo, companyData, or previewData change

  // Select the template based on the `selectedTemplate`
  const selectedTemplateContent = useMemo(() => {
    const template = templates.find((t) => t.name === selectedTemplate);
    return template ? template.content() : <div>No template selected</div>;
  }, [selectedTemplate, templates]);

  return (
    <div className="container-fluid p-0">
      <div>
        {selectedTemplate && (
          <div className="mb-3">
            {selectedTemplateContent}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppraisalPreview;
