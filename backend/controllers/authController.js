import jwt from "jsonwebtoken";
import User from "../models/User.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      avatar: name.charAt(0).toUpperCase(),
    });
    const token = signToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      user: userData,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const me = (req, res) => {
  res.json({ user: req.user });
};

// export const updateProfile = async (req, res) => {
//   try {
//     const { name, morningMotivation } = req.body;
//     const user = await User.findById(req.user._id);
//     if (name !== undefined && name.trim() !== "") {
//       user.name = name;
//       user.avatar = name.charAt(0).toUpperCase();
//     }

//     if (morningMotivation !== undefined) {
//       user.morningMotivation = morningMotivation;
//     }

//     await user.save();
//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateProfile = async (req, res) => {
  try {
    const { name, morningMotivation } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined && name.trim() !== "") {
      user.name = name;
      user.avatar = name.charAt(0).toUpperCase();
    }

    if (morningMotivation !== undefined) {
      user.morningMotivation = morningMotivation;
    }

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({ user: userData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
