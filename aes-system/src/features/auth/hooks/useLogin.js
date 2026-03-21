//this is where the app connect to the dtabase and handle the login logic
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmitClick = async (e) => {
    e.preventDefault();
        if (!identifier || !password) {
            setToast({ type: "error", msg: "Please fill in all fields." });
            return;
        }

        setLoading(true);
        setToast(null);

        try {
            await authService.login({ identifier, password });
            setToast({ type: "success", msg: "Logged in successfully! Redirecting…" });
        } catch (err) {
            setToast({ type: "error", msg: err.message || "Login failed. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    return {
        identifier, setIdentifier,
        password, setPassword,
        showPass, setShowPass,
        remember, setRemember,
        loading,
        toast,
        handleSubmit,
    };
}


