import React, { useEffect, useMemo, useState } from "react";
import { companyViewByIdApi, EmployeeGetApiById} from "../../../Utils/Axios";
import {toast } from "react-toastify";
import { useAuth } from "../../../Context/AuthContext";
import RelievingTemplate1 from "./RelievingTemplate1";
import RelievingTemplate2 from './RelievingTemplate2';
import RelievingTemplate3 from "./RelievingTemplate3";

const Preview = ({ previewData,selectedTemplate }) => { // Accept previewData as a prop
  const [companyData, setCompanyData] = useState({});
  const [loading, setLoading] = useState(false);
  const { user, logoFileName } = useAuth();
  const logo = "/assets/img/adapt_adapt_logo.png";

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
        <RelievingTemplate1
          companyLogo={logoFileName}
          companyData={companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          joiningDate={previewData.dateOfHiring}
          resignationDate={previewData.resignationDate}
          lastWorkingDate={previewData.lastWorkingDate}
          noticePeriod={previewData.noticePeriod}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <RelievingTemplate2
          companyLogo={logoFileName}
          companyData={companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          joiningDate={previewData.dateOfHiring}
          resignationDate={previewData.resignationDate}
          lastWorkingDate={previewData.lastWorkingDate}
          noticePeriod={previewData.noticePeriod}
        />
      ),
    },
    {
      title: "Template 3",
      name: "3",
      content: () => (
        <RelievingTemplate3
          companyLogo={logoFileName}
          companyData={companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          joiningDate={previewData.dateOfHiring}
          resignationDate={previewData.resignationDate}
          lastWorkingDate={previewData.lastWorkingDate}
          noticePeriod={previewData.noticePeriod}
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

export default Preview;
