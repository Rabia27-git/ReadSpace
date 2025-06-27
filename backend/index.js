import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import {userModel} from "./Models/users.js"
import {commentsModel} from "./Models/comments.js"
import{ClubModel} from "./Models/Clubs.js";
import axios from "axios";
import http from "http";
import { Server } from "socket.io";
import{chatsModel} from "./Models/chats.js";


const app=express()
app.use(express.json())
app.use(cors())

mongoose.connect("mongodb://localhost:27017/ead-project")

app.use('/images', express.static('images'));
const server = http.createServer(app)


const io = new Server(server,{
  cors:{
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const messagesPerClub = {}; // ✅ correct spelling

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`📦 User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_message", ({ room, message }) => {
    if (!messagesPerClub[room]) messagesPerClub[room] = [];
    messagesPerClub[room].push(message);

    // Broadcast to all in room except sender
   io.to(room).emit("receive_message", message);

  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

//for change password
app.put("/users/:userId/changePassword", async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  try {
    await userModel.findByIdAndUpdate(userId, { password: newPassword });
    res.status(200).send("Password updated successfully");
  } catch (error) {
    res.status(500).json({ message: "Failed to update password", error });
  }
});


//for join club
app.post('/users/:userId/join-club/:clubId', async (req, res) => {
  try {
    const { userId, clubId } = req.params;
    const user = await userModel.findById(userId);
    const club = await ClubModel.findById(clubId);

    if (!user || !club) {
      return res.status(404).json({ message: "User or club not found" });
    }

    // Fix: push to clubsJoined instead of joinedClubs
    if (!user.clubsJoined.includes(clubId)) {
      user.clubsJoined.push(clubId);
      await user.save();
    }

    // Optional: update member count
    club.memb = (club.memb || 0) + 1;
    await club.save();

    // Return updated clubs
    const joinedClubs = await ClubModel.find({
      _id: { $in: user.clubsJoined },
    });

    res.status(200).json({ joinedClubs });
  } catch (error) {
    console.error("🔥 Join club error:", error);
    res.status(500).json({ message: "Join club failed", error: error.message });
  }
});


app.get("/clubs", async (req, res) => {
  try {
    const clubs = await ClubModel.find().populate("members", "fullName"); // just show fullName of users
    res.status(200).json(clubs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clubs", error });
  }
});


//for fetching clubs data
app.get("/clubs" , async(req,res)=>{
  try{
    const clubs = await ClubModel.find();
    res.status(200).json(clubs);
  }catch(error){
    res.status(500).json({message:"Error fetching clubs", error});
  }
});

//add data when creating new clubs
app.post("/addclub", async (req, res) => {
  try {
    const { name, description, imag, memb } = req.body;
    const newClub = await ClubModel.create({ name, description, imag, memb });
    res.status(200).json({ message: "Club added", newClub });
  } catch (error) {
    res.status(500).json({ message: "Error adding club", error });
  }
});


// Get all joined clubs for a user
app.get("/users/:userId/joined-clubs", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const joinedClubs = await ClubModel.find({
      _id: { $in: user.clubsJoined },
    });

    res.status(200).json({ joinedClubs });
  } catch (error) {
    console.error("Error fetching joined clubs:", error);
    res.status(500).json({ message: "Failed to fetch joined clubs", error });
  }
});

// CHATS
app.get("/:clubId/comments",async(req,res)=>{
  try{
    const {clubId}=req.params
    const comments=await chatsModel.find({clubId:clubId})
    if(comments){
      return res.status(200).json(comments)
    }
  }
  catch(error){
    return res.status(500).json({message:"Error occurred",error})
  }
})

app.post("/:clubId/addComment",async(req,res)=>{
  const {clubId}=req.params;
  const {text,userId,parentId}=req.body;
  try {

    const user=await userModel.findById(userId);
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    const newChat=await chatsModel.create({
      clubId,
      text,
      fullName: user.fullName,
      userId,
      parentId: parentId||null,
    });
    res.status(201).json(newChat);
  } 
  catch(error){
    res.status(500).json({ message: "Failed to add chat", error });
  }
});

app.post("/deleteComment/:commentId",async(req,res)=>{
  const {commentId}=req.params;
  try {
    const comment=await chatsModel.findByIdAndDelete(commentId);
    if(!comment){
      return res.status(404).json({message:"Comment not found"});
    }
    res.status(200).json({message:"Comment deleted successfully"});
  }
  catch(error){
      res.status(500).json({message:"Failed to delete comment"});
    }
});

app.put("/updateComment/:commentId",async(req,res)=>{
  const {commentId}=req.params;
  const {text}=req.body
  try {
    const comment=await chatsModel.findByIdAndUpdate(
      commentId,
      {text},
      {new:true}
    );

    if(!comment){
      return res.status(404).json({message:"Comment not found"});
    }
    res.status(200).json({message:"Comment updated successfully"});
  }
  catch(error){
      res.status(500).json({message:"Failed to update comment"});
    }
});




app.get('/users/:userId', async (req, res) => {
  try {
    const user = await userModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send(error);
  }
});


app.post("/signup", async(req,res)=>{
    try{
      const{fullName,email,password }=req.body;
      const existingUser=await userModel.findOne({email});
      if(existingUser){
        return res.status(400).json({message:"Email already exists"});
      }

      const newUser=await userModel.create({fullName,email,password});
      return res.status(200).json({message:"User successfully created"});
    } 
    catch(error){
      return res.status(500).json({message:"Error creating user",error });
    }
  });

  app.post("/login", async(req,res)=>{
    try {
      const {email,password}=req.body;
      const user=await userModel.findOne({email:email });
      if(user){
        if(user.password===password){
          return res.status(200).json({message:"Success",userId:user._id,fullName: user.fullName});
        } else {
          return res.status(401).json({message:"Password is incorrect"});
        }
      } else {
        return res.status(404).json({message:"No Record found"});
      }
    } catch(error) {
      return res.status(500).json({message:"Error occurred",error });
    }
});

// shows book list
app.post("/booksList",async(req,res)=>{
    const {query}=req.body;  
    try{
      const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);

      const books = response.data.items.map(item=>{
        const bookInfo = item.volumeInfo;
        return {
          isbn: bookInfo.industryIdentifiers ? bookInfo.industryIdentifiers[0].identifier : '',
          title: bookInfo.title,
          author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown',
          description: bookInfo.description || 'No description available',
          image: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : '',
          publisher: bookInfo.publisher || 'Unknown Publisher',
          publishedDate: bookInfo.publishedDate || 'Unknown Date',
          genre: bookInfo.categories || [],
        };
      });
  
      return res.status(200).json({books});
    } 
     catch (error) {
      return res.status(500).json({ message:'Error fetching book data',error });
    }
});

// put book in shelf
app.put("/users/:userId/updateWantToRead",async(req,res)=>{
   const {userId}=req.params
   const {wantToRead}=req.body

   try{
    await userModel.findByIdAndUpdate(userId,{
      $set: { "books.wantToRead": wantToRead }
    });
    res.status(200).send("Book Added to Want To Read");
   }
   catch(error){
    res.status(500).send(error);
   }
})

app.get("/bookByIsbn/:isbn",async(req,res)=>{
    const {isbn}=req.params
    try{
      const response=await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      const items=response.data.items
      if(!items || items.length===0){
        return  res.status(404).json({message:"Book not found"})
      }
      const bookInfo=items[0].volumeInfo
      const book={
        isbn: bookInfo.industryIdentifiers ? bookInfo.industryIdentifiers[0].identifier : '',
        title: bookInfo.title,
        author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown',
        description: bookInfo.description || 'No description available',
        image: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : '',
        publisher: bookInfo.publisher || 'Unknown Publisher',
        publishedDate: bookInfo.publishedDate || 'Unknown Date',
        genre: bookInfo.categories || [],
      }
      res.status(200).json(book)
    }
    catch(error){
      res.status(500).json({message:"Error fetching book by ISBN",error})
    }
})

app.put("/users/:userId/startReading/:isbn",async(req,res)=>{
  const {userId,isbn}=req.params
  try{
    const user=await userModel.findById(userId)
    if(!user){
      return res.status(404).send("User not found")
    }

    const bookIndex=user.books.wantToRead.findIndex(b=>b.isbn===isbn)
    if(bookIndex===-1){
      return res.status(404).send("Book not found in Want to Read");
    }
    const book=user.books.wantToRead[bookIndex]

    const response=await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
    const bookData=response.data.items ? response.data.items[0].volumeInfo : null;
    const pageCount=bookData && bookData.pageCount ? bookData.pageCount : null;

    user.books.wantToRead.splice(bookIndex,1) // startIndex, deleteCount

    user.books.inProgress.push({
      isbn: book.isbn,
      title: book.title,
      thumbnail: book.thumbnail,
      currentPage: 1,
      pageCount: pageCount
    });
    await user.save()
    res.status(200).send("Book moved to In Progress");
  }
  catch(error){
    res.status(500).send(error);
  }
})

app.put("/users/:userId/removeWantToRead/:isbn",async(req,res)=>{
  const {userId,isbn}=req.params
  try{
    await userModel.findByIdAndUpdate(userId,{
      $pull:{"books.wantToRead":{isbn:isbn}}
    });
    res.status(200).send("Book removed from Want To Read");
  }
  catch(error){
    res.status(500).send(error);
  }
})
  

app.put('/users/:userId/updatePageNo/:isbn',async(req,res)=>{
  const {userId,isbn }=req.params;
  const {pageNo}=req.body;
  try {
    const user=await userModel.findById(userId);
    const book=user.books.inProgress.find(b=>b.isbn===isbn);
    if(book){
      book.currentPage=pageNo;
      await user.save();
      res.status(200).json({message:"Page number updated successfully"});
    } 
    else{
      res.status(404).json({message:"Book not found"});
    }
  } 
  catch(error){
    console.error("Error updating page number",error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/users/:userId/removeInProgressBook/:isbn",async(req,res)=>{
  const {userId,isbn}=req.params
  try{
    await userModel.findByIdAndUpdate(userId,{
      $pull:{"books.inProgress":{isbn:isbn}}
    });
    res.status(200).send("Book removed from In Progress");
  }
  catch(error){
    res.status(500).send(error);
  }
})

app.put("/users/:userId/finishBook/:isbn",async(req,res)=>{
  const {userId,isbn}=req.params
  const {rating}=req.body
  try{
    const user=await userModel.findById(userId)
    if(!user){
      return res.status(404).send("User not found")
    }
    const bookIndex=user.books.inProgress.findIndex(b=>b.isbn===isbn)
    if(bookIndex===-1){
      return res.status(404).send("Book not found in Want to Read");
    }
    const book=user.books.inProgress[bookIndex]
    user.books.inProgress.splice(bookIndex,1) // startIndex, deleteCount

    user.books.finished.push({
      isbn: book.isbn,
      title: book.title,
      thumbnail: book.thumbnail,
      startDate:book.startDate,
      rating:rating
    });
    await user.save()
    res.status(200).send("Book moved to Finished");
  }
  catch(error){
    res.status(500).send(error);
  }
})

app.get("/:isbn/comments",async(req,res)=>{
  try{
    const {isbn}=req.params
    const comments=await commentsModel.find({isbn:isbn})
    if(comments){
      return res.status(200).json(comments)
    }
  }
  catch(error){
    return res.status(500).json({message:"Error occurred",error})
  }

})

app.post("/:isbn/addComment",async(req,res)=>{
  const {isbn}=req.params;
  const {text,userId,parentId}=req.body;
  try {

    const user=await userModel.findById(userId);
    if(!user){
      return res.status(404).json({ message: "User not found" });
    }

    const newComment=await commentsModel.create({
      isbn,
      text,
      fullName: user.fullName,
      userId,
      parentId: parentId||null,
    });
    res.status(201).json(newComment);
  } 
  catch(error){
    res.status(500).json({ message: "Failed to add comment", error });
  }
});


app.post("/deleteComment/:commentId",async(req,res)=>{
  const {commentId}=req.params;
  try {
    const comment=await commentsModel.findByIdAndDelete(commentId);
    if(!comment){
      return res.status(404).json({message:"Comment not found"});
    }
    res.status(200).json({message:"Comment deleted successfully"});
  }
  catch(error){
      res.status(500).json({message:"Failed to delete comment"});
    }
});

app.put("/updateComment/:commentId",async(req,res)=>{
  const {commentId}=req.params;
  const {text}=req.body
  try {
    const comment=await commentsModel.findByIdAndUpdate(
      commentId,
      {text},
      {new:true}
    );

    if(!comment){
      return res.status(404).json({message:"Comment not found"});
    }
    res.status(200).json({message:"Comment updated successfully"});
  }
  catch(error){
      res.status(500).json({message:"Failed to update comment"});
    }
});

app.listen(3000,()=>{
    console.log("Server is running")
})