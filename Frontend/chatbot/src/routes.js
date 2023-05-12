import Chat from 'pages/Chat'
import Teste from 'pages/teste'
import { BrowserRouter, Route, Routes } from "react-router-dom"

export default function AppRoutes () {
  return (
    <BrowserRouter>
        <Routes>
            <Route path='/' element={<Chat />}/>
            <Route path='/teste' element={<Teste />}/>
        </Routes>
    </BrowserRouter>
  )
}
