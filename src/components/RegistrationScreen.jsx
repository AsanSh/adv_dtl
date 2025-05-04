import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Select, MenuItem, Typography } from "@mui/material";

const API_URL = "https://advestor-dtl-96958b770deb.herokuapp.com/api";

export default function RegistrationScreen({ setUser }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // 1. Регистрация пользователя
      await axios.post(`${API_URL}/users/register`, form);

      // 2. Логин (получение токена)
      const params = new URLSearchParams();
      params.append("username", form.username);
      params.append("password", form.password);

      const { data } = await axios.post(`${API_URL}/users/token`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });

      // 3. Сохраняем токен и обновляем состояние пользователя
      sessionStorage.setItem("token", data.access_token);

      // 4. Получаем данные пользователя
      const userRes = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` }
      });
      setUser(userRes.data);
    } catch (err) {
      setError("Ошибка регистрации или логина. Проверьте данные.");
    }
    setLoading(false);
  };

  return (
    <Box p={2} maxWidth={400} mx="auto">
      <Typography variant="h6" mb={2}>Регистрация</Typography>
      <form onSubmit={handleRegister}>
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
          label="Email"
          name="email"
          value={form.email}
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
        <Select
          name="role"
          value={form.role}
          onChange={handleChange}
          displayEmpty
          fullWidth
          required
        >
          <MenuItem value="">Выберите роль</MenuItem>
          <MenuItem value="admin">Админ</MenuItem>
          <MenuItem value="logist">Логист</MenuItem>
          <MenuItem value="driver">Водитель</MenuItem>
        </Select>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </Box>
  );
} 