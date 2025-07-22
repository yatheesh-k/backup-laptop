import React, { useEffect } from 'react';
import { Route, Routes} from 'react-router';
import EmsLogin from '../Login/EmsLogin';
import CompanyLogin from '../Login/CompanyLogin';
import CandidateLogin from '../Login/CandidateLogin';
import AnonymousCmpRegistration from '../EMSModule/Company/AnonymousCmpRegistration';
import routeConfig from './RouteConfig';
import LandingPage from '../Website/LandingPage';
import Reset from '../LayOut/Reset';
import ForgotPassword from '../Login/ForgotPassword';
import ForbiddenPage from './ForbiddenPage';
import ProtectedRoute from './ProtectedRoute';

const flattenRoutes = (routes) => {
  const flatRoutes = [];
  const recurse = (items) => {
    items.forEach((route) => {
      if (route.path && route.element) {
        flatRoutes.push(route);
      }
      if (route.children && Array.isArray(route.children)) {
        recurse(route.children);
      }
    });
  };
  recurse(routes);
  return flatRoutes;
};
const Routing = () => {
 useEffect(() => {
    console.log("Loaded routeConfig:");
    routeConfig.forEach(({ path, allowedRoles, allowedResourceTypes }, index) => {
      console.log(`Route[${index}]:`, {
        path,
        allowedRoles,
        allowedResourceTypes
      });
    });
  }, []);
    const allRoutes = flattenRoutes(routeConfig);
  return (
 <Routes>
           <Route path="/" element={<LandingPage />} />
      <Route path='/:company/candidateLogin' element={<CandidateLogin/>}/>
      <Route path='/login' element={<EmsLogin/>}/>
      <Route path='/:company/login' element={<CompanyLogin/>}/>
      <Route path='/resetPassword' element={<Reset/>} />
      <Route path='/forgotPassword' element={<ForgotPassword/>}/>
      <Route path='/anonymouseCmpRegistration' element={<AnonymousCmpRegistration/>}/>
      <Route path='/forbidden' element={<ForbiddenPage/>}/>
       {allRoutes.map(({ path, element, allowedRoles, allowedResourceTypes }, index) => (
        <Route
          key={index}
          path={path}
          element={
            <ProtectedRoute
              element={element}
              allowedRoles={allowedRoles}
              allowedResourceTypes={allowedResourceTypes}
            />
          }
        />
      ))}
    </Routes>
  );
};
export default Routing;