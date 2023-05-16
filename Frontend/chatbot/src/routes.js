import Chat from 'pages/Chat'
import Login from 'pages/Login'
import { BrowserRouter, Route, Routes } from "react-router-dom"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/chat' element={<Chat />} />
      </Routes>
    </BrowserRouter>
  )
}
