require("dotenv").config();
const {SocketConnection} = require("./src/controllers/socketController");
const userRouter = require("./src/Routes/userRouter");

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const {createServer} = require("http");
const PORT=process.env.PORT|| 8080;
const db_URL = process.env.MONGO_URL;
const cookieParser = require("cookie-parser");
const cors = require("cors");
const server = createServer(app);
const io = SocketConnection(server);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173","https://troop-1.onrender.com"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("server working..");
});
app.use("/", userRouter);

server.listen(PORT, () => {
  console.log("listening to port 8080");
  mongoose.connect(db_URL).then(() => {
    console.log("DB connected");
  });
});

