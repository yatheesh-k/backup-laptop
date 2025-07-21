import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import {
  EmployeeGetApiById,
  getUserById,
  companyViewByIdApi,
  CandidateGetByIdApi,
} from "../Utils/Axios";

// Create the context
const AuthContext = createContext();

// Create the Provider component
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);        // Decoded token info
  const [employee, setEmployee] = useState(null);        // Fetched user details
  const [company, setCompany] = useState(null);          // Fetched company details
  const [isInitialized, setIsInitialized] = useState(false); // Ready flag

  // Normalize roles (ensure always array)
  const normalizeRoles = (roles) => {
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  };

  // On app load
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

      setAuthUser({
        userId: decoded.sub,
        roles: normalizeRoles(decoded.roles),
        company: decoded.company || null,
        employeeId: decoded.employee || null,
        resourceType: decoded.resourceType || null,
      });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setIsInitialized(true);
    }
  }, []);

  // Fetch details based on user type
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
        const userId = authUser.userId;
        const empData = await fetchEmployeeOrUserOrCandidate(userId);
        setEmployee(empData);

        // Try to get company ID from data or authUser
        const companyId = empData?.companyId || authUser.company;

        if (companyId) {
          try {
            const compRes = await companyViewByIdApi(companyId);
            setCompany(compRes?.data?.data);
          } catch (err) {
            console.error("Company fetch failed:", err);
          }
        }

        console.log("✅ User/candidate/employee fetched:", empData);
      } catch (err) {
        console.error("Unexpected error fetching user details:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchDetails();
  }, [authUser]);

  // Login handler
  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);

      const userId = decoded.sub;
      const roles = normalizeRoles(decoded.roles);
      const company = decoded.company || null;
      const employeeId = decoded.employee || null;
      const resourceType = decoded.resourceType || null;

      setAuthUser({
        userId,
        roles,
        company,
        employeeId,
        resourceType,
      });

      setIsInitialized(false); // Trigger re-fetch
    } catch (err) {
      console.error("Login failed: invalid token", err);
    }
  };
  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setEmployee(null);
    setCompany(null);
    setIsInitialized(true);
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => useContext(AuthContext);
