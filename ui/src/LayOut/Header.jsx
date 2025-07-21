import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import Reset from "./Reset";
import { useAuth } from "../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const Header = ({ toggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  const { authUser, company, employee, logout } = useAuth();
  const token = localStorage.getItem("token");

  const roles = authUser?.roles || [];
  const resourceType = authUser?.resourceType;
  const userId = authUser?.userId;

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const remainingTime = decoded.exp - currentTime;

      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => {
          handleLogOut();
        }, remainingTime * 1000);
        return () => clearTimeout(timeoutId);
      } else {
        handleLogOut();
      }
    }
  }, [token]);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleClickOutside = (event) => {
    if (
      profileDropdownRef.current &&
      !profileDropdownRef.current.contains(event.target)
    ) {
      setIsProfileOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogOut = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordModal(true);
  };

  const closeModal = () => {
    setShowErrorModal(false);
    navigate("/");
  };

  const getPortalLabel = () => {
    if (roles.includes("ems_admin")) return "EMS Admin";
    if (roles.includes("HRM") && resourceType === "company_admin")
      return `${company?.companyName} HRM Portal`;
    if (roles.includes("tax_consultant")) return `${company?.companyName} Tax Portal`;
    if (resourceType === "Accountant") return `${company?.companyName} Accountant Portal`;
    if (resourceType === "HR") return `${company?.companyName} HR Portal`;
    if (resourceType === "Admin") return `${company?.companyName} Admin Portal`;
    if (roles.includes("employee")) return `${company?.companyName} Employee Portal`;
    if (roles.includes("candidate")) return `${company?.companyName} Candidate Portal`;
    return "Portal";
  };


  const renderProfileSection = () => (
    <li className="nav-item dropdown position-relative">
      <a
        className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
        href=" "
        onClick={toggleProfile}
      >
        <span className="text-dark p-2">{employee?.firstName} {employee?.lastName}</span>
        <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
      </a>
      {isProfileOpen && (
        <div
          className="dropdown-menu dropdown-menu-end py-0 show"
          style={{ left: "auto", right: "3%" }}
          ref={profileDropdownRef}
        >
          <a className="dropdown-item" href="/profile">
            <i className="bi bi-person me-1"></i> Profile
          </a>
          <a className="dropdown-item" href="#" onClick={handleResetPasswordClick}>
            <i className="bi bi-key me-1"></i> Reset Password
          </a>
          <div className="dropdown-divider"></div>
          <a className="dropdown-item" href="#" onClick={handleLogOut}>
            <i className="bi bi-arrow-left-circle me-1"></i> Logout
          </a>
        </div>
      )}
    </li>
  );

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <a className="sidebar-toggle js-sidebar-toggle" onClick={toggleSidebar} href="#">
        <i className="hamburger align-self-center"></i>
      </a>
      {/* <div className="navbar-brand d-flex align-items-center gap-2 ms-3">
        <span className="fw-bold fs-6 text-dark">{getPortalLabel()}</span>
      </div> */}
      <div className="navbar-collapse collapse">
        <ul className="navbar-nav ms-auto">{renderProfileSection()}</ul>
      </div>

      <Reset
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        companyName={company?.companyName}
      />
      <Modal show={showErrorModal} onHide={closeModal} centered>
        <ModalHeader closeButton>
          <ModalTitle>Error</ModalTitle>
        </ModalHeader>
        <ModalBody>Session Timeout! Please log in again.</ModalBody>
      </Modal>
    </nav>
  );
};

export default Header;
