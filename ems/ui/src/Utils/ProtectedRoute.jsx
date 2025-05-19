import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../Context/AuthContext';



const Protected = () => {
  const {userId}=useAuth();
let auth={userId}
return auth.userId?<Outlet/>:<Navigate to={'/'}/>
}
export default Protected;