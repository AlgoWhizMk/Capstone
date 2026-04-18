import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

async function clean() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ email: { $regex: /skswadmin@shrikrishnasteelwork\.in/i } });
  console.log("Deleted old user");
  process.exit();
}

clean();
