const User = require("../models/userModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = async (req, res) => {
  console.log(req.cookies);
  const token = req.cookies.token;
  if (!token) {
    return res.status(404).json({ message: "authentication failed!" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Token!" });
    }
    try {
      console.log(data);
      const foundUser =await User.findById(data.id);
      if (foundUser) {
        return res.status(200).json({ message: "authentication successful!" });
      } else {
        return res.status(404).json({ message: "authentication failed!" });
      }
    } catch (error) {
      return res.status(404).json({ message: `something went wrong ${error}` });
    }
  });
};
