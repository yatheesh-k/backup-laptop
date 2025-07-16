import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { EmployeeGetApiById, getUserById, companyViewByIdApi, CandidateGetByIdApi } from "../Utils/Axios";

// Create the context
const AuthContext = createContext();

// Create the Provider component
export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);      // Stores decoded user info (e.g., userId, companyId)
  const [employee, setEmployee] = useState(null);       // Stores employee/user details
  const [company, setCompany] = useState(null);         // Stores company details
  const [isInitialized, setIsInitialized] = useState(false); // Tells us when auth is ready (app booted or login done)

  // Runs once on app start or refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsInitialized(true);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      // Optionally validate expiration
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setIsInitialized(true);
        return;
      }

      // Save essential info to state
      setAuthUser({
        userId: decoded.sub,
        roles: decoded.roles || [],
        companyId: decoded.companyId,
        employeeId: decoded.employee,
        company: decoded.company,
        resourceType: decoded.resourceType // Add resourceType if available
      });
    } catch (err) {
      console.error("Invalid token", err);
      localStorage.removeItem("token");
      setIsInitialized(true);
    }
  }, []);

  // Fetch employee/user + company when authUser changes (login or after app initializes)
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
      console.error("Failed to fetch candidate details", err);
      return null;
    }
  };

  const fetchDetails = async () => {
    try {
      const empData = await fetchEmployeeOrUserOrCandidate(authUser.userId);
      setEmployee(empData);

      const companyId = empData?.companyId || authUser?.companyId;

      if (companyId) {
        try {
          const compRes = await companyViewByIdApi(companyId);
          setCompany(compRes?.data?.data);
        } catch (err) {
          console.error("Failed to fetch company details", err);
        }
      }
         // ✅ Log both employee and company data
    console.log("Fetched employee/user/candidate:", empData);

    } catch (error) {
      console.error("Unexpected error fetching employee or company", error);
    } finally {
      setIsInitialized(true);
    }
  };
    console.log("Fetched company:", company);
  fetchDetails();
}, [authUser]);

  // Function to handle login and token storage
  const login = (token) => {
    try {
      localStorage.setItem("token", token);
      const decoded = jwtDecode(token);

      const userId = decoded.sub;
      const roles = decoded.roles || [];
      const companyId = decoded.companyId;
      const company = decoded.company;
      const employeeId = decoded.employee;
      const resourceType = decoded.resourceType; // Add resourceType if available
      console.log("roles", roles);

      // Set authUser object (triggers fetch effect above)
      setAuthUser({
        userId,
        roles,
        companyId,
        company,
        employeeId,
        resourceType // Add resourceType to authUser
      });

      setIsInitialized(false); // Reset while loading fresh data
    } catch (err) {
      console.error("Login failed - invalid token", err);
    }
  };

  // Function to logout user and clear all state
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
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
