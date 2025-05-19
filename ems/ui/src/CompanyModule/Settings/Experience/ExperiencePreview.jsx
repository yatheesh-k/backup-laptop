import React, { useEffect, useMemo, useState } from "react";
import { Bounce, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ExperienceTemplate1 from "./ExperienceTemplate1";
import ExperienceTemplate2 from "./ExperienceTemplate2";
import { useAuth } from "../../../Context/AuthContext";
import { companyViewByIdApi, EmployeeGetApiById} from "../../../Utils/Axios";

const ExperiencePreview = ({ previewData, selectedTemplate }) => { // Accept previewData as a prop
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user,logoFileName } = useAuth();
  console.log("preview",previewData)
  const fetchCompanyData = async (companyId) => {
    try {
      const response = await companyViewByIdApi(companyId);
      setCompanyData(response.data);
    } catch (err) {
      console.error("Error fetching company data:", err);
      toast.error("Failed to fetch company data");
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await EmployeeGetApiById(employeeId);
      if (response.data.companyId) {
        fetchCompanyData(response.data.companyId);
      }
    } catch (err) {
      console.error("Error fetching employee details:", err);
      toast.error("Failed to fetch employee details");
    }
  };

  useEffect(() => {
    const userId = user.userId;
    setLoading(true);
    if (userId) {
      fetchEmployeeDetails(userId);
    }
    setLoading(false);
  }, [user.userId]);

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <ExperienceTemplate1
          companyLogo={logoFileName}
          companyData={previewData.companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          joiningDate={previewData.joiningDate}
          experienceDate={previewData.experienceDate}
          date={previewData.date}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <ExperienceTemplate2
          companyLogo={logoFileName}
          companyData={previewData.companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          joiningDate={previewData.joiningDate}
          experienceDate={previewData.experienceDate}
          date={previewData.date}
        />
      ),
    },
  ], [companyData, logoFileName, previewData]);

  const selectedTemplateContent = useMemo(() => {
    const template = templates.find(t => t.name === selectedTemplate);
    return template ? template.content() : <div className="text-dark">No template selected</div>;
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

export default ExperiencePreview;
