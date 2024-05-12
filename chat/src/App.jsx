import { useState } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from './pages/Chat'
import SearchPage from './pages/SearchPage'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
      {/* <Register></Register> */}
      {/* <Login></Login> */}
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home></Home> }></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/search" element={<SearchPage></SearchPage>}></Route>
        <Route path="/chat/:id" element={<Chat></Chat>}></Route>
      </Routes>
    </BrowserRouter>
    </div>
  )
}

export default App
