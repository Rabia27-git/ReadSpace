import React, { useEffect } from 'react'
import "./Dashboard.css"
import {FaUser} from "react-icons/fa";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { FaStar, FaRegStar } from "react-icons/fa";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("finished");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [wantToReadBooks,setWantToReadBooks]=useState([])
  const [inProgressBooks,setInProgressBooks]=useState([])
  const [finishedBooks,setFinishedBooks]=useState([])
  const [showReviewModal, setShowReviewModal]=useState(false);
  const [selectedBook, setSelectedBook]=useState(null);
  const [rating, setRating]=useState(0);

  const navigate=useNavigate()

  const handleSearchInputChange=(e)=>{
    setSearchQuery(e.target.value);
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:3000/booksList',{query: searchQuery });
      const books=response.data.books;
      if (books.length===0) {
        navigate('/BooksList',{state:{error:'No results found',searchResults:[]}});
      } 
      else {
        navigate('/BooksList',{state:{searchResults:books}});
      }
    } 
    catch (error) {
      navigate('/BooksList',{state:{error:'Failed to fetch search results. Please try again later.',searchResults:[] } });
    }
  };

  const getWantToReadBooks=async()=>{
      try{
        const userId=localStorage.getItem("userId")
        const response=await axios.get(`http://localhost:3000/users/${userId}`)
        const user=response.data
        setWantToReadBooks(user.books.wantToRead)
      }
      catch(error){
        console.log("Error",error)
        alert("Error getting want to read books")
      }
  }

  const getInProgressBooks=async()=>{
    try{
      const userId=localStorage.getItem("userId")
      const response=await axios.get(`http://localhost:3000/users/${userId}`)
      const user=response.data
      setInProgressBooks(user.books.inProgress)
    }
    catch(error){
      console.log("Error",error)
      alert("Error getting in progress books")
    }
  }

  useEffect(()=>{
    if(activeTab==="wantToRead"){
      getWantToReadBooks()
    }
    else if(activeTab==="inProgress"){
      getInProgressBooks()
    }
    else{
      getFinishedBooks()
    }
  },[activeTab])

  const startReading=async(isbn)=>{
    const userId=localStorage.getItem("userId")
    try{
      await axios.put(`http://localhost:3000/users/${userId}/startReading/${isbn}`)
      setWantToReadBooks(prevBooks => prevBooks.filter(book => book.isbn !== isbn));
    }
    catch(error){
      console.log("Error moving book to In Progress", error);
      alert("Error moving book to In Progress");
    }
  }

  const removeWantToReadBook=async(isbn)=>{
    const userId=localStorage.getItem("userId")
    try{
      axios.put(`http://localhost:3000/users/${userId}/removeWantToRead/${isbn}`)
      setWantToReadBooks(prevBooks => prevBooks.filter(book => book.isbn !== isbn));
    }
    catch(error){
      console.log("Error removing book", error);
      alert("Error removing book");
    }
  }

  const handlePageChange=async(e,isbn,pageCount)=>{
    const newPageNo = parseInt(e.target.value);
    if (newPageNo<1||newPageNo>pageCount) {
      alert(`Please enter a page number between 1 and ${pageCount}.`);
      return;
    }
    const userId = localStorage.getItem("userId");
    try {
      await axios.put(`http://localhost:3000/users/${userId}/updatePageNo/${isbn}`, {
        pageNo: newPageNo,
      });
      setInProgressBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.isbn === isbn ? { ...book, currentPage: newPageNo } : book
        )
      );
    } catch (error) {
      console.log("Error updating page number", error);
      alert("Error updating page number");
    }
  };

  const removeInProgressBook=async(isbn)=>{
    const userId=localStorage.getItem("userId")
    try{
      axios.put(`http://localhost:3000/users/${userId}/removeInProgressBook/${isbn}`)
      setInProgressBooks(prevBooks=>prevBooks.filter(book=>book.isbn!==isbn));
    }
    catch(error){
      console.log("Error removing book", error);
      alert("Error removing book");
    }
  }

  const doneReading1=async(isbn,currentPage,pageCount)=>{
    if(currentPage<pageCount){
      alert("Looks like you still have pages left. Finish the book before marking it as done")
      return
    }
      const book=inProgressBooks.find(book=>book.isbn===isbn);
      setSelectedBook(book);
      setShowReviewModal(true);
  }

  const getFinishedBooks=async()=>{
    try{
      const userId=localStorage.getItem("userId")
      const response=await axios.get(`http://localhost:3000/users/${userId}`)
      const user=response.data
      setFinishedBooks(user.books.finished)
    }
    catch(error){
      console.log("Error",error)
      alert("Error getting finished books")
    }
  }

  return (
    <div className="dashboard">
      
      <div id="header">
        <h1>ReadSpace</h1>
        <div id="input-and-btn">
        <input type="search" className="form-control" placeholder="Looking for something to read?" value={searchQuery} onChange={handleSearchInputChange}/> 
        <button id="searchBtn" onClick={handleSearch}>Search</button>
        </div>
        <div id="buttons">
         <button id="clubsButton" onClick={()=> navigate("/club")}>Clubs</button>
          <button  onClick={() => navigate("/Profile")} id="profileBtn"><FaUser/>   Profile</button>
        </div>
      </div>

      <div className="tab-container">
        <div className="tab-headers">
          <div
            className={`tab-header ${activeTab==="finished"?"active":""}`}
            onClick={() => setActiveTab("finished")}
          >
            Finished
          </div>
          <div
            className={`tab-header ${activeTab==="inProgress"?"active":""}`}
            onClick={() => setActiveTab("inProgress")}
          >
            In Progress
          </div>
          <div
            className={`tab-header ${activeTab==="wantToRead"?"active":""}`}
            onClick={() => setActiveTab("wantToRead")}
          >
            Want to Read
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "finished" &&
          finishedBooks.map((book,index)=>(
            <div key={book.isbn} className="book-card1">
              <img src={book.thumbnail} alt={book.title} onClick={()=>navigate('/bookDetailedPage',{state:{isbn:book.isbn}})}/>
              <div className="book-info1">
                <h3>{book.title}</h3>
                <p>Start Date: {new Date(book.startDate).toLocaleDateString()}</p>
                <p>End Date: {new Date(book.endDate).toLocaleDateString()}</p>
                {/* Rating */}
                <div style={{display:"flex",alignItems:"center", justifyContent:"center"}}>
                  {[1,2,3,4,5].map((star)=>(
                    <span key={star} style={{color:"#f5c518",fontSize:"20px"}}>
                      {star<=book.rating?<FaStar/>:<FaRegStar/>}
                  </span>
                  ))
                  }
                </div>

              </div>
            </div>
          )
          )}

          {activeTab === "inProgress" && 
            inProgressBooks.map((book) => {
              const progressPercent=(book.currentPage/book.pageCount)*100;
              return(
              <div key={book.isbn} className="book-card2">
                <img src={book.thumbnail} alt={book.title} onClick={()=>navigate('/bookDetailedPage',{state:{isbn:book.isbn}})}/>
                <div className="book-info2">
                  <h3 style={{marginTop:"12px"}}>{book.title}</h3>
                  <p>Started On: {new Date(book.startDate).toLocaleDateString()}</p>
                  <div id="pageInput">
                    <p>Pages Read:</p>
                    <input type="number" min={1} max={book.pageCount} value={book.currentPage} onChange={(e)=>handlePageChange(e,book.isbn,book.pageCount)}/>
                    <p>out of {book.pageCount}</p>
                  </div>

                  <div style={{ width: "50px", margin: "0px", marginLeft:"80px", marginTop:"4px"}}>
                    <CircularProgressbar
                      value={progressPercent}
                      text={`${Math.round(progressPercent)}%`}
                      styles={buildStyles({
                        textSize: '22px',
                        pathColor: '#3498db',
                        textColor: '#3498db',
                        trailColor: '#d8d1d1',
                      })}
                    />
                  </div>
                  
                  <button id="doneReading" onClick={()=>doneReading1(book.isbn,book.currentPage,book.pageCount)}>Done Reading</button>
                  <button id="removeInProgressBook" onClick={()=>removeInProgressBook(book.isbn)}>Remove</button>
                </div>
              </div>
            )}
            )
          }

          {activeTab === "wantToRead" && 
          wantToReadBooks.map((book) => (
          <div key={book.isbn} className="book-card3">
            <img src={book.thumbnail} alt={book.title} onClick={()=>navigate('/bookDetailedPage',{state:{isbn:book.isbn}})}/>
            <div className="book-info3">
              <h3 style={{marginTop:"12px"}}>{book.title}</h3>
              <button id="startReadingBtn" onClick={()=>startReading(book.isbn)}>Start Reading</button>
              <button id="removeWantToReadBookBtn" onClick={()=>removeWantToReadBook(book.isbn)}>Remove</button>
            </div>
          </div>
          )
         )}

        </div>
      </div>

      {showReviewModal && selectedBook && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Rate "{selectedBook.title}"</h3>
          <div className="stars">
            {[1,2,3,4,5].map((star)=>(
            <span
              key={star}
              onClick={()=>setRating(star)}
              style={{cursor:"pointer",fontSize:"24px",color:"#f5c518" }}
            > 
               {star<=rating?<FaStar/>:<FaRegStar/>}
            </span>
            ))}
          </div>
          <button id="submitRatingBtn"
            onClick={async()=>{
              try {
                const userId=localStorage.getItem("userId");
                await axios.put(`http://localhost:3000/users/${userId}/finishBook/${selectedBook.isbn}`,{rating});
                setInProgressBooks(prevBooks=>prevBooks.filter(book=>book.isbn!==selectedBook.isbn));
                setShowReviewModal(false);
                setRating(0);
              } 
              catch(error){
                console.log("Error finishing book", error);
                alert("Failed to mark book as finished.");
              }  
            }}
          >
            Submit
          </button>

            <button id="cancelRatingBtn"
              onClick={async()=>{
                try {
                  const userId=localStorage.getItem("userId");
                  await axios.put(`http://localhost:3000/users/${userId}/finishBook/${selectedBook.isbn}`,{rating});
                  setInProgressBooks(prevBooks=>prevBooks.filter(book=>book.isbn!==selectedBook.isbn));
                  setShowReviewModal(false);
                  setRating(0);
                } 
                catch(error){
                  console.log("Error finishing book", error);
                  alert("Failed to mark book as finished.");
                }  
              }}
            >Cancel</button>

        </div>
      </div>
      )}


    </div>
  )
}

export default Dashboard