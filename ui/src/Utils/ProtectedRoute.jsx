// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ element, allowedRoles = [], allowedResourceTypes = [] }) => {
  const { userRole, resourceType } = useSelector((state) => state.auth);
  const isAuthenticated = !!userRole?.length || !!resourceType;

  // Debug logs
  console.log("🛡️ userRole:", userRole);
  console.log("🛡️ resourceType:", resourceType);
  console.log("🔐 allowedRoles:", allowedRoles);
  console.log("🔐 allowedResourceTypes:", allowedResourceTypes);
  console.log("✅ isAuthenticated:", isAuthenticated);

  if (!isAuthenticated) {
    console.warn("⛔ User not authenticated");
    return <Navigate to="/login" replace />;
  }

  const hasRoleAccess =
    allowedRoles.includes("all") || userRole?.some((role) => allowedRoles.includes(role));
  const hasResourceTypeAccess =
    allowedResourceTypes.includes("all") || allowedResourceTypes.includes(resourceType);

  console.log("✅ hasRoleAccess:", hasRoleAccess);
  console.log("✅ hasResourceTypeAccess:", hasResourceTypeAccess);

  if (resourceType === "ems_admin") {
    if (hasRoleAccess) {
      console.log("✅ Access granted: EMS Admin with valid role");
      return element;
    } else {
      console.warn("⛔ Access denied: EMS Admin with invalid role");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (resourceType === "company_admin") {
    if (hasRoleAccess && hasResourceTypeAccess) {
      console.log("✅ Access granted: Company Admin with valid role and resourceType");
      return element;
    } else {
      console.warn("⛔ Access denied: Company Admin with invalid role/resourceType");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (hasResourceTypeAccess) {
    console.log("✅ Access granted: Other resourceType with valid access");
    return element;
  } else {
    console.warn("⛔ Access denied: Other resourceType with no access");
    return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
