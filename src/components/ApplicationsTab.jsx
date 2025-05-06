import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = "https://advestor-dtl-96958b770deb.herokuapp.com/api";

export default function ApplicationsTab({ user }) {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [newApp, setNewApp] = useState({ description: "", address: "", date: "" });
  const [creating, setCreating] = useState(false);
  const [viewApp, setViewApp] = useState(null);
  const [editApp, setEditApp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreate = ["admin", "logist", "client", "supplier"].includes(user?.role);
  const canEdit = ["admin", "logist"].includes(user?.role);
  const canDelete = canEdit;

  useEffect(() => {
    if (!user) return;
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: status ? { status } : {}
        });
        setApplications(data);
      } catch (err) {
        setError("Ошибка загрузки заявок");
      }
      setLoading(false);
    };
    fetchApplications();
  }, [status, user]);

  const handleNewAppChange = e => {
    setNewApp(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${API_URL}/applications`, newApp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpen(false);
      setNewApp({ description: "", address: "", date: "" });
      setStatus("");
    } catch (err) {
      alert("Ошибка создания заявки");
    }
    setCreating(false);
  };

  const handleView = app => setViewApp(app);
  const handleEdit = app => setEditApp({ ...app });
  const handleEditChange = e => setEditApp(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSaveEdit = async () => {
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${API_URL}/applications/${editApp.id}`, editApp, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditApp(null);
      setStatus("");
    } catch (err) {
      alert("Ошибка при сохранении изменений");
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${API_URL}/applications/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteId(null);
      setStatus("");
    } catch (err) {
      alert("Ошибка при удалении заявки");
    }
    setActionLoading(false);
  };

  if (!user) return null;

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>Заявки</Typography>
      {canCreate && (
        <Button variant="contained" sx={{ mb: 2 }} onClick={() => setOpen(true)}>
          Создать заявку
        </Button>
      )}
      <Box mb={2}>
        <Select
          value={status}
          onChange={e => setStatus(e.target.value)}
          displayEmpty
        >
          <MenuItem value="">Все статусы</MenuItem>
          <MenuItem value="open">Открытые</MenuItem>
          <MenuItem value="in_progress">В работе</MenuItem>
          <MenuItem value="closed">Закрытые</MenuItem>
        </Select>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Создать заявку</DialogTitle>
        <DialogContent>
          <TextField
            label="Описание"
            name="description"
            value={newApp.description}
            onChange={handleNewAppChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Адрес"
            name="address"
            value={newApp.address}
            onChange={handleNewAppChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Дата"
            name="date"
            type="datetime-local"
            value={newApp.date}
            onChange={handleNewAppChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleCreate} disabled={creating} variant="contained">
            {creating ? "Создание..." : "Создать"}
          </Button>
        </DialogActions>
      </Dialog>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Клиент</TableCell>
                <TableCell>Водитель</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map(app => (
                <TableRow key={app.id}>
                  <TableCell>{app.id}</TableCell>
                  <TableCell>{app.status}</TableCell>
                  <TableCell>{app.client_name || "-"}</TableCell>
                  <TableCell>{app.driver_name || "-"}</TableCell>
                  <TableCell>{app.created_at ? new Date(app.created_at).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleView(app)}><VisibilityIcon /></IconButton>
                    {canEdit && <IconButton onClick={() => handleEdit(app)}><EditIcon /></IconButton>}
                    {canDelete && <IconButton onClick={() => setDeleteId(app.id)}><DeleteIcon /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Просмотр заявки */}
      <Dialog open={!!viewApp} onClose={() => setViewApp(null)}>
        <DialogTitle>Просмотр заявки</DialogTitle>
        <DialogContent>
          {viewApp && (
            <Box>
              <Typography><b>ID:</b> {viewApp.id}</Typography>
              <Typography><b>Описание:</b> {viewApp.description}</Typography>
              <Typography><b>Адрес:</b> {viewApp.address}</Typography>
              <Typography><b>Дата:</b> {viewApp.date}</Typography>
              <Typography><b>Статус:</b> {viewApp.status}</Typography>
              <Typography><b>Клиент:</b> {viewApp.client_name || "-"}</Typography>
              <Typography><b>Водитель:</b> {viewApp.driver_name || "-"}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewApp(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
      {/* Редактирование заявки */}
      <Dialog open={!!editApp} onClose={() => setEditApp(null)}>
        <DialogTitle>Редактировать заявку</DialogTitle>
        <DialogContent>
          {editApp && (
            <Box>
              <TextField
                label="Описание"
                name="description"
                value={editApp.description}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Адрес"
                name="address"
                value={editApp.address}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Дата"
                name="date"
                type="datetime-local"
                value={editApp.date}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Статус"
                name="status"
                value={editApp.status}
                onChange={handleEditChange}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditApp(null)}>Отмена</Button>
          <Button onClick={handleSaveEdit} disabled={actionLoading} variant="contained">
            {actionLoading ? "Сохранение..." : "Сохранить"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Удаление заявки */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Удалить заявку?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Отмена</Button>
          <Button onClick={handleDelete} color="error" disabled={actionLoading} variant="contained">
            {actionLoading ? "Удаление..." : "Удалить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 