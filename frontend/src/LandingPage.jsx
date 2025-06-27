import React from 'react'
import {Link} from 'react-router-dom'
import "./LandingPage.css"

function LandingPage() {
  return (
      <div className="landingPage">

        <div id="twoButtons">
          <button><Link to="/login">Login</Link></button>
          <button><Link to="/signup">Sign Up</Link></button>
        </div>

        <div id="textPic">
          <div id="text">
            <h1 id="heading">Welcome to ReadSpace</h1>
            <p id="para">Welcome to ReadSpace — a friendly place for readers of all kinds.</p>
            <p id="para">Track your books, join fun book clubs, and connect with people who love reading too.</p>
            <p id="para">Organize your reading list, mark your progress, and discover new books.</p>
            <p id="para">Share your thoughts, join real-time chats, and enjoy being part of a reading community.</p>
            <p id="para">Start your reading journey with us today!</p>
          </div>
          <img src="/landingPagePic.jpg" width={350}/>
        </div>

        <div id="cards">

          <div className="card" style={{width: "18rem"}}>
            <img src="/card1.jpg" className="card-img-top"/>
            <div className="card-body">
              <h5 className="card-title">Track Your Books</h5>
              <p className="card-text">Add books to your shelf, update your reading progress, and keep track of your finished and upcoming reads.</p>
            </div>
          </div>
          
          <div className="card" style={{width: "18rem"}}>
            <img src="/card2.jpg" className="card-img-top"/>
            <div className="card-body">
              <h5 className="card-title">Real-time Chat</h5>
              <p className="card-text">Chat live with your book club members, share your thoughts, and stay connected in real time.</p>
            </div>
          </div>

          <div className="card" style={{width: "18rem"}}>
            <img src="/card3.jpg" className="card-img-top"/>
            <div className="card-body">
              <h5 className="card-title">Join Book Clubs</h5>
              <p className="card-text">Connect with readers, discuss your favorites, and make new friends.</p>
            </div>
          </div>

        </div>
        
      </div>
  )
}

export default LandingPage