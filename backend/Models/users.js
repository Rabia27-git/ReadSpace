import mongoose from "mongoose";

const finishedBookSchema = new mongoose.Schema({
  isbn: String,
  title:String,
  thumbnail:String,
  startDate: Date,
  endDate:{
    type: Date,
    default: Date.now
  },
  rating: String
}, { _id: false });

const inProgressBookSchema = new mongoose.Schema({
  isbn: String,
  title:String,
  thumbnail:String,
  startDate: {
    type: Date,
    default: Date.now
  },
  currentPage: Number,
  pageCount: Number 
}, { _id: false });

const wantToReadBookSchema = new mongoose.Schema({
  isbn: String,
  title:String,
  thumbnail:String,
}, { _id: false });

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  joinDate: {
    type: Date,
    default: Date.now
  },
  books: {
    type: new mongoose.Schema({
      finished: [finishedBookSchema],
      inProgress: [inProgressBookSchema],
      wantToRead: [wantToReadBookSchema]
    }, { _id: false }),
    default: () => ({ finished: [], inProgress: [], wantToRead: [] })
  },
  clubsJoined: {
    type: Array,
    default: []
  }
});

export const userModel = mongoose.model("users", userSchema);
