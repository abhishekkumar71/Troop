const { Server } = require("socket.io");
const Meeting = require("../models/MeetingModel");
let usernames = {};
let userRoles = {};
let messages = {};
let connections = {};
let timeOnline = {};
module.exports.SocketConnection = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(socket.id);
    socket.on("join-call", async ({ room, username, isHost }) => {
      if (connections[room] === undefined) {
        connections[room] = [];
      }
      connections[room].push(socket.id);
      timeOnline[socket.id] = new Date();
      if (connections[room].length === 1) {
        userRoles[socket.id] = "host";
      } else {
        userRoles[socket.id] = "participant";
      }
      usernames[socket.id] = username;
      socket.join(room);
      const clientDetails = connections[room].map((id) => ({
        id,
        username: usernames[id],
        role: userRoles[id],
      }));
      io.to(room).emit("user-joined", {
        id: socket.id,
        clients: clientDetails,
      });
      if (messages[room]) {
        messages[room].forEach((msg) => {
          io.to(socket.id).emit(
            "chat-message",
            msg["data"],
            msg["sender"],
            msg["socketID-sender"]
          );
        });
      }
      if (username) {
        const meeting = await Meeting.findOne({ meeting_code: room });
        if (
          meeting &&
          !meeting.participants.some((p) => p.username === username)
        ) {
          meeting.participants.push({
            username,
            role: userRoles[socket.id],
          });
          await meeting.save();
        }
      }
    });
    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });
    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomVal]) => {
          if (!isFound && roomVal.includes(socket.id)) {
            return [roomKey, true];
          }
        },
        ["", false]
      );

      if (found) {
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socketID-sender": socket.id,
        });
        connections[matchingRoom].forEach((element) => {
          io.to(element).emit("chat-message", data, sender, socket.id);
        });
      }
    });
    socket.on("disconnect", async () => {
      console.log(`Disconnected: ${socket.id}`);

      for (const [room, socketIds] of Object.entries(connections)) {
        // console.log(room);
        if (socketIds.includes(socket.id)) {
          // Notify all others in the room
          socketIds.forEach((id) => {
            if (id !== socket.id) {
              io.to(id).emit("user-left", socket.id);
            }
          });

          const index = socketIds.indexOf(socket.id);
          if (index !== -1) socketIds.splice(index, 1);

          if (socketIds.length === 0) {
            delete connections[room];
            const meeting = await Meeting.findOneAndUpdate({ meeting_code: room });
            console.log(meeting);
            meeting.status = "ended";
            await meeting.save();
            console.log(meeting);

          }

          break;
        }
      }

      delete usernames[socket.id];
      delete userRoles[socket.id];
      delete timeOnline[socket.id];
    });

    return io;
  });
};
