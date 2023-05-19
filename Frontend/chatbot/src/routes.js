import Chat from 'pages/Chat'
import Home from 'pages/Home'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"

export default function AppRoutes() {

  let logado = sessionStorage.getItem("token")
  console.log(logado)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/chat' element={logado? <Chat /> : <Navigate to='/' />} />
      </Routes>
    </BrowserRouter>
  )
}
