import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();
    const token = localStorage.getItem("token");
    const isValid = (token) => {
      try {
        const { exp } = jwtDecode(token);
        return Date.now() < exp * 1000;
      } catch (e) {
        console.log(e);
      }
    };
    const isAuthenticated = () => {
      if (token && isValid(token)) {
        return true;
      }
      return false;
    };
    useEffect(() => {
      if (!isAuthenticated()) {
        router("/auth");
      }
    }, []);
    return <WrappedComponent {...props} />;
  };
  return AuthComponent;
};
export default withAuth;
