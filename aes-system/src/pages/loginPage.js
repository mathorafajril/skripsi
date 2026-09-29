//to route to login page, and also to display the login form
import React from "react";
import { LoginForm } from "../features/auth";  

export function LoginPage() {
  return (
    <div>
      <LoginForm />
    </div>
  );
}

export default LoginPage;