import React from "react";
import { Navigate } from "react-router-dom";
import ForbiddenPage from "./ForbiddenPage";
import { useAuth } from "../Context/AuthContext";

const ProtectedRoute = ({ element, allowedRoles = [], allowedResourceTypes = [] }) => {
  const { authUser, hasAnyRole, isResourceType, isInitialized } = useAuth();

  if (!isInitialized) return null; // Optional loading indicator

  const isAuthenticated = !!authUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRoleAccess = allowedRoles.includes("all") || hasAnyRole(allowedRoles);
  const hasResourceTypeAccess = allowedResourceTypes.includes("all") || allowedResourceTypes.includes(authUser.resourceType);

  // Access logic
  if (authUser.isEmsAdmin) {
    return hasRoleAccess ? element : <ForbiddenPage replace />;
  }

  if (authUser.isCompanyAdmin) {
    return hasRoleAccess && hasResourceTypeAccess ? element : <ForbiddenPage replace />;
  }

  if (hasResourceTypeAccess) {
    return element;
  }

  return <ForbiddenPage replace />;
};

export default ProtectedRoute;
