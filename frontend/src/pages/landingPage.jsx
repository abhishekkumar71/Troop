import React, { useEffect, useRef, useState } from "react";
import "../styles/App.css";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import AOS from "aos";
import "aos/dist/aos.css";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { IconButton } from "@mui/material";
import Footer from "./Footer";
export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    setToggle((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      setMenu(window.innerWidth <= 768);
      if (window.innerWidth > 768) setToggle(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: false,
    });
  }, []);
  return (
    <>
      <nav className="nav">
        <div className="navHeader">
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
                <Link to="/auth">Register</Link>
                <Link to="/auth">Login</Link>
              </div>
            ) : (
              <></>
            )}
          </>
        ) : (
          <div className="navLinks">
            <Link to="/guest">Join as Guest</Link>
            <Link to="/auth">Register</Link>
            <Link to="/auth">Login</Link>
          </div>
        )}
      </nav>

      <div className="scrollContainer">
       
        <section className="slide">
          <div className="hero" data-aos="zoom-in-up">
            <div
              className="text"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <h2
                style={{
                  fontFamily: "Audiowide",
                  color: "#5f5757",
                  fontSize: "3rem",
                }}
              >
                <b>Troop</b>
              </h2>
              <TypeAnimation
                style={{
                  fontFamily: "Dancing Script",
                  fontSize: "1.5rem",
                  marginLeft: "10rem",
                }}
                sequence={["- See 'N' Smile 😃", 100]}
                speed={30}
              />
              <p style={{ fontSize: "2rem" }}>Connect with your Loved ones!</p>
              <Link
                to="/auth"
                style={{ backgroundColor: "#9d6b0df2", borderRadius: "10px" }}
              >
                Get started
              </Link>
            </div>
            <div
              className="heroImg"
              data-aos="flip-up"
              data-aos-delay="300"
            >
              <img src="./landingPic1.jpg" style={{ height: "20rem" }} />
            </div>
          </div>
        </section>

        
        <section className="slide">
          <div className="working" data-aos="zoom-in-up">
            
            <div
              className="steps"
              style={{
                display: "flex",
                flexDirection: "column",
                width:"50vw",
                flexWrap: "wrap",
                alignContent: "flex-start",
                alignItems: "flex-start",
                fontSize: "1.2rem",
              }} data-aos="fade-up-left" data-aos-delay="300"
            >
             <h2 className="heading">How it works? 🤔</h2>
              <p>- Share your meeting code or room link</p>
              <p>- Allow Mic and Video access</p>
              <p>- That's it! You are Live</p>
              
            </div>
            <div
            className="workingImg"
            style={{display:"flex",justifyContent:"center"}}
              data-aos="flip-up"
              data-aos-delay="300"
            >
              <img src="./iconSymbol.jpg" style={{ height: "15rem" }} />
            </div>   
            </div>
        </section>
        <section className="slide">
          <div className="features" data-aos="zoom-in-up">
            <div className="lines" data-aos="fade-down-right">
               <h2 className="heading">Features </h2>
            <p>- Video and Audio Sharing</p>
            <p>- Screen Sharing</p>
            <p>- Live Chat</p>
              <Link
                to="/auth"
                style={{ backgroundColor: "#9d6b0df2", borderRadius: "10px" }}
              >
                Register
              </Link>
            </div>
           <div className="featuresImg" data-aos="flip-up" data-aos-delay="300">
            <img src="./features.jpg" style={{height:"18rem",width:"20rem"}}/>
           </div>
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
}
