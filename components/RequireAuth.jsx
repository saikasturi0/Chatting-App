import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";

const RequireAuth = ({ isAuthenticated, children }) => {
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
