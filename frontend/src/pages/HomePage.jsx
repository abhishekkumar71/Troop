import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import withAuth from "../utils/withAuth";
import styles from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";
import HistorySharpIcon from "@mui/icons-material/HistorySharp";
import { useSnackbar } from "notistack";
import { Card, CardContent, CardActions } from "@mui/material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import Footer from "./Footer";
import "../styles/App.css";
function HomePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [step, setStep] = useState("welcome");
  const [meetingCode, setMeetingCode] = useState("");

  const handleSuccess = (message) => {
    enqueueSnackbar(message, {
      variant: "success",
    });
  };
  const handleFailure = (message) => {
    enqueueSnackbar(message, { variant: "error" });
  };
  const handleJoinMeeting = async () => {
    if (!meetingCode || meetingCode.length !== 6) {
      handleFailure("Please enter a valid meeting code.");
      return;
    }
    try {
      const { data } = await axios.post("http://localhost:8080/joinMeeting", {
        meeting_code: meetingCode,
      });
      const { success, message } = data;
      if (success) {
        await addToHistory(meetingCode);
        handleSuccess(message);
        navigate(`/${meetingCode}`, {
          state: { isHost: false, isGuest: false },
        });
      } else {
        handleFailure(message);
        console.log(message);
      }
    } catch (e) {
      console.log(e);
      handleFailure("Something went Wrong!");
    }
  };
  const handleCreateMeeting = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:8080/createMeeting",
        {},
        {
          params: { token: localStorage.getItem("token") },
        }
      );
      const { success, code, message } = data;
      if (success) {
        await addToHistory(code);
        navigate(`/${code}`, { state: { isHost: true, isGuest: false } });
        handleSuccess(message);
      } else {
        handleFailure(message);
      }
    } catch (e) {
      console.log(e);
      handleFailure("Something went Wrong!");
    }
  };
  const addToHistory = async (meetingCode) => {
    try {
      let request = await axios.post("http://localhost:8080/addToActivity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return request;
    } catch (e) {
      console.error(`something went wrong ${e}`);
    }
  };
const handleClick=()=>{
  navigate("/");
}
  return (
    <>
      <div className={styles.homeContainer}>
        <div className={styles.navBar}>
          <div className={styles.navHeader} onClick={handleClick}>
            <img
              src="/Logo.png"
              style={{ height: "3rem", width: "3rem", borderRadius: "10px" }}
            />
            <h2
              style={{
                fontFamily: "Audiowide",
                color: "white",
                fontSize: "2rem",
              }} 
            >
              Troop
            </h2>
          </div>
          <div className={styles.buttons}>
            <Button
              onClick={() => {
                navigate("/history");
              }}
            >
              <HistorySharpIcon />
              history
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              logout
            </Button>
          </div>
        </div>
        <div className={styles.joinMeet}>
          {step === "welcome" && (
            <Card className={styles.welcomeCard}>
              <CardContent>
                <h2 style={{fontSize:"2rem"}}>Welcome to your Meeting! 🫶</h2>
                <p style={{fontSize:"1.2rem"}}>Would you like to start a <b>new meeting</b> or <b>join</b> one?</p>
              </CardContent>
              <CardActions style={{ justifyContent: "center" }}>
                <Button variant="contained" onClick={handleCreateMeeting}>
                  Create
                </Button>
                <Button variant="outlined" onClick={() => setStep("join")}>
                  Join
                </Button>
              </CardActions>
            </Card>
          )}

          {step === "join" && (
            <div className={styles.joinBlock}>
              <Card className={styles.welcomeCard}>
                <CardContent
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <h2>
                    <b>Note:</b>
                  </h2>
                  <p>
                    Meeting code consists of <b>6 characters</b> (letters and numbers)
                  </p>
                  <p>example: ert43x</p>
                  <TextField
                    required
                    label="Enter Meeting Code"
                    variant="outlined"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    error={meetingCode.length > 0 && meetingCode.length !== 6}
                    helperText={
                      meetingCode.length > 0 && meetingCode.length !== 6
                        ? "Meeting code must be exactly 6 characters"
                        : "Meeting code consists of 6 characters "
                    }
                  />
                </CardContent>
                <CardActions style={{ justifyContent: "center" }}>
                  <Button variant="contained" onClick={handleJoinMeeting}>
                    Join Meeting
                  </Button>
                  <Button variant="outlined" onClick={() => setStep("welcome")}>
                    <KeyboardDoubleArrowLeftIcon />
                    Back
                  </Button>
                </CardActions>
              </Card>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}

export default withAuth(HomePage);
