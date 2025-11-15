import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchWorkspaces,
  createWorkspace,
  deleteWorkspace,
  clearError,
} from '../store/workspaceSlice';

export default function Workspaces() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { workspaces, isLoading, error } = useAppSelector(
    (state) => state.workspace
  );
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    dispatch(fetchWorkspaces());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpen = () => {
    setOpen(true);
    setName('');
    setDescription('');
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setDescription('');
  };

  const handleCreate = async () => {
    if (name.trim()) {
      await dispatch(createWorkspace({ name, description }));
      handleClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      await dispatch(deleteWorkspace(id));
    }
  };

  const handleWorkspaceClick = (id: string) => {
    navigate(`/workspaces/${id}/boards`);
  };

  if (isLoading && workspaces.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          My Workspaces
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Create Workspace
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {workspaces.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="40vh"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workspaces yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first workspace to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Create Workspace
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {workspaces.map((workspace) => (
            <Grid item xs={12} sm={6} md={4} key={workspace.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleWorkspaceClick(workspace.id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {workspace.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workspace.description || 'No description'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDelete(workspace.id, e)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Workspace</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Workspace Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!name.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
