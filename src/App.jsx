import React, { useEffect, useState } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, Routes } from "react-router-dom"
import Cookies from 'js-cookie';
import Chat from '../components/Chat.jsx'
import './App.css'
import Login from '../components/Login.jsx'
import Loader from '../components/Loader.jsx'
import RequireAuth from '../components/RequireAuth';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

//main
const App = () => {
  //js

  const [loading,setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect (() => {
    const timer = setTimeout(() => {
      const userCookie = Cookies.get('user');
      setIsAuthenticated(!!userCookie);
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
},[])


//routes
const routes = createBrowserRouter(
  [
    {
      path:"/",
      element: loading ? ( <Loader /> ) : isAuthenticated ? (<Navigate to="/chatting" />) : (<Navigate to="/login" />)
    },
    {
        path: "/login",
        element: loading ? <Loader /> : <Login />
    },
    {
      path: "/chatting",
      element: <Chat />
    },
  ],
)

//main
  return (
    <div>
      <RouterProvider router={routes} />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
