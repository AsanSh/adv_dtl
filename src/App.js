import React, { useState, useEffect } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import './App.css';
import ProfileTab from "./components/ProfileTab";
import WelcomeScreen from "./components/WelcomeScreen";
import ApplicationsTab from "./components/ApplicationsTab";

function ClosedTab() {
  return <div>Закрытые заявки (реализуйте логику отображения закрытых заявок)</div>;
}
function AnalyticsTab() {
  return <div>Аналитика (реализуйте аналитику и графики)</div>;
}

function App() {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetch("https://advestor-dtl-96958b770deb.herokuapp.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  if (!user) {
    return <WelcomeScreen setUser={setUser} />;
  }

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
        <Tab label="Заявки" />
        <Tab label="Закрытые" />
        <Tab label="Аналитика" />
        <Tab label="Профиль" />
      </Tabs>
      {tab === 0 && <ApplicationsTab user={user} />}
      {tab === 1 && <ClosedTab />}
      {tab === 2 && <AnalyticsTab />}
      {tab === 3 && <ProfileTab user={user} setUser={setUser} />}
    </Box>
  );
}

export default App;
