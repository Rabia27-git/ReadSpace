import mongoose from "mongoose";

const ClubSchema = new mongoose.Schema({
  name: String,
  description: String,
  imag: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
});

export const ClubModel = mongoose.model("clubs", ClubSchema);
