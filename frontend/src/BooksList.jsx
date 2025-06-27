import React, {useState} from 'react';
import { useLocation , useNavigate} from 'react-router-dom';
import "./BookList.css"
import axios from "axios"

function BooksList() {
  const location = useLocation();
  const { searchResults = [], error } = location.state || {};  // destructure safely
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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
    catch (error){
      navigate('/BooksList',{state:{error:'Failed to fetch search results. Please try again later.',searchResults:[] } });
    }
  };

  return (
    <div className="books-list-page">
      <div id="header">
        <h1>ReadSpace</h1>
        <div id="input-and-btn">
            <input type="search" className="form-control" placeholder="Looking for something to read?" value={searchQuery} onChange={handleSearchInputChange}/> 
            <button id="searchBtn" onClick={handleSearch}>Search</button>
        </div>
      </div>
      {error && <p>{error}</p>}

      {searchResults.length === 0 && !error ? (
        <p>No results found.</p>
      ) : (
        <div className="book-list">
          {searchResults.map((book,index) => (
            <div key={index} className="book-card" onClick={()=>navigate('/bookDetailedPage',{state:{isbn:book.isbn}})}>
              <img src={book.image} alt={book.title}/>
              <div className="book-info">
                <h3>{book.title}</h3>
                <div className="book-meta">
                  <p>Author: {book.author}</p>
                  <p>Publisher: {book.publisher}</p>
                  <p>Published Date: {book.publishedDate}</p>
                </div>
                <p className="description">{book.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BooksList;
