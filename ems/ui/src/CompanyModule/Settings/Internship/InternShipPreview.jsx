import React, {useMemo} from "react";
import InternShipTemplate2 from "./InternShipTemplate2";
import InternshipTemplate1 from "./InternshipTemplate1";

const InternShipPreview = ({ previewData, selectedTemplate }) => { // Accept previewData as a prop

  const templates = useMemo(() => [
    {
      title: "Template 1",
      name: "1",
      content: () => (
        <InternshipTemplate1
         companyLogo={previewData.companyLogo}
         companyData={previewData.companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          designation={previewData.designationName}
          department={previewData.departmentName}
          startDate={previewData.startDate}
          endDate={previewData.lastWorkingDate}
        />
      ),
    },
    {
      title: "Template 2",
      name: "2",
      content: () => (
        <InternShipTemplate2
        companyLogo={previewData.companyLogo}
         companyData={previewData.companyData}
          employeeName={previewData.employeeName}
          employeeId={previewData.employeeId}
          department={previewData.departmentName}
          designation={previewData.designationName}
          joiningDate={previewData.dateOfHiring}
          startDate={previewData.startDate}
          endDate={previewData.lastWorkingDate}
        />
      ),
    },
  ], [previewData]);

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

export default InternShipPreview;
