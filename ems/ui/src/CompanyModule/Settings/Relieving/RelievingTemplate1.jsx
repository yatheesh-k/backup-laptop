import React from "react";

const RelievingTemplate1 = ({
  companyLogo,
  companyData,
  employeeName,
  employeeId,
  designation,
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
      className="watermarked"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Company Logo */}
      <div className="d-flex justify-content-start p-1">
        <img
          src={companyLogo}
          alt="Company Logo"
          style={{ height: "100px", width: "160px" }}
        />
      </div>

      {/* Title */}
      <h4 className="text-center">RELIEVING LETTER</h4>

      <h4 className="text-center p-2">TO WHOMSOEVER IT MAY CONCERN</h4>
      {/* Background Image (Watermark) */}
      <div
        style={{
          position: "absolute",
          top: "40%",
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
      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2, // Bring the content in front
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: semi-transparent background for contrast
        }}
      >
        <div className="row d-flex align-items-center p-1">
          <div className="col-6">
            <p className="mb-2">{date}</p>
            <p className="mb-0">
              {" "}
              Dear,<h5>{employeeName},</h5>{" "}
            </p>
            <h6>{employeeId}.</h6>
          </div>
        </div>
        <p>
          This is in reference to your resignation dated{" "}
          <strong>{resignationDate}</strong>, where you requested to be relieved
          from your services as an <strong>{designation}</strong>. We wish to
          inform you that your resignation has been accepted, and you shall be
          relieved from your duties on <strong>{lastWorkingDate}</strong>, post
          serving notice period, will effect from{" "}
          <strong>{resignationDate}</strong>.
        </p>
        <p>
          We kindly request you to return your company ID and any other
          company-owned items that you have been using during your tenure with
          our firm.
        </p>

        <div className="mt-3">
          <p>Sincerely,</p>
          <h4>{companyData.companyName}</h4>
          <p>Authorized Signature</p>
          <p>{companyData.companyAddress}</p>
          <p>{companyData.cityStatePin}</p>
        </div>
      </div>
    </div>
  );
};

export default RelievingTemplate1;
