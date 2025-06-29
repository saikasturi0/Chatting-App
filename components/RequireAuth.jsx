// in jsx if we show alert directly in routes it will show two times and for every page it is applicable so it is better to do separate the alert as differet 
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ isAuthenticated, children }) => {
 //childern means the component we specific in {RequireAuth} class that component will render
    const [toastShown,setToastShown] = useState(false)
    useEffect(() => {
    if (!isAuthenticated && !toastShown) {
        toast.warn("Please login to continue");
        setToastShown(true);
    }
    }, [isAuthenticated, toastShown]);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default RequireAuth;
