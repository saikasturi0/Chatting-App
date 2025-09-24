import React from 'react'
import "./Loader.css"
import logo2 from "./logo.png"
const Loader = () => {
  return (
    <div>
    <div className='loaderback'>
      <img src={logo2} alt="logo" />
      <p>Chatting App</p>
    </div>
    </div>
  )
}
export default Loader
