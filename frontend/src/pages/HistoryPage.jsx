import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { IconButton } from "@mui/material";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import styles from "../styles/History.module.css";
import Button from "@mui/material/Button";
import Footer from "./Footer";
export default function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const getHistory = async () => {
    try {
      let request = await axios.get("https://troop-c7o5.onrender.com/getActivity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (e) {
      console.error(`something went wrong ${e}`);
    }
  };

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  useEffect(() => {
    const data = async () => {
      try {
        const history = await getHistory();
        console.log(history);
        setMeetings(history);
      } catch (e) {
        enqueueSnackbar(e, { variant: "error" });
      }
    };
    data();
  }, []);
  return (
    <>
      <div className={styles.historyContainer}>
        <div className={styles.navBar}>
          <div className={styles.navHeader}>
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
            <IconButton
              onClick={() => {
                navigate("/home");
              }}
            >
              <HomeRoundedIcon />
            </IconButton>
            <Button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
              }}
            >
              logout
            </Button>
          </div>
        </div>{" "}
        <>
          {meetings.length !== 0 ? (
            <>
              {meetings.map((e, i) => {
                return (
                  <Card
                    key={i}
                    sx={{
                      width: "70vw",
                      background: "linear-gradient(to right, #525252, #3d72b4)",
                      fontWeight: 900,
                      margin: "1rem",
                      "&:hover": {
                        boxShadow: "2px 2px 10px white",
                        cursor: "pointer",
                      },
                    }}
                  >
                    <CardContent>
                      <Typography
                        gutterBottom
                        sx={{ color: "black", fontWeight: 600 }}
                      >
                        <b>Meeting Code: </b>
                        {e.meeting_code}
                      </Typography>
                      <Typography variant="h5" component="div"></Typography>
                      <Typography sx={{ color: "black", mb: 1.5 }}>
                        <b>Date:</b> {formatDate(e.date)}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          ) : (
            <> <h2 style={{color:"whitesmoke"}}>No Meetings attended </h2></>
          )}
        </>
      </div><Footer/>
    </>
    
  );
}
