import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const SideNavLogo = () => {
  const navigate = useNavigate();
  const { authUser, company } = useAuth();

  const role = authUser?.roles?.[0] || "";
  const resourceType = authUser?.resourceType || "";

  const renderContent = () => {
    if (role === "candidate") {
      return <span className="fw-bold text-muted">Candidate Portal</span>;
    }

    if (role === "ems_admin") {
      return (
        <>
          <img
            src="/assets/img/pathbreaker_logo.png"
            alt="EMS Admin Logo"
            className="company-logo"
            onClick={() => navigate("/main")}
            role="button"
            style={{ cursor: "pointer", maxHeight: "50px" }}
          />
          <span className="ms-2 fw-semibold">EMS Admin Portal</span>
        </>
      );
    }

    if (["company_admin", "Admin", "HR", "Accountant", "tax_consultant"].includes(resourceType)) {
      return company?.imageFile ? (
        <>
          <img
            src={company.imageFile}
            alt="Company Logo"
            onClick={() => navigate("/main")}
            className="company-logo"
            role="button"
            style={{ cursor: "pointer", maxHeight: "50px" }}
          />
          <span className="ms-2 fw-semibold">
            {company?.companyShortName || "Company Portal"}
          </span>
        </>
      ) : (
        <Link to="/profile" className="text-decoration-none text-primary fw-semibold">
          <i className="bi bi-plus-circle me-2"></i>Add Company Logo
        </Link>
      );
    }

    if (resourceType === "employee") {
      return (
        <span className="fw-semibold text-muted">Employee Portal</span>
      );
    }

    return <span className="fw-semibold text-muted">EMS Portal</span>;
  };

  return (
    <div
      className="logo-container d-flex align-items-center p-3 border-bottom"
      style={{ height: "80px" }}
    >
      {renderContent()}
    </div>
  );
};

export default SideNavLogo;
