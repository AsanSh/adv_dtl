import React, { useState } from "react";
import axios from "axios";
import { Box, Button, TextField, Select, MenuItem, Typography } from "@mui/material";

const API_URL = "https://advestor-dtl-96958b770deb.herokuapp.com/api";

export default function RegistrationScreen({ setUser }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    role: "",
    orgName: "",
    inviteCode: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOrg, setCreateOrg] = useState(true);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError("");
    if (form.password !== form.repeatPassword) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      // Формируем payload
      const payload = {
        ...form,
        organization: form.role !== "client" ? (createOrg ? { name: form.orgName } : { invite_code: form.inviteCode }) : undefined
      };
      // 1. Регистрация пользователя
      await axios.post(`${API_URL}/users/register`, payload);
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
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Ошибка регистрации или логина. Проверьте данные.");
      }
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
        <TextField
          label="Повтор пароля"
          name="repeatPassword"
          type="password"
          value={form.repeatPassword}
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
          <MenuItem value="client">Клиент</MenuItem>
          <MenuItem value="supplier">Поставщик</MenuItem>
        </Select>
        {form.role && form.role !== "client" && (
          <Box mt={2}>
            <Button
              variant={createOrg ? "contained" : "outlined"}
              onClick={() => setCreateOrg(true)}
              sx={{ mr: 1 }}
            >Создать организацию</Button>
            <Button
              variant={!createOrg ? "contained" : "outlined"}
              onClick={() => setCreateOrg(false)}
            >Присоединиться по коду</Button>
            {createOrg ? (
              <TextField
                label="Название организации"
                name="orgName"
                value={form.orgName}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
            ) : (
              <TextField
                label="Код приглашения"
                name="inviteCode"
                value={form.inviteCode}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
            )}
          </Box>
        )}
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