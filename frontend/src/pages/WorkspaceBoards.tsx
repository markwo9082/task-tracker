import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  fetchBoards,
  createBoard,
  deleteBoard,
  clearError,
} from '../store/boardSlice';
import { fetchWorkspace } from '../store/workspaceSlice';

export default function WorkspaceBoards() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { boards, isLoading, error } = useAppSelector((state) => state.board);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createDefaultLanes, setCreateDefaultLanes] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchWorkspace(workspaceId));
      dispatch(fetchBoards(workspaceId));
    }
  }, [workspaceId, dispatch]);

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
    setCreateDefaultLanes(true);
  };

  const handleClose = () => {
    setOpen(false);
    setName('');
    setDescription('');
  };

  const handleCreate = async () => {
    if (name.trim() && workspaceId) {
      await dispatch(
        createBoard({
          workspaceId,
          name,
          description,
          createDefaultLanes,
        })
      );
      handleClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board?')) {
      await dispatch(deleteBoard(id));
    }
  };

  const handleBoardClick = (id: string) => {
    navigate(`/boards/${id}`);
  };

  if (isLoading && !currentWorkspace) {
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
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigate('/workspaces')}
          sx={{ cursor: 'pointer' }}
        >
          Workspaces
        </Link>
        <Typography color="text.primary">
          {currentWorkspace?.name || 'Loading...'}
        </Typography>
      </Breadcrumbs>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Boards
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
          Create Board
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {boards.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="40vh"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No boards yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Create your first board to start managing tasks
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen}>
            Create Board
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {boards.map((board) => (
            <Grid item xs={12} sm={6} md={4} key={board.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleBoardClick(board.id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {board.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {board.description || 'No description'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDelete(board.id, e)}
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
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            type="text"
            fullWidth
            variant="outlined"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
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
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={createDefaultLanes}
                onChange={(e) => setCreateDefaultLanes(e.target.checked)}
              />
            }
            label="Create default lanes (To Do, In Progress, Review, Done)"
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
