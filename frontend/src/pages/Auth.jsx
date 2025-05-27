import React, { useState,useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { useSnackbar } from "notistack";
import Footer from "./Footer";
import styles from "../styles/Auth.module.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/App.css";
export default function Authentication() {
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [fullnameValidation, setFullnameValidation] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState(false);
  const [emailValidation, setEmailValidation] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(false);
  const [menu, setMenu] = useState(false);
  const [toggle, setToggle] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleSuccess = (message) => {
    enqueueSnackbar(message, {
      variant: "success",
    });
    navigate("/home");
  };
  const handleFailure = (message) => {
    enqueueSnackbar(message, { variant: "error" });
  };
  const handleSignupBtn = () => {
    setShowSignUp(true);
  };
  const handleSignInBtn = () => {
    setShowSignUp(false);
  };

  const handleToggleBtn = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmitSignup = async (event) => {
    event.preventDefault();
    const fieldValues = { fullname, email, username, password };
    const fieldSetters = {
      fullname: setFullnameValidation,
      username: setUsernameValidation,
      email: setEmailValidation,
      password: setPasswordValidation,
    };
    Object.keys(fieldValues).forEach((key) => {
      if (!fieldValues[key]) {
        fieldSetters[key](true);
      } else {
        fieldSetters[key](false);
      }
    });
    try {
      const { data } = await axios.post(
        "https://troop-c7o5.onrender.com/signup",
        {
          name: fullname,
          username: username,
          password: password,
          email: email,
        },
        { withCredentials: true }
      );

      console.log(data);
      const token = data.token;
      localStorage.setItem("token", token);
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
        console.log(message);
      } else {
        handleFailure(message);
        console.log(message);
      }
    } catch (e) {
      console.log(e);
      handleFailure("something went wrong please try again!!");
    }
  };

  const handleSubmitSignin = async (event) => {
    event.preventDefault();

    const fieldValues = { username, password };
    const fieldSetters = {
      username: setUsernameValidation,
      password: setPasswordValidation,
    };
    Object.keys(fieldValues).forEach((key) => {
      if (!fieldValues[key]) {
        fieldSetters[key](true);
      } else {
        fieldSetters[key](false);
      }
    });
    try {
      const { data } = await axios.post(
        "https://troop-c7o5.onrender.com/signin",
        {
          username: username,
          password: password,
        },
        { withCredentials: true }
      );

      const token = data.token;
      localStorage.setItem("token", token);
      const { success, message } = data;
      if (success) {
        handleSuccess(message);
      } else {
        handleFailure(message);
      }
    } catch (e) {
      console.log(e);
      handleFailure("something went wrong please try again!!");
    }
  };  
  const handleToggle = () => {
    setToggle((prev) => !prev);
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
    <nav className="nav">
        <div className="navHeader" onClick={handleClick}>
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
            <IconButton onClick={handleToggle} style={{ marginRight: "3rem" }}>
              <MenuOutlinedIcon
                style={{ fontSize: "3rem", color: "whitesmoke" }}
              />
            </IconButton>
            {toggle ? (
              <div className="navLinks">
                <Link to="/guest">Join as Guest</Link>
              
              </div>
            ) : (
              <></>
            )}
          </>
        ) : (
          <div className="navLinks" style={{justifyContent:"center"}}>
            <Link to="/guest">Join as Guest</Link>
       
          </div>
        )}
      </nav>
      <div className={styles.authContainer}>
        
        <video autoPlay muted loop playsInline className={styles.bgVideo}>
          <source src="bg.mp4" type="video/mp4" />
        </video>

        <Box className={styles.box}>
          <span className={styles.buttons}>
            <ButtonGroup variant="outlined" aria-label="Basic button group">
              <Button onClick={handleSignupBtn}>SIGN UP</Button>
              <Button onClick={handleSignInBtn}>SIGN IN</Button>
            </ButtonGroup>
          </span>
          {showSignUp ? (
            <form onSubmit={handleSubmitSignup} noValidate>
              <div className={styles.inputFields}>
                <TextField
                  className={styles.inputsRequired}
                  required
                  fullWidth
                  onChange={(event) => setFullname(event.target.value)}
                  id="outlined name"
                  label="Enter Your Full Name"
                  variant="outlined"
                  error={fullnameValidation}
                  helperText={fullnameValidation ? "Fill this field" : ""}
                />

                <TextField
                  className={styles.inputsRequired}
                  type="email"
                  id="outlined email"
                  label="Enter Your mail"
                  variant="outlined"
                  required
                  fullWidth
                  onChange={(event) => setEmail(event.target.value)}
                  error={emailValidation}
                  helperText={emailValidation ? "Fill this field" : ""}
                />
                <TextField
                  className={styles.inputsRequired}
                  id="outlined username"
                  label="Enter username"
                  variant="outlined"
                  required
                  fullWidth
                  onChange={(event) => setUsername(event.target.value)}
                  error={usernameValidation}
                  helperText={usernameValidation ? "Fill this field" : ""}
                />
                <TextField
                  className={styles.inputsRequired}
                  id="outlined password"
                  label="Enter password"
                  variant="outlined"
                  required
                  fullWidth
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleBtn}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  error={passwordValidation}
                  helperText={passwordValidation ? "Fill this field" : ""}
                />
              </div>
              <div className={styles.submitBtn}>
                <Button variant="contained" fullWidth type="submit">
                  Submit
                </Button>
              </div>

              <p style={{ color: "whitesmoke" }}>
                Already have an account click&nbsp;
                <a onClick={handleSignInBtn}>Sign In</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmitSignin} noValidate>
              <div className={styles.inputFields}>
                <TextField
                  noValidate
                  className={styles.inputsRequired}
                  id="outlined username"
                  label="Enter username"
                  variant="outlined"
                  required
                  fullWidth
                  onChange={(event) => setUsername(event.target.value)}
                  error={usernameValidation}
                  helperText={usernameValidation ? "Fill this field!" : ""}
                />
                <TextField
                  className={styles.inputsRequired}
                  id="outlined password"
                  label="Enter password"
                  variant="outlined"
                  required
                  fullWidth
                  onChange={(event) => setPassword(event.target.value)}
                  error={passwordValidation}
                  helperText={passwordValidation ? "Fil this field!" : ""}
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleBtn}
                          edge="end"
                          style={{ color: "white" }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className={styles.submitBtn}>
                <Button variant="contained" fullWidth type="submit">
                  Submit
                </Button>
              </div>
              <p style={{color:"whitesmoke"}}>
                Don't have an account?Click&nbsp;
                <a onClick={handleSignupBtn}>SignUp</a>
              </p>
            </form>
          )}
        </Box>
       
      </div> <Footer/>
    </>
  );
}
