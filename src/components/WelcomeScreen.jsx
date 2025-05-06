import React, { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import RegistrationScreen from "./RegistrationScreen";
import LoginScreen from "./LoginScreen";

export default function WelcomeScreen({ setUser }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: "auto", mt: 8, textAlign: "center" }}>
      <Typography variant="h4" mb={2}>Добро пожаловать в DTL Logistics Platform!</Typography>
      <Typography variant="body1" mb={3}>
        Войдите или зарегистрируйтесь, чтобы начать работу.
      </Typography>
      <Box mb={3}>
        <Button
          variant={showLogin ? "outlined" : "contained"}
          onClick={() => setShowLogin(false)}
          sx={{ mr: 2 }}
        >Регистрация</Button>
        <Button
          variant={showLogin ? "contained" : "outlined"}
          onClick={() => setShowLogin(true)}
        >Войти</Button>
      </Box>
      {showLogin
        ? <LoginScreen setUser={setUser} />
        : <RegistrationScreen setUser={setUser} />}
    </Paper>
  );
} 