import jwt from "jsonwebtoken";

import User from "../models/userSchema.js";
import { comparePassword, hashPassword } from "../utils/auth.js";

// Register User

const RegisterUser = async (req, res) => {
  try {
    // Destructure Req Body

    const { name, email, phone, type, password } = req.body;

    // Validation

    if (!name) return res.status(400).send("Name is required");
    if (!password || password.length < 6) {
      return res.status(400).send("Password is required and has to be min 6 characters long");
    }
    if (!email) return res.status(400).send("email is required");

    let userEmailExist = await User.findOne({ email }).exec();
    if (userEmailExist) return res.status(401).send("Email is taken");

    if (!phone) return res.status(400).send("Phone Number is required");
    let phoneNumberExist = await User.findOne({ phone }).exec();
    if (phoneNumberExist) return res.status(401).send("Phone number is taken");

    // Hash Password

    const hashedPassword = await hashPassword(password);

    // Register

    const user = new User({
      name,
      email,
      phone,
      type,
      password: hashedPassword,
    });

    await user.save();
    res.status(200).send(user);
  } catch (error) {
    res.status(400).json(error);
    throw error;
  }
};

// Login

const LoginUser = async (req, res) => {
  console.log("Login user email: ", req.body.email);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(404).send("User with email Id not found");

    const matchPassword = comparePassword(password, user.password);
    if (!matchPassword) res.status(401).send("Password did not match");

    const accessToken = jwt.sign({ _id: user._id, type: user.type }, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: "1d",
    });
    // Return user token to user excluding pass and send headers
    user.password = undefined;
    user.isActive = undefined;

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() +  8 * 3600000),
      sameSite: "none",
      domain: "*.onrender.com"
    });
    res.json({user, accessToken});
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error. Please Try Again");
  }
};

const LogoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({ message: "Sign out success" });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export { RegisterUser, LoginUser, LogoutUser };
