import React, { useEffect, useState } from "react";
import SideNav from "./SideNav";
import Header from "./Header";
import { Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { CompanyImageGetApi, EmployeeGetApiById } from "../Utils/Axios";

const LayOut = ({ children }) => {
  const name = localStorage.getItem("name");
  const { authData, isInitialized } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logoFileName, setLogoFileName] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    if (!isInitialized) return; // Wait until initialization is complete
    if (!authData) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("userId:", authData.userId);
        const response = await EmployeeGetApiById(authData.userId);
        console.log("userId@:", authData.userId);
        const companyId = response.data.companyId;
        await fetchCompanyLogo(companyId);
      } catch (error) {
        console.log(error);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyLogo = async (companyId) => {
      try {
        const logoResponse = await CompanyImageGetApi(companyId);
        if (logoResponse && logoResponse.data && logoResponse.data.data) {
          const logoPath = logoResponse.data.data;
          const fileName = logoPath.split("\\").pop();
          setLogoFileName(fileName);
          console.log("fileName:", fileName);
        } else {
          console.error("Response or data is missing");
          setError("Logo not found");
        }
      } catch (err) {
        console.error("Error fetching company logo:", err);
        setError("Error fetching logo");
      }
    };

    fetchData();
  }, [authData, isInitialized]);

  return (
    <div className="wrapper">
      <div className={`fixed-sideNav ${isSidebarVisible ? "" : "hidden"}`}>
        <SideNav />
      </div>
      <div className={`main ${isSidebarVisible ? "" : "full-width"}`}>
        <Header toggleSidebar={toggleSidebar} />
        <main className="content">{children}</main>
        <footer className="footer">
          <div className="container-fluid">
            <div className="row text-muted">
              <div className="col-6 text-start">
                <p className="mb-0">
                  <Link className="text-muted" target="_blank">
                    <strong>{name} </strong>
                  </Link>
                </p>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <p>Copyright © 2024, All rights reserved.</p>
                <p>Powered by PathBreaker Technologies Pvt. Ltd.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LayOut;
