import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import { companyViewByIdApi } from '../../../Utils/Axios';

const InternshipTemplate1 = ({
  companyLogo,
  companyName,
  companyAddress,
  contactNumber,
  mailId,
  employeeName,
  designation,
  department,
  startDate,
  endDate,
}) => {
  const { user, logoFileName } = useAuth();
  const [error, setError] = useState(null);
  const [value, setValue] = useState("");
  const [companyDetails, setCompanyDetails] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
        if (!user.companyId) return;

        try {
            const response = await companyViewByIdApi(user.companyId);
            const data = response.data;
            setCompanyDetails(data);
            Object.keys(data).forEach(key => setValue(key, data[key]));
        } catch (err) {
            setError(err);
        }
    };

    fetchCompanyData();
}, [user.companyId, setValue, setError]);

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
      {/* Position the logo absolutely to the right */}
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
      <h4 className="text-center p-3">INTERNSHIP CERTIFICATION</h4>

      <div className="row d-flex justify-content-between p-1">
        <div className="col-6">
          <p className="mb-0 text-end">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content div */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "20px",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(2px)",
        }}
      >

        <p>This is to certify that {employeeName} has successfully completed an internship program with <strong>{companyName}</strong> as a <strong>{designation}</strong> in the <strong>{department}</strong> department from <strong>{startDate}</strong> to <strong>{endDate}</strong>.</p>

        <p>Throughout the internship, {employeeName} demonstrated professionalism and dedication. We believe that {employeeName} has gained valuable experience that will aid in future professional endeavors.</p>

        <p>We wish {employeeName} the best of luck in all future endeavors and are confident that {employeeName} will continue to excel in their career path.</p>
        <div className="mt-5 pt-3">
          <p className="mb-5">With Best Wishes,</p>
          <div className="mt-5 pt-5">
            <p>Authorized Signature</p>
            <h4>{companyDetails?.companyName},</h4>
            <p style={{marginBottom:"8px"}}>{companyDetails?.companyAddress}.</p>
            <p>PH: {companyDetails?.mobileNo}, Email: {companyDetails?.emailId}</p>
          </div>
        </div>
      </div>
    </div>

  );
}

export default InternshipTemplate1;
