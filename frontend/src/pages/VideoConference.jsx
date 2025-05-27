import React, { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Badge, IconButton } from "@mui/material";
import ScreenShareTwoToneIcon from "@mui/icons-material/ScreenShareTwoTone";
import StopScreenShareTwoToneIcon from "@mui/icons-material/StopScreenShareTwoTone";
import SettingsVoiceSharpIcon from "@mui/icons-material/SettingsVoiceSharp";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import CallEndOutlinedIcon from "@mui/icons-material/CallEndOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import ForumIcon from "@mui/icons-material/Forum";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EmojiPicker from "emoji-picker-react";
import MoodOutlinedIcon from "@mui/icons-material/MoodOutlined";
import { io } from "socket.io-client";
import styles from "../styles/VC.module.css";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Typography } from "@mui/material";

const server_Url = "https://troop-c7o5.onrender.com";
let connections = {};
let makingOffer = {};
let ignoreOffer = {};
let isPolite = {};

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun1.l.google.com:19302" }],
};

export default function VideoConference() {
  const socketRef = useRef();
  const socketIdRef = useRef();
  const localVideoRef = useRef();
  const bottomRef = useRef();
  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState();
  const [video, setVideo] = useState([]);
  const [audio, setAudio] = useState();
  const [screen, setScreen] = useState();
  const [showChat, setShowChat] = useState();
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const [videos, setVideos] = useState([]);
  const [newMessages, setNewMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const { meetingCode } = useParams();
  const room = meetingCode;
  const location = useLocation();
  const count = videos.length + 1;
  const navigate=useNavigate();
  useEffect(() => {
    getPermissions();
  }, []);
  const isHost = location.state?.isHost ?? false;
  const isGuest = location.state?.isGuest ?? false;
  const getPermissions = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setVideoAvailable(true);
      console.log("video permission granted!");

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioAvailable(true);
      console.log("audio permission granted!");

      const screenSharePermission =
        typeof navigator.mediaDevices.getDisplayMedia === "function";
      setScreenAvailable(screenSharePermission);

      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      window.localStream = userMediaStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMediaStream;
      }
    } catch (e) {
      console.log("Permission error:", e);
      setVideoAvailable(false);
      setAudioAvailable(false);
    }
  };

  useEffect(() => {
    if (video !== undefined || audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  const silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  const black = ({ width = 333, height = 600 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

  const connect = () => {
    localStorage.setItem("username", username);
    setAskForUsername(false);
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    getUserMedia();

    connectToSocketServer();
  };

  const connectToSocketServer = () => {
    socketRef.current = io(server_Url);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit("join-call", { room, username, isHost });
    });

    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("chat-message", addMessage);

    socketRef.current.on("user-left", (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id));
    });

    socketRef.current.on("user-joined", ({ id, clients }) => {
      clients.forEach((client) => {
        const socketListId = client.id;
        const username = client.username;
        if (connections[socketListId]) return;

        connections[socketListId] = new RTCPeerConnection(
          peerConfigConnections
        );
        makingOffer[socketListId] = false;
        ignoreOffer[socketListId] = false;
        isPolite[socketListId] = socketIdRef.current < socketListId;

        connections[socketListId].onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({ ice: event.candidate })
            );
          }
        };

        connections[socketListId].onnegotiationneeded = async () => {
          try {
            makingOffer[socketListId] = true;
            const offer = await connections[socketListId].createOffer();
            await connections[socketListId].setLocalDescription(offer);
            socketRef.current.emit(
              "signal",
              socketListId,
              JSON.stringify({
                sdp: connections[socketListId].localDescription,
              })
            );
          } catch (err) {
            console.error(err);
          } finally {
            makingOffer[socketListId] = false;
          }
        };

        connections[socketListId].ontrack = (event) => {
          console.log("ontrack fired from", socketListId, event.streams);

          if (!event.streams || !event.streams[0]) {
            console.warn("No remote stream received");
            return;
          }

          setVideos((prev) => {
            const updated = prev.filter((v) => v.socketId !== socketListId);
            return [
              ...updated,
              {
                socketId: socketListId,
                stream: event.streams[0],
                username,
                role: client.role,
              },
            ];
          });
        };

        const localStream = window.localStream;
        const senders = connections[socketListId].getSenders();

        localStream.getTracks().forEach((track) => {
          connections[socketListId].addTrack(track, localStream);
        });
      });
    });
  };

  const gotMessageFromServer = async (fromId, message) => {
    const signal = JSON.parse(message);
    const pc = connections[fromId];
    const polite = isPolite[fromId];

    try {
      if (signal.sdp) {
        const desc = new RTCSessionDescription(signal.sdp);
        const offerCollision =
          signal.sdp.type === "offer" &&
          (makingOffer[fromId] || pc.signalingState !== "stable");

        ignoreOffer[fromId] = !polite && offerCollision;
        if (ignoreOffer[fromId]) return;

        await pc.setRemoteDescription(desc);

        if (signal.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ sdp: pc.localDescription })
          );
        }
      }

      if (signal.ice) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
        } catch (err) {
          if (!ignoreOffer[fromId]) console.error("Error adding ICE", err);
        }
      }
    } catch (err) {
      console.error("Signal error from", fromId, err);
    }
  };

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream?.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    window.localStream = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    Object.entries(connections).forEach(([id, conn]) => {
      if (id !== socketIdRef.current) {
        const senders = conn.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            conn.addTrack(track, stream);
          }
        });
      }
    });
    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);

          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
          } catch (e) {
            console.log(e);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            const conn = connections[id];

            window.localStream.getTracks().forEach((track) => {
              const sender = conn
                .getSenders()
                .find((s) => s.track?.kind === track.kind);

              if (sender) {
                sender.replaceTrack(track);
              } else {
                conn.addTrack(track, stream);
              }
            });
            conn
              .createOffer()
              .then((description) =>
                conn
                  .setLocalDescription(description)
                  .then(() =>
                    socketRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: conn.localDescription })
                    )
                  )
                  .catch((e) => console.log(e))
              )
              .catch((e) => console.log(e));
          }
        })
    );
  };

  const getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video, audio })
        .then(getUserMediaSuccess)
        .catch((e) => console.log("getUserMedia error", e));
    } else {
      try {
        localVideoRef.current?.srcObject
          ?.getTracks()
          .forEach((track) => track.stop());
      } catch {}
    }
  };
  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMsg) => [...prevMsg, { sender: sender, data: data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMsg) => prevMsg + 1);
    }
  };
  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);

    setMessage("");
  };
  const handleMic = () => {
    setAudio(!audio);
  };

  const handleVideo = () => {
    setVideo(!video);
  };
  let handleCallEnd = () => {
    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }
    isGuest ? (navigate("/")) : (navigate("/home"));
  };
  const handleScreenShare = () => {
    console.log(screen);
    if (screen) {
      StopScreenShare();
    } else {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDisplayMediaSuccess)
          .catch((e) => console.log(e));
      }
      setScreen(true);
    }
  };
  let StopScreenShare = () => {
    setScreen(false);
    try {
      //STOPPING THE STREAM (SCREEN SHARING)
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    // ASSIGNING BACK THE CAMERA STREAM 
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((camStream) => {
        window.localStream = camStream;
        localVideoRef.current.srcObject = camStream;

        Object.entries(connections).forEach(([id, conn]) => {
          if (id === socketIdRef.current) return;
          const senders = conn.getSenders();

          camStream.getTracks().forEach((track) => {
            const sender = senders.find((s) => s.track?.kind === track.kind);
            if (sender) {
              sender.replaceTrack(track);
            } else {
              conn.addTrack(track, camStream);
            }
          });

          conn
            .createOffer()
            .then((desc) => conn.setLocalDescription(desc))
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({
                  sdp: conn.localDescription,
                })
              );
            });
        });
      })
      .catch((e) => console.log("Webcam error:", e));
  };
  let getDisplayMediaSuccess = (stream) => {

    //TO STOP EXISTING TRACKS
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      console.log(e);
    }

    //ASSIGNING THE CURRENT STREAM
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;


    Object.entries(connections).forEach(([id, conn]) => {
      if (id !== socketIdRef.current) {
        const senders = conn.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((s) => s.track?.kind === track.kind);

          // IF SENDER EXISTS WE REPLACE THE TRACK
          if (sender) {
            sender.replaceTrack(track);
          } else {
            // WE ADD A NEW TRACK
            conn.addTrack(track, stream);
          }
          // CREATNG OFFER
          conn.createOffer().then((description) => {
            // SETTING LOCAL DESCRIPTION
            conn
              .setLocalDescription(description)

              // EMITTING SIGNAL
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: conn.localDescription })
                );
              })
              .catch((e) => console.log(e));
          });
        });
      }
    });

    // ON ENDING , WE STOP SCREEN SHARING
    stream.getTracks().forEach((track) => {
      track.onended = () => {
        console.log("stopped");
        StopScreenShare();
      };
    });
  };

  const getCount = (count) => {
    if (count === 3 || count === 4) return styles.grid2;
    if (count > 4 || count >= 9) return styles.grid3;
    if (count > 9) return styles.gird4;
    return styles.grid1;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);
  // useEffect(() => {
  //   if (screen !== undefined) {
  //     getDisplayMedia();
  //   }
  // }, [screen]);
  return (
    <>
      <div className={styles.vcContainer}>
        {askForUsername ? (
          <>
            <h2
              style={{
                fontFamily: "Josefin Sans",
                color: "#4035351",
                fontSize: "3rem",
              }}
            >
              Enter into lobby
            </h2>
            {isHost ? (
              <p style={{fontSize:"2rem",color:"whitesmoke"}}>
                Share this Meeting Code with your Troop: <b style={{color:"gold"}}>{room}</b>
              </p>
            ) : (
              <></>
            )}
            <div className={styles.MeetContainer}>
              <TextField
                className={styles.inputsRequired}
                label="Username"
                value={username}
                variant="outlined"
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button variant="contained" onClick={connect}>
                Connect
              </Button>
            </div>
            <video
              className={styles.videoInMeet}
              ref={localVideoRef}
              autoPlay
              muted
            ></video>
          </>
        ) : (
          <div className={styles.displayPage}>
            <div className={`${styles.videosContainer} ${getCount(count)}`}>
              <div className={styles.userVideo}>
                <video ref={localVideoRef} autoPlay muted></video>
                <Typography className={styles.youLabel}>you</Typography>
              </div>
              {videos.map(({ socketId, username, stream, role }) => (
                <div key={socketId} className={styles.userDisplay}>
                  <video
                    ref={(ref) => ref && (ref.srcObject = stream)}
                    autoPlay
                    playsInline
                  />
                  <div>
                    <Typography className={styles.userLabel}>
                      {username}
                    </Typography>
                    {role === "host" && (
                      <span style={{ color: "gold", position: "absolute" }}>
                        ⭐ Host
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {showChat ? (
              <div className={styles.chatBox}>
                <h2
                  style={{
                    fontFamily: "Josefin Sans",
                    color: "#4035351",
                    fontSize: "2rem",
                    marginTop: "1rem",
                    marginBottom: "0",
                  }}
                >
                  Chat
                </h2>
                <div className={styles.showChats}>
                  {messages.length > 0 ? (
                    messages.map((msg, index) => {
                      return (
                        <>
                          {msg.sender === username ? (
                            <div key={index} className={styles.sentChat}>
                              <p style={{ fontWeight: "bolder" }}>YOU</p>
                              <p>{msg.data}</p>
                            </div>
                          ) : (
                            <div key={index} className={styles.receivedChat}>
                              <p style={{ fontWeight: "bolder" }}>
                                {msg.sender.toUpperCase()}
                              </p>
                              <p>{msg.data}</p>
                            </div>
                          )}
                          <div ref={bottomRef}></div>
                        </>
                      );
                    })
                  ) : (
                    <>
                      <p>No messages yet!</p>
                    </>
                  )}
                </div>
                <div className={styles.chatMessage}>
                  <TextField
                    sx={{
                      backgroundColor: "#1e1e1e",
                      borderRadius: "8px",
                      input: {
                        color: "#ffffff", 
                      },
                      label: {
                        color: "#ffffff", 
                      },
                      "&:hover": {
                        backgroundColor: "#121212", 
                      },
                      "& label.Mui-focused": {
                        color: "#ffffff",
                      },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#ffffff",
                        },
                        "&:hover fieldset": {
                          borderColor: "#ffffff",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#ffffff",
                        },
                      },
                    }}
                    fullWidth
                    value={message}
                    label="Enter Message"
                    variant="outlined"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <div className={styles.chatIcons}>
                    <IconButton onClick={() => setShowEmoji(!showEmoji)}>
                      <MoodOutlinedIcon
                        style={{ color: "white", fontSize: "2rem" }}
                      />
                    </IconButton>
                    {showEmoji && (
                      <div className={styles.emojiContainer}>
                        <EmojiPicker
                          style={{ height: "50vh" }}
                          onEmojiClick={(emojiData) =>
                            setMessage((prev) => prev + emojiData.emoji)
                          }
                        />
                      </div>
                    )}
                    <SendRoundedIcon
                      sx={{
                        fontSize: "2rem",
                        "&:hover": {
                          opacity: "0.5",
                          cursor: "pointer",
                        },
                      }}
                      onClick={sendMessage}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
            <div className={styles.Icons}>
              <IconButton onClick={handleMic} style={{ color: "white" }}>
                {audio === true ? (
                  <SettingsVoiceSharpIcon />
                ) : (
                  <MicOffOutlinedIcon />
                )}
              </IconButton>
              <IconButton onClick={handleVideo} style={{ color: "white" }}>
                {video === true ? (
                  <VideocamOutlinedIcon />
                ) : (
                  <VideocamOffOutlinedIcon />
                )}
              </IconButton>
              <IconButton
                onClick={handleScreenShare}
                style={{ color: "white" }}
              >
                {screen === true ? (
                  <StopScreenShareTwoToneIcon />
                ) : (
                  <ScreenShareTwoToneIcon />
                )}
              </IconButton>
              <IconButton onClick={handleCallEnd} style={{ color: "red" }}>
                <CallEndOutlinedIcon />{" "}
              </IconButton>
              <Badge
                color="secondary"
                onClick={() => setShowChat(!showChat)}
                badgeContent={newMessages}
                max={999}
                sx={{
                  "&:hover": {
                    opacity: "0.5",
                    cursor: "pointer",
                  },
                }}
              >
                {" "}
                {showChat ? (
                  <ForumOutlinedIcon style={{ color: "white" }} />
                ) : (
                  <ForumIcon style={{ color: "white" }} />
                )}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
