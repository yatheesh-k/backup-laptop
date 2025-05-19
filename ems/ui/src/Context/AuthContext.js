import React, { createContext, useContext, useEffect, useState } from 'react';
import { EmployeeGetApiById,companyViewByIdApi } from '../Utils/Axios'; // Import your API functions
import { jwtDecode } from "jwt-decode";

// Create a context for authentication
const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    userRole: null,
    companyName: null,
    employeeId: null,
  });
  const [companyData,setCompanyData]=useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [stamp,setStamp]=useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({
          userId: decodedToken.sub,
          userRole: decodedToken.roles,
          company: decodedToken.company,
          employeeId: decodedToken.employeeId,
          companyId:decodedToken.companyId

        });

      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  const setAuthUser = (userData) => {
    setUser(userData);
  };
  
  useEffect(() => {
    if (!user.userId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Fetching employee data for userId:", user.userId);
        const response = await EmployeeGetApiById(user.userId);
        const companyId = response.data.companyId;
        setUser(prevUser => ({ ...prevUser, companyId }));
        await fetchCompanyLogo(companyId);
      } catch (error) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyLogo = async (companyId) => {
      try {
        const logoResponse = await companyViewByIdApi(companyId);
        const companyData = logoResponse?.data;

        if (companyData) {
          setCompanyData(companyData); // Set company data to state
          const logoPath = companyData?.imageFile;
          const stampImage=companyData?.stampImage;
          if (logoPath && stampImage) {
            setLogoFileName(logoPath);
            setStamp(stampImage);
          } else {
            setError("Logo not found in company data");
          }
        } else {
          setError("Company data not found");
        }
      } catch (err) {
        setError("Error fetching logo");
      }
    };

    fetchData();
  }, [user.userId]); // Re-run when user.userId changes
  console.log("companyData",companyData)

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]); 

  return (
    <AuthContext.Provider value={{ user, setUser, logoFileName,stamp,setLogoFileName,companyData, loading, error,setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const  useAuth = () => useContext(AuthContext);