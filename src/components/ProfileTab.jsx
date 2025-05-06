import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function ProfileTab({ user, setUser }) {
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>Профиль</Typography>
      <Typography variant="body1"><b>Email:</b> {user.email}</Typography>
      <Typography variant="body1"><b>Роль:</b> {user.role}</Typography>
      {user.organization && (
        <Typography variant="body1"><b>Организация:</b> {user.organization.name || user.organization}</Typography>
      )}
      <Button
        variant="outlined"
        color="error"
        sx={{ mt: 3 }}
        onClick={handleLogout}
        fullWidth
      >Выйти</Button>
    </Paper>
  );
} 