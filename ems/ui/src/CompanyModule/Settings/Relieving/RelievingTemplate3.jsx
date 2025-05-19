import React from "react";
import { useAuth } from "../../../Context/AuthContext";

const RelievingTemplate3 = ({
  companyLogo,
  companyData,
  employeeName,
  employeeId,
  designation,
  joiningDate,
  noticePeriod,
  resignationDate,
  lastWorkingDate,
}) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const date = formatDate(new Date());
  
  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        position: "relative",
      }}
    >
      <h4 className="text-center mt-2">Relieving Letter</h4>
      {/* Company Logo positioned at the top right */}
      <img
        src={companyLogo}
        alt={`${companyData.companyName} Logo`}
        style={{
          maxWidth: "150px",
          position: "absolute",
          top: "20px",
          right: "20px",
          height: "100px",
          width: "160px",
        }}
      />
      <p className="mb-2">{date}</p>
      <h5 className="text-center p-4">TO WHOMSOEVER IT MAY CONCERN</h5>
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          backgroundImage: `url(${companyLogo})`, // Use the logo or another image
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          //  filter: 'blur(2px)', // Optional: adjust blur as needed
          zIndex: 1, // Ensure it's behind the content
        }}
      />
      <div
        className="mt-3"
        style={{
          position: "relative",
          zIndex: 2, // Bring the content in front
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: semi-transparent background for contrast
        }}
      >
        <div className="mt-3">
          <p className="p-2">
            Dear <strong>{employeeName}</strong>
          </p>
          <p>
            I am writing in response to your resignation letter dated{" "}
            <strong>{resignationDate}</strong>, in which you requested to resign
            from your position as <strong>{designation}</strong>, serving a
            notice period of <strong>{noticePeriod}</strong>. Your services with
            our organization will be concluded on{" "}
            <strong>{lastWorkingDate}</strong>.
          </p>
          <p>
            We kindly request you to return your company ID and any other
            company-owned items that you have been using during your tenure with
            our firm.
          </p>
          <p>
            We want to officially confirm the acceptance of your resignation.
            Effective as of the office closing hours on{" "}
            <strong>{lastWorkingDate}</strong>, you will be relieved from your
            duties.
          </p>
          <p>
            We also wish to confirm that your final settlement with the
            organization has been successfully processed. We genuinely
            appreciate your contributions to the company and your achievements
            during your tenure. We extend our best wishes for your future
            endeavors.
          </p>
        </div>
        <div className="pt-4">
          <p className="mb-5">Yours Sincerely,</p>
          <p className="mt-5">Authorized Signature,</p>
          <h5>{companyData.companyName}</h5>
          <p>{companyData.companyAddress}</p>
          <p>{companyData.cityStatePin}</p>
        </div>
      </div>
    </div>
  );
};

export default RelievingTemplate3;
