import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Typography } from "@mui/material";

const API_URL = "https://advestor-dtl-96958b770deb.herokuapp.com/api";

export default function LoginScreen({ setUser }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("username", form.username);
      params.append("password", form.password);

      const { data } = await axios.post(`${API_URL}/users/token`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      sessionStorage.setItem("token", data.access_token);

      const userRes = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      setUser(userRes.data);
    } catch (err) {
      setError("Ошибка входа. Проверьте логин и пароль.");
    }
    setLoading(false);
  };

  return (
    <Box p={2} maxWidth={400} mx="auto">
      <Typography variant="h6" mb={2}>Вход</Typography>
      <form onSubmit={handleLogin}>
        <TextField
          label="Имя пользователя"
          name="username"
          value={form.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </Box>
  );
} 