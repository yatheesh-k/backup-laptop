import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import routeConfig from "../Utils/RouteConfig";
import SideNavLogo from "./SideNavLogo";

const SideNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userRole = [], resourceType = "",company } = useSelector((state) => state.auth);
  const [expandedItems, setExpandedItems] = useState({});

  const isRouteAllowed = (route) => {
    const roles = route.allowedRoles || [];
    const types = route.allowedResourceTypes || [];
    const hasRole = roles.includes("all") || userRole.some((r) => roles.includes(r));
    const hasResource = types.includes("all") || types.includes(resourceType);
    return hasRole && hasResource;
  };

  useEffect(() => {
    const expandParents = (routes, parentKey = "") => {
      const result = {};
      routes.forEach((route, index) => {
        const key = route.path || route.label || `${parentKey}-${index}`;
        const children = route.children || [];
        const match = children.some((child) => pathname.startsWith(child.path));
        if (match) result[key] = true;
        Object.assign(result, expandParents(children, key));
      });
      return result;
    };
    const autoExpand = expandParents(routeConfig);
    setExpandedItems(autoExpand);
  }, [pathname]);

  const toggleExpand = (key) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getPortalName = () => {
    if (userRole.includes("ems_admin")) return "EMS Admin";
    if (userRole.includes("HRM") && resourceType === "company_admin")
      return `HRM Portal`;
    if (userRole.includes("tax_consultant"))
      return `Tax Portal`;
    if (resourceType === "Accountant")
      return `Accountant Portal`;
    if (resourceType === "HR")
      return `HR Portal`;
    if (resourceType === "Admin")
      return `Admin Portal`;
    if (userRole.includes("employee"))
      return `Employee Portal`;
    if (userRole.includes("candidate"))
      return `Candidate Portal`;
    return "Portal";
  };

  const portalName = getPortalName();

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const renderNavItems = (items, parentKey = "") => {
    return items
      .filter((item) => {
        if (item.children) return item.children.some(isRouteAllowed);
        return isRouteAllowed(item) && item.label;
      })
      .map((item, index) => {
        const key = item.path || item.label || `${parentKey}-${index}`;
        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
        const expanded = expandedItems[key];

        return (
          <li key={key} className="nav-item">
            <div
              className={`nav-link d-flex justify-content-between align-items-center ${isActive(item.path) ? "active fw-bold" : ""}`}
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(key);
                } else if (item.path) {
                  navigate(item.path);
                }
              }}
              style={{ cursor: hasChildren || item.path ? "pointer" : "default", padding: "10px 16px" }}
            >
              <div>
                {item.icon && <i className={`bi bi-${item.icon} me-2`} />}
                {item.label}
              </div>
              {hasChildren && (
                <i className={`bi ${expanded ? "bi-chevron-up" : "bi-chevron-down"}`} />
              )}
            </div>

            {hasChildren && expanded && (
              <ul className="submenu" style={{ listStyle: "none", paddingLeft: "20px" }}>
                {renderNavItems(item.children, key)}
              </ul>
            )}
          </li>
        );
      });
  };

  return (
    <aside className="sidenav bg-light" style={{ width: "260px", height: "100vh", overflowY: "auto", borderRight: "1px solid #ddd" }}>
       <SideNavLogo/>
<div className="sidenav-header p-1 fw-bold text-primary text-center border-bottom">
  {portalName}
</div>
      <ul className="nav flex-column p-2" style={{ listStyle: "none" }}>
        {renderNavItems(routeConfig)}
      </ul>
    </aside>
  );
};

export default SideNav;