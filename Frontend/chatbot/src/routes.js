import Chat from 'pages/Chat'
import Home from 'pages/Home'
import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

export default function AppRoutes() {
  const token = sessionStorage.getItem('token')
  const [usuarioLogado] = useState(token != null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route
          path='/chat'
          element={usuarioLogado ? <Chat /> : <Navigate to="/"/>}/>
      </Routes>
    </BrowserRouter>
  )
}
