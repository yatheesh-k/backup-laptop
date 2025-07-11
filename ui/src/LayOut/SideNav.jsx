import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NAV_CONFIG } from './navConfig';
import { useAuth } from '../Context/AuthContext';
import { allAvailableRoutes } from '../Utils/Rout';

const SideNav = () => {
  const { userRole } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const { company = {} } = useAuth();
  const navigate = useNavigate();

  // Auto-expand parent when child is active
  useEffect(() => {
    const parentPaths = Object.keys(NAV_CONFIG).flatMap(role =>
      NAV_CONFIG[role].flatMap(item =>
        item.items ? item.items.map(child => ({ parent: item.path || item.title, child: child.path })) : []
      )
    );

    const parentToExpand = parentPaths.find(({ child }) => pathname.startsWith(child))?.parent;
    if (parentToExpand) {
      setExpandedItems(prev => ({ ...prev, [parentToExpand]: true }));
    }
  }, [pathname]);

  const handleToggleExpand = (path) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const renderNavItem = (item) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems[item.path || item.title];
    const active = isActive(item.path);

    return (
      <React.Fragment key={item.path || item.title}>
        <li className={`nav-item ${hasChildren ? 'has-children' : ''}`}>
          {hasChildren ? (
            <button
              className={`nav-link ${active ? 'active' : ''}`}
              onClick={() => handleToggleExpand(item.path || item.title)}
              aria-expanded={isExpanded}
            >
              <div className="nav-link-content">
                <i className={`bi bi-${item.icon || 'file'}`}></i>
                <span>{item.title}</span>
              </div>
              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </button>
          ) : (
            <Link
              to={item.path}
              className={`nav-link ${active ? 'active' : ''}`}
            >
              <div className="nav-link-content">
                <i className={`bi bi-${item.icon || 'file'}`}></i>
                <span>{item.title}</span>
              </div>
            </Link>
          )}
        </li>

        {hasChildren && (
          <div
            className={`submenu-container ${isExpanded ? 'expanded' : ''}`}
            style={{
              maxHeight: isExpanded ? '250px' : '0',
              overflowY: isExpanded ? 'auto' : 'hidden'
            }}
          >
            <div className="submenu-inner">
              {item.items.map((child) => (
                <Link
                  key={child.path}
                  to={child.path}
                  className={`submenu-item ${isActive(child.path) ? 'active' : ''}`}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  const getRoleNavItems = useMemo(() => {
    const roleItems = [];
    const allowedPaths = allAvailableRoutes
      .filter(route => route.allowedTypes?.some(type => userRole?.includes(type)))
      .map(route => route.path);

    if (!userRole) return roleItems;

    userRole.forEach(role => {
      if (NAV_CONFIG[role]) {
        NAV_CONFIG[role].forEach(item => {
          if (item.items) {
            const allowedChildren = item.items.filter(child =>
              allowedPaths.includes(child.path)
            );
            if (allowedChildren.length > 0) {
              roleItems.push({
                ...item,
                items: allowedChildren
              });
            }
          } else if (allowedPaths.includes(item.path)) {
            roleItems.push(item);
          }
        });
      }
    });

    return roleItems.sort((a, b) => (a.items ? 1 : -1) - (b.items ? 1 : -1));
  }, [userRole]);

  return (
    <aside className="side-nav">
      <div className="logo-container">
        {userRole?.includes("candidate") ? (
          <div className="candidate-welcome">
            <span>Candidate Portal</span>
          </div>
        ) : company?.imageFile ? (
          <img
            src={company.imageFile}
            alt="Company Logo"
            className="company-logo"
            onClick={() => navigate('')}
            tabIndex="0"
            role="button"
          />
        ) : userRole?.includes("company_admin") ? (
          <Link to="/profile" className="add-logo-link">
            <i className="bi bi-plus-circle me-2"></i>
            Add Company Logo
          </Link>
        ) : userRole?.includes("ems_admin") ? (
          <img
            src="/assets/img/pathbreaker_logo.png"
            alt="EMS Admin Logo"
            className="company-logo"
            onClick={() => navigate('')}
            tabIndex="0"
            role="button"
          />
        ) : (
          <div className="default-logo" onClick={() => navigate('/main')} tabIndex="0" role="button">
            <span>Logo</span>
          </div>
        )}
      </div>
      <nav className="nav-items-container mt-2">
        <ul className="nav-items">
          {getRoleNavItems.map((item) => renderNavItem(item))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNav;