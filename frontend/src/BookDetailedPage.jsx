import React,{useState,useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "./BookDetailedPage.css"
import axios from "axios"
import { FaPlus } from "react-icons/fa";
import Comments from './comments/Comments';

function BookDetailedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {isbn} = location.state || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [buttonText, setButtonText]=useState("Add to Shelf")
  const [book,setBook]=useState(null)
  const userId=localStorage.getItem("userId")

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

  const handleClick=async()=>{
    if(!userId){
        alert("User ID not found!")
        return;
    }

    try{        
    const response=await axios.get(`http://localhost:3000/users/${userId}`)
    const user=response.data

    const updateWantToRead=[...user.books.wantToRead,{
        isbn:book.isbn,
        title:book.title,
        thumbnail:book.image
    }];

    const response1=await axios.put(`http://localhost:3000/users/${userId}/updateWantToRead`,{
        wantToRead:updateWantToRead
    })
    alert(response1.data)
    setButtonText("Added to Shelf")
    }

    catch(error){
        console.log("Error adding book",error)
        alert("Failed to add book to shelf")
    }
  }

  const checkIfBookIsAdded=async()=>{
    if(!userId){
        return;
    }

    try{
    const response=await axios.get(`http://localhost:3000/users/${userId}`)
    const user=response.data
    const isInFinished=user.books.finished.some(b=>b.isbn===book.isbn)
    const isInProgress=user.books.inProgress.some(b=>b.isbn===book.isbn)
    const isInWantToRead=user.books.wantToRead.some(b=>b.isbn===book.isbn)

    if(isInFinished || isInProgress || isInWantToRead){
        setButtonText("Added to Shelf")
    }
    else{
        setButtonText("Add to Shelf");
    }
  }
   catch(error){
    console.log("Error checking book existence",error)
  }
}

useEffect(() => {
  if (book) {
      checkIfBookIsAdded();
  }
}, [book]);

const fetchBookDetails=async()=>{
  try{
    const response=await axios.get(`http://localhost:3000/bookByIsbn/${isbn}`)
    setBook(response.data)
  }
  catch(error){
    console.error("Failed to fetch book details:", error);
  }
}

useEffect(() => {
  if (isbn) {
    fetchBookDetails();
  }
}, [isbn]);

  if (!book) {
    return <h3 style={{textAlign:"center"}}>Loading Book Details..</h3>;
  }

  return (
    <div className="book-detail-page">

        <div id="header">
            <h1>ReadSpace</h1>
            <div id="input-and-btn">
                <input type="search" className="form-control" placeholder="Looking for something to read?" value={searchQuery} onChange={handleSearchInputChange}/> 
                <button id="searchBtn" onClick={handleSearch}>Search</button>
            </div>
        </div>

        <div id="book-card">
            <img src={book.image} alt={book.title}/>
            <div id="book-info">
                <h2>{book.title}</h2>
                <h5>Author: {book.author}</h5>
                <h5>Publisher: {book.publisher}</h5>
                <h5>Published Date: {book.publishedDate}</h5>
                <button disabled={buttonText === "Added to Shelf"} onClick={handleClick}><FaPlus style={{marginRight:"8px"}}/>{buttonText}</button>
                <h6>{book.description}</h6>
            </div>
        </div>

        <Comments userId={userId} isbn={book.isbn}/>

    </div>
  );
}

export default BookDetailedPage;
