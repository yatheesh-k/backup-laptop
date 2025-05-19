import React from "react";
import { useAuth } from "../../../Context/AuthContext";

const ExperienceTemplate1 = ({
  companyLogo,
  companyData,
  date,
  employeeName,
  employeeId,
  designation,
  joiningDate,
  department,
  experienceDate,
}) => {
  const { logoFileName } = useAuth();

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
      <h4 className="text-center">EXPERIENCE CERTIFICATE</h4>

      <div className="row d-flex align-items-center p-1">
        <div className="col-6 d-flex align-items-center">
          <p className="mb-0">{date}</p>
        </div>
        <div className="col-6 d-flex justify-content-end">
          <img
            src={companyLogo}
            alt="Logo"
            style={{ height: "100px", width: "160px" }}
          />
        </div>
      </div>

      <h4 className="text-center p-2">TO WHOMSOVER IT MAY CONCERN</h4>
      {/* Background image div */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "20%",
          right: "30%",
          width: "50%",
          height: "50%",
          backgroundImage: `url(${logoFileName})`, // Use the logo or another image
          transform: "rotate(340deg)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          //  filter: 'blur(2px)', // Optional: adjust blur as needed
          zIndex: 1, // Ensure it's behind the content
        }}
      />
      {/* Content div */}
      <div
        style={{
          position: "relative",
          zIndex: 2, // Bring the content in front
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Optional: semi-transparent background for contrast
          backdropFilter: "blur(2px)", // Optional: backdrop blur
        }}
      >
        <p>
          This is to certify that <strong>{employeeName}</strong> with an ID{" "}
          <strong>{employeeId}</strong> was employed with our Company{" "}
          <strong>{companyData.companyName}</strong> from{" "}
          <strong>{joiningDate}</strong> to <strong>{experienceDate}</strong> as
          a <strong>{designation}</strong>.
        </p>
        <p>
          We found <strong>{employeeName}</strong> to be very dedicated to the
          work assigned. He/She were results-oriented, professional, and
          sincere. He/She possess excellent interpersonal skills and knowledge,
          which helped in completing many valuable business assignments. He/She
          are a true team player and a fun-loving individual who mixes well with
          both seniors and juniors.
        </p>
        <p>
          We are sure that their passion and dedication will help them excel in
          whatever they choose to do next in their life. He/She have shown a
          high level of commitment throughout their time with our company.
        </p>
        <p>
          We wish them all the best for future ventures. Please feel free to
          contact us for any further information required.
        </p>
        <div className="mt-5 pt-3">
          <p className="mb-5">Sincerely,</p>
          <div className="mt-5 pt-5">
            <h4>{companyData.companyName},</h4>
            <p>
              {companyData.mobileNo},{companyData.emailId}
            </p>
            <p>{companyData.companyAddress}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceTemplate1;
