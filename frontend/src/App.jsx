import "../src/styles/App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Authentication from "./pages/Auth";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HistoryPage from "./pages/HistoryPage";
import VideoConference from "./pages/VideoConference";
import HomePage from "./pages/HomePage";
import GuestJoinPage from "./pages/GuestJoinPage";
function App() {
  return (
    <>
      <BrowserRouter>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          action={(snackbarId) => (
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={() => closeSnackbar(snackbarId)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/:meetingCode" element={<VideoConference />} />
            <Route path="/guest" element={<GuestJoinPage />} />{" "}
            <Route path="/home" element={<HomePage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </SnackbarProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
