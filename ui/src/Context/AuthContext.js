import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import {
  EmployeeGetApiById,
  getUserById,
  companyViewByIdApi,
  CandidateGetByIdApi,
} from "../Utils/Axios";

// Create Context
const AuthContext = createContext();

// Provider
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [company, setCompany] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const normalizeRoles = (roles) => {
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsInitialized(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("Token expired");
        localStorage.removeItem("token");
        setIsInitialized(true);
        return;
      }

      const roles = normalizeRoles(decoded.roles);

      setAuthUser({
        userId: decoded.sub,
        roles,
        company: decoded.company || null,
        employeeId: decoded.employee || null,
        resourceType: decoded.resourceType || null,
        isEmsAdmin: roles.includes("ems_admin"),
        isCompanyAdmin: decoded.resourceType === "company_admin",
        isAccountant: decoded.resourceType === "Accountant",
        isHR: decoded.resourceType === "HR",
        isAdmin: decoded.resourceType === "Admin",
        isEmployee: decoded.resourceType === "employee",
        isCandidate: decoded.resourceType === "candidate",
      });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      setEmployee(null);
      setCompany(null);
      setIsInitialized(true);
      return;
    }

    const fetchEmployeeOrUserOrCandidate = async (userId) => {
      try {
        const empRes = await EmployeeGetApiById(userId);
        return empRes?.data?.data;
      } catch {}

      try {
        const userRes = await getUserById(userId);
        const userData = userRes?.data?.data;
        return Array.isArray(userData) && userData.length > 0 ? userData[0] : userData;
      } catch {}

      try {
        const candidateRes = await CandidateGetByIdApi(userId);
        return candidateRes?.data?.data;
      } catch (err) {
        console.error("Candidate fetch failed:", err);
        return null;
      }
    };

    const fetchDetails = async () => {
      try {
        const empData = await fetchEmployeeOrUserOrCandidate(authUser.userId);
        setEmployee(empData);

        const companyId = empData?.companyId || authUser.company;
        if (companyId) {
          try {
            const compRes = await companyViewByIdApi(companyId);
            setCompany(compRes?.data?.data);
          } catch (err) {
            console.error("Company fetch failed:", err);
          }
        }
      } catch (err) {
        console.error("Unexpected error fetching user details:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchDetails();
  }, [authUser]);

  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);
      const roles = normalizeRoles(decoded.roles);

      setAuthUser({
        userId: decoded.sub,
        roles,
        company: decoded.company || null,
        employeeId: decoded.employee || null,
        resourceType: decoded.resourceType || null,
        isEmsAdmin: roles.includes("ems_admin"),
        isCompanyAdmin: decoded.resourceType === "company_admin",
        isAccountant: decoded.resourceType === "Accountant",
        isHR: decoded.resourceType === "HR",
        isAdmin: decoded.resourceType === "Admin",
        isEmployee: decoded.resourceType === "employee",
        isCandidate: decoded.resourceType === "candidate",
      });

      setIsInitialized(false);
    } catch (err) {
      console.error("Login failed: invalid token", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setEmployee(null);
    setCompany(null);
    setIsInitialized(true);
  };

  const hasRole = (role) => authUser?.roles?.includes(role);
  const hasAnyRole = (roles) => roles.some((r) => hasRole(r));
  const isResourceType = (type) => authUser?.resourceType === type;

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        employee,
        company,
        isInitialized,
        login,
        logout,
        hasRole,
        hasAnyRole,
        isResourceType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
