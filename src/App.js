import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import './App.css';

function ApplicationsTab() {
  return <div>Заявки (реализуйте логику отображения заявок)</div>;
}
function ClosedTab() {
  return <div>Закрытые заявки (реализуйте логику отображения закрытых заявок)</div>;
}
function AnalyticsTab() {
  return <div>Аналитика (реализуйте аналитику и графики)</div>;
}
function ProfileTab() {
  return <div>Профиль (реализуйте профиль, заявки на вступление и сотрудников)</div>;
}
function RegistrationScreen() {
  return <div>Регистрация (реализуйте форму регистрации/вступления)</div>;
}

function App() {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(true); // Поставьте false для теста экрана регистрации

  if (!user) {
    return <RegistrationScreen setUser={setUser} />;
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
        <Tab label="Заявки" />
        <Tab label="Закрытые" />
        <Tab label="Аналитика" />
        <Tab label="Профиль" />
      </Tabs>
      {tab === 0 && <ApplicationsTab />}
      {tab === 1 && <ClosedTab />}
      {tab === 2 && <AnalyticsTab />}
      {tab === 3 && <ProfileTab />}
    </Box>
  );
}

export default App;
