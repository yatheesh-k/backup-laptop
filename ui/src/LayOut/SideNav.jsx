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

  // Auto-expand parent when child is active (now supports two levels)
  useEffect(() => {
    const newExpandedItems = { ...expandedItems };
    
    Object.keys(NAV_CONFIG).forEach(role => {
      NAV_CONFIG[role].forEach(item => {
        if (item.items) {
          // Check first level items
          const hasActiveChild = item.items.some(child => {
            if (child.items) {
              // Check second level items
              return child.items.some(subChild => pathname.startsWith(subChild.path));
            }
            return pathname.startsWith(child.path);
          });
          
          if (hasActiveChild) {
            newExpandedItems[item.path || item.title] = true;
          }

          // Also expand second level parents if their children are active
          item.items.forEach(child => {
            if (child.items) {
              const hasActiveSubChild = child.items.some(subChild => 
                pathname.startsWith(subChild.path)
              );
              if (hasActiveSubChild) {
                newExpandedItems[child.path || child.title] = true;
              }
            }
          });
        }
      });
    });

    setExpandedItems(newExpandedItems);
  }, [pathname]);

  const handleToggleExpand = (path) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const renderNavItem = (item, level = 0) => {
    const hasChildren = item.items && item.items.length > 0;
    const isExpanded = expandedItems[item.path || item.title];
    const active = isActive(item.path);
    const isSecondLevel = level === 1;

    return (
      <React.Fragment key={item.path || item.title}>
        <li className={`nav-item ${hasChildren ? 'has-children' : ''} ${isSecondLevel ? 'second-level' : ''}`}>
          {hasChildren ? (
            <button
              className={`nav-link ${active ? 'active' : ''}`}
              onClick={() => handleToggleExpand(item.path || item.title)}
              aria-expanded={isExpanded}
            >
              <div className="nav-link-content">
                {item.icon && <i className={`bi bi-${item.icon}`}></i>}
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
                {item.icon && <i className={`bi bi-${item.icon}`}></i>}
                <span>{item.title}</span>
              </div>
            </Link>
          )}
        </li>

        {hasChildren && (
          <div
            className={`submenu-container ${isExpanded ? 'expanded' : ''} ${isSecondLevel ? 'second-level' : ''}`}
            style={{
              maxHeight: isExpanded ? '1000px' : '0',
              overflowY: isExpanded ? 'auto' : 'hidden'
            }}
          >
            <div className="submenu-inner">
              {item.items.map((child) => (
                <React.Fragment key={child.path || child.title}>
                  {renderNavItem(child, level + 1)}
                </React.Fragment>
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

    const filterAllowedItems = (items) => {
      return items.filter(item => {
        if (item.items) {
          const filteredChildren = filterAllowedItems(item.items);
          return filteredChildren.length > 0;
        }
        return allowedPaths.includes(item.path);
      });
    };

    userRole.forEach(role => {
      if (NAV_CONFIG[role]) {
        NAV_CONFIG[role].forEach(item => {
          if (item.items) {
            const allowedChildren = filterAllowedItems(item.items);
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
      <nav className="nav-items-container">
        <ul className="nav-items">
          {getRoleNavItems.map((item) => renderNavItem(item))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideNav;