import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import CreateAccount from './CreateAccount'
import Login from './Login'
import LandingPage from './LandingPage'
import Dashboard from './Dashboard'
import BooksList from './BooksList'
import BookDetailedPage from './BookDetailedPage'
import PageNotFound from './PageNotFound'
import Club from './club'; 
import Profile from './Profile'


function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage/>}></Route>
            <Route path="/signup" element={<CreateAccount/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/dashboard" element={<Dashboard/>}></Route>
            <Route path="/booksList" element={<BooksList/>}></Route>
            <Route path="/bookDetailedPage" element={<BookDetailedPage/>}></Route>
            <Route path="/club" element={<Club />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<PageNotFound/>}></Route>
        </Routes>
    </BrowserRouter>
  )
}

export default App