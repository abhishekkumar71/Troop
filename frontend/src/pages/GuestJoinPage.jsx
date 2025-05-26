import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Card, CardContent, CardActions } from "@mui/material";
import { useSnackbar } from "notistack";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import styles from "../styles/guest.module.css";
import { Link } from "react-router-dom";
import Footer from "./Footer";
import "../styles/App.css";
export default function GuestJoinPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [meetingCode, setMeetingCode] = useState("");
  const [menu, setMenu] = useState(false);
  const [toggle, setToggle] = useState(false);
  const handleSuccess = (msg) => enqueueSnackbar(msg, { variant: "success" });
  const handleFailure = (msg) => enqueueSnackbar(msg, { variant: "error" });
  const handleToggle = () => {
    setToggle((prev) => !prev);
  };
  const handleJoinMeeting = async () => {
    if (!meetingCode || meetingCode.trim().length !== 6) {
      handleFailure("Please enter a valid 6-character meeting code.");
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:8080/joinMeeting", {
        meeting_code: meetingCode,
      });

      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        navigate(`/${meetingCode}`, {
          state: { isHost: false, isGuest: true },
        });
      } else {
        handleFailure(message);
      }
    } catch (e) {
      console.error(e);
      handleFailure("Something went wrong! Please try again.");
    }
  };
  const handleClick=()=>{
    navigate("/");
  }
  useEffect(() => {
    const handleResize = () => {
      setMenu(window.innerWidth <= 768);
      if (window.innerWidth > 768) setToggle(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <>
      <div className={styles.guestJoinContainer}>
        <nav className={styles.nav}>
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
          {menu ? (
            <>
              <IconButton
                onClick={handleToggle}
                style={{ marginRight: "3rem" }}
              >
                <MenuOutlinedIcon
                  style={{ fontSize: "3rem", color: "whitesmoke" }}
                />
              </IconButton>
              {toggle ? (
                <div className={styles.navLinks}>
                  <Link to="/auth">Register</Link>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <div className={styles.navLinks}>
              <Link to="/auth">Register</Link>
            </div>
          )}
        </nav>
        <div className={styles.joinBlock}>
          <Card className={styles.guestJoinCard}>
            <CardContent style={{ display: "flex", flexDirection: "column" }}>
              <h2 style={{fontSize:"1.8rem"}}>Join Meeting as Guest</h2>
              <p style={{fontSize:"1.2rem"}}>Enter the <b>6-character</b> meeting code to join a meeting.</p>
              <TextField
                label="Meeting Code"
                variant="outlined"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                error={meetingCode.length > 0 && meetingCode.length !== 6}
                helperText={
                  meetingCode.length > 0 && meetingCode.length !== 6
                    ? "Meeting code must be exactly 6 characters"
                    : "Meeting code consists of letters and numbers"
                }
              />
            </CardContent>
            <CardActions style={{ justifyContent: "center" }}>
              <Button variant="contained" onClick={handleJoinMeeting}>
                Join Meeting
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                startIcon={<KeyboardDoubleArrowLeftIcon />}
              >
                Back to Home
              </Button>
            </CardActions>
          </Card>
        </div>      <Footer />

      </div>
    </>
  );
}
