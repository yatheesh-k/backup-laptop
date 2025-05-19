import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import Reset from "./Reset";
import { useAuth } from "../Context/AuthContext";
import { EmployeeGetApiById } from "../Utils/Axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const Header = ({ toggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roles, setRoles] = useState([]);
  const { user} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await EmployeeGetApiById(user.userId);
        const { firstName, lastName } = response.data;
        setFirstName(firstName);
        setLastName(lastName);
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const roles = decodedToken?.roles || [];
      setRoles(roles);

      const currentTime = Date.now() / 1000;
      const remainingTime = decodedToken.exp - currentTime;

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

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
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

  const handleLogOut = (roles) => {
    const companyName=localStorage.getItem("companyName");
    localStorage.removeItem("token"); // Clear only the token
    localStorage.removeItem("refreshToken");
    toast.success('Logout Successful');
    if (roles==="ems_admin") {
      navigate("/login");
    } else if (companyName) {
      navigate(`/${companyName}/login`);
    }else{
      navigate("/login");
    }
   };

  const closeModal = () => {
    setShowErrorModal(false);
    navigate("/");
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordModal(true);
  };

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <a className="sidebar-toggle js-sidebar-toggle" onClick={toggleSidebar}   href>
        <i className="hamburger align-self-center"></i>
      </a>
      <div className="navbar-collapse collapse">
        <ul className="navbar-nav navbar-align">
          {roles.includes("ems_admin") && (
            <>
             <span className="mt-3">EMS-Admin</span>
            <li className="nav-item">
              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                href
                onClick={toggleProfile}
              >
                <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
              </a>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: "3%" }}
                >
                  <a className="dropdown-item"   href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Logout
                  </a>
                </div>
              )}
            </li>
            </>
          )}
          {roles.includes("company_admin") && (
            <li className="nav-item dropdown position-relative">
              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                href
                onClick={toggleProfile}
              >
                <span className="text-dark p-2 mb-3">{user.company}</span>
                <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
              </a>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: "10%" }}
                >
                  <a className="dropdown-item" href="/profile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item"   href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item"   href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Logout
                  </a>
                </div>
              )}
            </li>
          )}
        {!roles.includes("ems_admin") && !roles.includes("company_admin") && (
            <li className="nav-item dropdown position-relative">
              <a
                className="nav-link dropdown-toggle d-none d-sm-inline-block text-center"
                href
                onClick={toggleProfile}
              >
                <span className="text-dark p-2 mb-3">{firstName} {lastName}</span> 
                <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
              </a>
              {isProfileOpen && (
                <div
                  className="dropdown-menu dropdown-menu-end py-0 show"
                  aria-labelledby="profileDropdown"
                  style={{ left: "auto", right: "20%" }}
                >
                  <a className="dropdown-item" href="/employeeProfile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item"   href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item"   href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle" style={{ paddingRight: "10px" }}></i>
                    Log out
                  </a>
                </div>
              )}
            </li>
        )}
        </ul>
      </div>
      <Reset
        companyName={user.company}
        show={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
      />
      <Modal show={showErrorModal} onHide={closeModal} centered style={{ zIndex: "1050" }}>
        <ModalHeader closeButton>
          <ModalTitle className="text-center">Error</ModalTitle>
        </ModalHeader>
        <ModalBody className="text-center fs-bold">
          Session Timeout! Please log in.
        </ModalBody>
      </Modal>
    </nav>
  );
};

export default Header;