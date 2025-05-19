import React from "react";

const InternShipTemplate2 = ({
  companyLogo,
  companyData,
  employeeName,
  designation,
  department,
  startDate,
  endDate,
}) => {
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
      <div className="d-flex justify-content-between align-items-center">
        {/* Left side: Company Information */}
        <div className="text-start">
          <div style={{ textAlign: "left" }}>
            <h4>{companyData.companyName}</h4>
            <p>{companyData.companyAddress}</p>
            <p>
              {" "}
              {companyData.mobileNo} | {companyData.emailId}
            </p>
          </div>
        </div>

        {/* Right side: Company Logo */}
        <div>
          <img
            src={companyLogo}
            alt={`${companyData.companyName} Logo`}
            style={{
              maxWidth: "160px",
              position: "absolute",
              top: "2px",
              right: "20px",
              height: "100px",
              width: "160px",
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          backgroundImage: `url(${companyLogo})`,
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />
      <h4 className="text-center p-3">INTERNSHIP CERTIFICATION</h4>
      <p className="text-start p-2">
        <strong>{new Date().toLocaleDateString()}</strong>
      </p>

      {/* Content div */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(2px)",
        }}
      >
        <h6 className="text-center">TO WHOMSOEVER IT MAY CONCERN</h6>

        <p>
          We are pleased to inform that <strong>{employeeName}</strong>&nbsp;
          has successfully completed an internship program with{" "}
          <strong>{companyData.companyName}</strong> as a{" "}
          <strong>{designation}</strong> in the <strong>{department}</strong>{" "}
          department from <strong>{startDate}</strong> to{" "}
          <strong>{endDate}</strong>.
        </p>

        <p>
          Throughout the internship, {employeeName} demonstrated professionalism
          and dedication. We believe that {employeeName} has gained valuable
          experience that will aid in future professional endeavors.
        </p>

        <p>
          We wish {employeeName} the best of luck in all future endeavors and
          are confident that {employeeName} will continue to excel in their
          career path.
        </p>
        <div className="mt-5 pt-3">
          <p className="mb-5">With Best Wishes,</p>
          <div className="mt-5 pt-5">
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternShipTemplate2;
