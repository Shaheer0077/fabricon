import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ isAdmin: true });

    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash("admin123", salt);

      await User.create({
        name: "Super Admin",
        email: "admin@fabricon.com",
        password: hashed,
        isAdmin: true
      });
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.log(error);
  }
};

export default createDefaultAdmin;
