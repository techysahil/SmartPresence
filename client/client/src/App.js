import React from 'react'
import Signup from './components/Signup'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { ToastContainer } from 'react-toastify';

const App = () => {
  const myRouter = createBrowserRouter([

    {
      path: '/',
      element: <Dashboard />
    },

    {
      path: '/login',
      element: <Login /> 

    },
    {
      path:'/signup',
      element: <Signup />
    },
    {
      path:'/dashboard',
      element: <Dashboard />
    },


  ]);
  
  return (
    <>
      
      <RouterProvider router={myRouter}/>
      <ToastContainer n/>
     
    </>
  )
}
export default App 