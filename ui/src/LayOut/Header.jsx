// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Button,
//   Modal,
//   ModalBody,
//   ModalHeader,
//   ModalTitle,
// } from "react-bootstrap";
// import Reset from "./Reset";
// import { useAuth } from "../Context/AuthContext";
// import { jwtDecode } from "jwt-decode";
// import { toast } from "react-toastify";

// const Header = ({ toggleSidebar }) => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
//   const [showErrorModal, setShowErrorModal] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const profileDropdownRef = useRef(null);
//   const navigate = useNavigate();

//   const { authUser, company, employee, logout } = useAuth();
//   const token = localStorage.getItem("token");
//   const roles = authUser?.roles || [];
//   const resourceType = authUser?.resourceType || "";
//   const companyShortName = localStorage.getItem("companyName")
//   useEffect(() => {
//     if (token) {
//       const decoded = jwtDecode(token);
//       const currentTime = Date.now() / 1000;
//       const remainingTime = decoded.exp - currentTime;

//       if (remainingTime > 0) {
//         const timeoutId = setTimeout(() => {
//           handleLogout();
//         }, remainingTime * 1000);
//         return () => clearTimeout(timeoutId);
//       } else {
//         handleLogout();
//       }
//     }
//   }, [token]);

//   const toggleProfile = (e) => {
//     e.preventDefault();
//     e.stopPropagation(); // prevent bubbling
//     setIsProfileOpen((prev) => !prev);
//   };

//   const handleClickOutside = (event) => {
//     if (
//       profileDropdownRef.current &&
//       !profileDropdownRef.current.contains(event.target)
//     ) {
//       setIsProfileOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleLogout = () => {
//     logout(); // clear auth context
//     setShowModal(false);
//     // Decide redirect path
//     if (roles.includes("ems_admin")) {
//       navigate("/login");
//     } else if (roles.includes("candidate")) {
//       navigate(`/${companyShortName}/candidateLogin`);
//     } else if (
//       ["company_admin", "Accountant", "HR", "Admin", "employee"].includes(
//         resourceType
//       )
//     ) {
//       navigate(`/${companyShortName}/login`);
//     } else {
//       navigate("/login"); // fallback
//     }
//   };

//   const handleResetPasswordClick = () => {
//     setShowResetPasswordModal(true);
//   };

//   const closeModal = () => {
//     setShowErrorModal(false);
//     navigate("/");
//   };

// const renderProfileSection = () => {
//   const isEmsAdmin =
//     roles.includes("ems_admin") || resourceType === "ems_admin";

//   return (
//     <li className="nav-item dropdown position-relative">
//       <button
//         type="button"
        // className={`nav-link dropdown-toggle d-none d-sm-inline-block text-center ${
        //   isProfileOpen ? "rotate-arrow" : ""
        // }`}
//         onMouseDown={toggleProfile}
//       >
//         <span className="text-dark p-2">
//           {employee?.firstName} {employee?.lastName}
//         </span>
//         <i className="bi bi-person-circle" style={{ fontSize: "22px" }}></i>
//       </button>

//       {isProfileOpen && (
//         <div
//           className="dropdown-menu dropdown-menu-end py-0 show"
//           style={{ left: "auto", right: "3%" }}
//           ref={profileDropdownRef}
//         >
//           {!isEmsAdmin && (
//             <>
//               <a className="dropdown-item" href="/profile">
//                 <i className="bi bi-person me-1"></i> Profile
//               </a>
//               <a
//                 className="dropdown-item"
//                 href=" "
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleResetPasswordClick();
//                 }}
//               >
//                 <i className="bi bi-key me-1"></i> Reset Password
//               </a>
//               <div className="dropdown-divider"></div>
//             </>
//           )}
//           <a
//             className="dropdown-item"
//             href=" "
//             onClick={(e) => {
//               e.preventDefault();
//               setShowModal(true);
//             }}
//           >
//             <i className="bi bi-arrow-left-circle me-1"></i> Logout
//           </a>
//         </div>
//       )}
//     </li>
//   );
// };

//   return (
//     <nav className="navbar navbar-expand navbar-light navbar-bg">
//       <a
//         href=" "
//         className="sidebar-toggle js-sidebar-toggle"
//         onClick={(e) => {
//           e.preventDefault();
//           toggleSidebar();
//         }}
//       >
//         <i className="hamburger align-self-center"></i>
//       </a>
//       {/* <div className="navbar-brand d-flex align-items-center gap-2 ms-3">
//         <span className="fw-bold fs-6 text-dark">{getPortalLabel()}</span>
//       </div> */}
//       <div className="navbar-collapse collapse">
//         <ul className="navbar-nav ms-auto">{renderProfileSection()}</ul>
//       </div>

//       <Reset
//         show={showResetPasswordModal}
//         onClose={() => setShowResetPasswordModal(false)}
//         companyName={company?.companyName}
//       />
//       <Modal show={showErrorModal} onHide={closeModal} centered>
//         <ModalHeader closeButton>
//           <ModalTitle>Error</ModalTitle>
//         </ModalHeader>
//         <ModalBody>Session Timeout! Please log in again.</ModalBody>
//       </Modal>
//       {/* Logout Confirmation Modal */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered style={{zIndex:"9999"}}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Logout</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to logout?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleLogout}>
//             Logout
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </nav>
//   );
// };

// export default Header;
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import Reset from "./Reset";
import { useAuth } from "../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const Header = ({ toggleSidebar }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const profileDropdownRef = useRef(null);
  const toggleButtonRef = useRef(null); // New ref added

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const companyName = localStorage.getItem("companyName");

  const { imageUrl } = useSelector((state) => state.profile);

  const { authUser, employee, company, logout } = useAuth();
  const { userId, resourceType, roles = [] } = authUser || {};

  useEffect(() => {
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const remainingTime = decodedToken.exp - currentTime;

      if (remainingTime > 0) {
        const timeoutId = setTimeout(() => handleLogOut(), remainingTime * 1000);
        return () => clearTimeout(timeoutId);
      } else {
        handleLogOut();
      }
    }
  }, [token]);

const toggleProfile = () => {
  setIsProfileOpen((prev) => !prev);
  setIsNotificationOpen(false);
};

const handleClickOutside = (event) => {
  if (
    profileDropdownRef.current &&
    !profileDropdownRef.current.contains(event.target) &&
    toggleButtonRef.current &&
    !toggleButtonRef.current.contains(event.target)
  ) {
    setIsProfileOpen(false);
  }
};


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogOut = () => {
    logout();
    if (roles.includes("ems_admin")) {
      navigate("/login", { replace: true });
    } else if (
      ["company_admin", "Accountant", "HR", "Admin"].includes(resourceType) ||
      companyName
    ) {
      navigate(`/${companyName}/login`, { replace: true });
    } else if (resourceType === "candidate") {
      navigate(`/${companyName}/candidateLogin`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  const closeModal = () => {
    setShowErrorModal(false);
    navigate("/");
  };

  const handleResetPasswordClick = () => {
    setShowResetPasswordModal(true);
  };

  const renderProfileImage = () => {
    if (imageUrl) {
      return (
        <img
          src={`${imageUrl.split("?")[0]}?t=${Date.now()}`}
          alt="Profile"
          className="rounded-circle"
          style={{
            width: "30px",
            height: "30px",
            objectFit: "cover",
            border: "1px solid #dee2e6"
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "";
          }}
        />
      );
    }
    return(
          <i className="bi bi-person-fill"></i>
    )
  };

  return (
    <nav className="navbar navbar-expand navbar-light navbar-bg">
      <a className="sidebar-toggle js-sidebar-toggle" onClick={toggleSidebar} href>
        <i className="hamburger align-self-center"></i>
      </a>
      <div className="navbar-collapse collapse">
        <ul className="navbar-nav navbar-align">

          {roles.includes("ems_admin") && (
            <>
              <span className="mt-3">EMS-Admin</span>
              <li className="nav-item">
                <button
            type="button"
        className={`nav-link dropdown-toggle d-none d-sm-inline-block text-center ${
          isProfileOpen ? "rotate-arrow" : ""
        }`}
            onClick={toggleProfile}
          >
            <span className="text-dark p-2">EMS Admin</span>
            {renderProfileImage()}
          </button>
                {isProfileOpen && (
                  <div className="dropdown-menu dropdown-menu-end py-0 show" style={{ left: "auto", right: "3%" }} ref={profileDropdownRef}>
                    <a className="dropdown-item" href onClick={handleLogOut}>
                      <i className="align-middle bi bi-arrow-left-circle me-2"></i> Logout
                    </a>
                  </div>
                )}
              </li>
            </>
          )}

          {resourceType === "company_admin" && (
            <li className="nav-item dropdown position-relative">
              <button
            type="button"
        className={`nav-link dropdown-toggle d-none d-sm-inline-block text-center ${
          isProfileOpen ? "rotate-arrow" : ""
        }`}
                    onClick={toggleProfile}
          >
            <span className="text-dark p-2 mb-3">{company?.companyName}</span>
            {renderProfileImage()}
          </button>
              {isProfileOpen && (
                <div className="dropdown-menu dropdown-menu-end py-0 show" style={{ right: "10%" }} ref={profileDropdownRef}>
                  <a className="dropdown-item" href="/profile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle me-2"></i> Logout
                  </a>
                </div>
              )}
            </li>
          )}

          {resourceType === "employee" && (
            <li className="nav-item dropdown position-relative">
            <button
            type="button"
                   className={`nav-link dropdown-toggle d-none d-sm-inline-block text-center ${
          isProfileOpen ? "rotate-arrow" : ""
        }`}
            onClick={toggleProfile}
          >
            <span className="text-dark p-2 mb-3">
              {employee?.firstName} {employee?.lastName}
            </span>
            {renderProfileImage()}
          </button>
              {isProfileOpen && (
                <div className="dropdown-menu dropdown-menu-end py-0 show" style={{ right: 0 }} ref={profileDropdownRef}>
                  <a className="dropdown-item" href="/employeeProfile">
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle me-2"></i> Logout
                  </a>
                </div>
              )}
            </li>
          )}

          {["Accountant", "HR", "Admin"].includes(resourceType) && (
            <li className="nav-item dropdown position-relative">
             <button
            type="button"
                  className={`nav-link dropdown-toggle d-none d-sm-inline-block text-center ${
          isProfileOpen ? "rotate-arrow" : ""
        }`}
            onClick={toggleProfile}
          >
            <span className="text-dark p-2 mb-3">
              {employee?.firstName} {employee?.lastName}
            </span>
            {renderProfileImage()}
          </button>
              {isProfileOpen && (
                <div className="dropdown-menu dropdown-menu-end py-0 show" style={{ right: "20%" }} ref={profileDropdownRef}>
                  <a className="dropdown-item" href={`editUser/${userId}`}>
                    <i className="align-middle me-1 bi bi-person"></i> Profile
                  </a>
                  <a className="dropdown-item" href onClick={handleResetPasswordClick}>
                    <i className="align-middle me-1 bi bi-key"></i> Reset Password
                  </a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href onClick={handleLogOut}>
                    <i className="align-middle bi bi-arrow-left-circle me-2"></i> Logout
                  </a>
                </div>
              )}
            </li>
          )}

          {resourceType === "candidate" && (
            <>
              <span className="mt-3">{employee?.firstName} {employee?.lastName}</span>
              <li className="nav-item">
                <a className="nav-link d-none d-sm-inline-block text-center" href onClick={handleLogOut}>
                  <i className="align-middle bi bi-arrow-left-circle me-2"></i> Logout
                </a>
              </li>
            </>
          )}
        </ul>
      </div>

      <Reset
        companyName={companyName}
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
