const User = require("../models/userModel");
const Meeting = require("../models/MeetingModel");
const { status } = require("http-status");
const { createSecretToken } = require("../utils/secretToken");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.signup = async (req, res) => {
  const { name, username, password, email } = req.body;
  if (!name || !username || !password || !email) {
    return res.json({ message: "Fill all the  fields!" });
  }
  try {
    const existingUser = await User.findOne({ username, email });
    if (existingUser) {
      return res.json({ message: "Username or email already exists!" });
    }
    const newUser = new User({
      name,
      username,
      password,
      email,
    });
    await newUser.save();
    const token = createSecretToken(newUser._id);
  
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    return res.status(status.CREATED).json({
      message: `Welcome ${username}`,
      success: true,
      newUser,
      token,
    });
  } catch (e) {
    return res
      .status(status.BAD_REQUEST)
      .json({ message: `something went wrong ${e}` });
  }
};

module.exports.signin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ message: "Fill all the fields!" });
  }
  try {
    const foundUser = await User.findOne({ username });
    if (!foundUser) {
      return res.json({ message: "User not Found!" });
    }
    const auth = await bcrypt.compare(password, foundUser.password);
    if (!auth) {
      return res.json({ message: "Wrong Password" });
    } else {
      const token = createSecretToken(foundUser._id);

      res.cookie("token", token, {
        withCredentials: true,
        httpOnly: false,
      });
      return res
        .status(201)
        .json({ message: `Welcome back ${username}!`, success: true, token });
    }
  } catch (e) {
    return res.status(404).json({ message: `something went wrong ${e}` });
  }
};

module.exports.createMeeting = async (req, res) => {
  const { token } = req.query;
  // console.log("Token:" + token);

  if (!token) {
    return res.json({ success: false, message: "invalid Token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(decoded.id);
    console.log(user);
    const newMeetingCode = Math.random().toString(36).substring(2, 8);
    let newMeeting = new Meeting({
      user_id: user.username,
      meeting_code: newMeetingCode,
    });
    await newMeeting.save();
    return res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      code: newMeetingCode,
    });
  } catch (e) {
    res.status(404).json({
      message: `Unknown Error Occured while creating a room ${e} `,
      success: false,
    });
  }
};

module.exports.joinMeeting = async (req, res) => {
  const { meeting_code } = req.body;

  try {
    const meeting = await Meeting.findOne({
      meeting_code: meeting_code,
    });
    if (!meeting) {
      return res.json({
        success: false,
        message: "Invalid Meeting code!",
      });
    }

    if (meeting.status !== "live") {
      return res.status(404).json({
        success: false,
        message: "Meeting is not live or has ended.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Meeting joined successfully.",
      meeting,
    });
  } catch (e) {
    res
      .status(404)
      .json({ message: `Unknown Error Occured while joining the room ${e} ` });
  }
};
module.exports.getActivity = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(decoded.id);
    const meetings = await Meeting.find({ user_id: user.username });
    res.json(meetings);
  } catch (e) {
    res.json({ message: `something went wrong ${e}` });
  }
};
module.exports.addToActivity = async (req, res) => {
  const { token, meeting_code } = req.body;
  if (!token) {
    return res.json({ success: false, message: "invalid Token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const user = await User.findById(decoded.id);
    const newMeeting = new Meeting({
      user_id: user.username,
      meeting_code: meeting_code,
    });
    await newMeeting.save();
    res.status(CREATED).json({ message: "Added to Activity" });
  } catch (e) {
    res.json({ message: `something went wrong ${e}` });
  }
};
