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


// import React, { useState, useMemo, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { NAV_CONFIG } from './navConfig';
// import { useAuth } from '../Context/AuthContext';
// import { allAvailableRoutes } from '../Utils/Rout';
// import { RESOURCE_ROLE_MAP } from '../Utils/ProtectedRoute';

// const SideNav = () => {
//   const { userRole } = useSelector((state) => state.auth);
//   const resourceType = useSelector((state) => state.auth.resourceType);
//   const { pathname } = useLocation();
//   const [expandedItems, setExpandedItems] = useState({});
//   const { company = {} } = useAuth();
//   const navigate = useNavigate();
//   // Auto-expand parent when child is active
//   useEffect(() => {
//     const parentPaths = Object.keys(NAV_CONFIG).flatMap(role =>
//       NAV_CONFIG[role].flatMap(item =>
//         item.items ? item.items.map(child => ({ parent: item.path || item.title, child: child.path })) : []
//       )
//     );
//     const parentToExpand = parentPaths.find(({ child }) => pathname.startsWith(child))?.parent;
//     if (parentToExpand) {
//       setExpandedItems(prev => ({ ...prev, [parentToExpand]: true }));
//     }
//   }, [pathname]);

//   const handleToggleExpand = (path) => {
//     setExpandedItems(prev => ({
//       ...prev,
//       [path]: !prev[path]
//     }));
//   };
  
//   const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);
//   // Only allow roles based on subscription (resourceType)
//   const allowedRoles = useMemo(() => {
//     if (!resourceType) return [];
//     return RESOURCE_ROLE_MAP[resourceType] || [];
//   }, [resourceType]);
//   // Filter nav items based on allowed roles and allowed routes
//   const getRoleNavItems = useMemo(() => {
//     const roleItems = [];
//     const allowedPaths = allAvailableRoutes
//       .filter(route => route.allowedTypes?.some(type => userRole?.includes(type) && allowedRoles.includes(type)))
//       .map(route => route.path);
//     if (!userRole) return roleItems;
//     userRole.forEach(role => {
//       if (allowedRoles.includes(role) && NAV_CONFIG[role]) {
//         NAV_CONFIG[role].forEach(item => {
//           if (item.items) {
//             const allowedChildren = item.items.filter(child =>
//               allowedPaths.includes(child.path)
//             );
//             if (allowedChildren.length > 0) {
//               roleItems.push({
//                 ...item,
//                 items: allowedChildren
//               });
//             }
//           } else if (allowedPaths.includes(item.path)) {
//             roleItems.push(item);
//           }
//         });
//       }
//     });
//     // Remove duplicates by path/title
//     const seen = new Set();
//     return roleItems.filter(item => {
//       const key = item.path || item.title;
//       if (seen.has(key)) return false;
//       seen.add(key);
//       return true;
//     });
//   }, [userRole, allowedRoles, allAvailableRoutes,resourceType]);

//   console.log("resourceType:", resourceType);
// console.log("userRole:", userRole);
// console.log("allowedRoles (by resourceType):", allowedRoles);
// console.log("getRoleNavItems:", getRoleNavItems);

//   const renderNavItem = (item) => {
//     const hasChildren = item.items && item.items.length > 0;
//     const isExpanded = expandedItems[item.path || item.title];
//     const active = isActive(item.path);
//     return (
//       <React.Fragment key={item.path || item.title}>
//         <li className={`nav-item ${hasChildren ? 'has-children' : ''}`}>
//           {hasChildren ? (
//             <button
//               className={`nav-link ${active ? 'active' : ''}`}
//               onClick={() => handleToggleExpand(item.path || item.title)}
//               aria-expanded={isExpanded}
//             >
//               <div className="nav-link-content">
//                 <i className={`bi bi-${item.icon || 'file'}`}></i>
//                 <span>{item.title}</span>
//               </div>
//               <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
//             </button>
//           ) : (
//             <Link
//               to={item.path}
//               className={`nav-link ${active ? 'active' : ''}`}
//             >
//               <div className="nav-link-content">
//                 <i className={`bi bi-${item.icon || 'file'}`}></i>
//                 <span>{item.title}</span>
//               </div>
//             </Link>
//           )}
//         </li>
//         {hasChildren && (
//           <div
//             className={`submenu-container ${isExpanded ? 'expanded' : ''}`}
//             style={{
//               maxHeight: isExpanded ? '250px' : '0',
//               overflowY: isExpanded ? 'auto' : 'hidden'
//             }}
//           >
//             <div className="submenu-inner">
//               {item.items.map((child) => (
//                 <Link
//                   key={child.path}
//                   to={child.path}
//                   className={`submenu-item ${isActive(child.path) ? 'active' : ''}`}
//                 >
//                   {child.title}
//                 </Link>
//               ))}
//             </div>
//           </div>
//         )}
//       </React.Fragment>
//     );
//   };
//   return (
//     <aside className="side-nav">
//       <div className="logo-container">
//         {userRole?.includes("candidate") ? (
//           <div className="candidate-welcome">
//             <span>Candidate Portal</span>
//           </div>
//         ) : company?.imageFile ? (
//           <img
//             src={company.imageFile}
//             alt="Company Logo"
//             className="company-logo"
//             onClick={() => navigate('')}
//             tabIndex="0"
//             role="button"
//           />
//         ) : userRole?.includes("company_admin") ? (
//           <Link to="/profile" className="add-logo-link">
//             <i className="bi bi-plus-circle me-2"></i>
//             Add Company Logo
//           </Link>
//         ) : userRole?.includes("ems_admin") ? (
//           <img
//             src="/assets/img/pathbreaker_logo.png"
//             alt="EMS Admin Logo"
//             className="company-logo"
//             onClick={() => navigate('')}
//             tabIndex="0"
//             role="button"
//           />
//         ) : (
//           <div className="default-logo" onClick={() => navigate('/main')} tabIndex="0" role="button">
//             <span>Logo</span>
//           </div>
//         )}
//       </div>
//       <nav className="nav-items-container">
//         <ul className="nav-items">
//           {getRoleNavItems.map((item) => renderNavItem(item))}
//         </ul>
//       </nav>
//     </aside>
//   );
// };
// export default SideNav;