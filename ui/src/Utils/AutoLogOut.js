import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AutoLogout = ({ 
  totalTimeout = 15 * 60 * 1000, // 15 minutes (final logout)
  warningTimeout = 14 * 60 * 1000 // 14 minutes (show warning)
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const { resourceType,roles=[]} = useSelector((state) => state.auth);
  const company=localStorage.getItem("companyName")
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    // Routing logic
    if (roles.includes("ems_admin")) {
      navigate("/login", { replace: true });
    } else if (
      ["company_admin", "Accountant", "HR", "Admin"].includes(resourceType) ||
      company
    ) {
      navigate(`/${company?.toLowerCase() || 'company'}/login`, { replace: true });
    } else if (resourceType === "candidate") {
      navigate(`/${company?.toLowerCase() || 'company'}/candidateLogin`, { replace: true });
    } else {
      navigate("/", { replace: true });
    }

    toast.error("You have been logged out due to inactivity.");
  }, [navigate, resourceType, roles,company]);

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    
    // Hide any active warnings
    setShowWarning(false);
    setShowFinalPopup(false);

    // Set new timers
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      toast.warn("You will be logged out in 1 minute due to inactivity.", {
        autoClose: 10000 // Show for 10 seconds
      });
    }, warningTimeout);

    logoutTimerRef.current = setTimeout(() => {
      setShowFinalPopup(true);
      setTimeout(logout, 3000); // Final logout after 3 seconds
    }, totalTimeout);
  }, [warningTimeout, totalTimeout, logout]);

  useEffect(() => {
    resetTimers();
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimers));

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimers));
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [resetTimers]);

  return (
    <>
      {showWarning && !showFinalPopup && (
        <div style={styles.warningBanner}>
          <p>session will expire soon...</p>
        </div>
      )}
      
      {showFinalPopup && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <p>Logging out due to inactivity, please login again to continue.</p>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
  },
  warningBanner: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ff9800',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',
    zIndex: 1000,
    animation: 'fadeIn 0.5s',
  }
};

export default AutoLogout;