import React from "react";
import "../styles/App.css";
export default function Footer() {
  return (
    <footer className="footer">
      <h5>&copy;All rights reserved</h5>
      <div className="iconLinks">
        <a href="https://github.com/abhishekkumar71">
          <i className="fa-brands fa-github"></i>
        </a>
        <a href="https://www.linkedin.com/in/abhishek-kumar5471">
          <i className="fa-brands fa-linkedin"></i>
        </a>
        <a href="https://www.blogger.com/profile/11390721205359469828">
          <i className="fa-brands fa-blogger"></i>
        </a>
      </div>
    </footer>
  );
}
