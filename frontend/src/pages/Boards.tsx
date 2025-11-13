import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  AppBar,
  Toolbar,
  IconButton,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout } from '../store/authSlice';
import { fetchBoards, createBoard, setCurrentBoard } from '../store/boardSlice';

export default function Boards() {
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentWorkspace } = useAppSelector((state) => state.workspace);
  const { boards, isLoading } = useAppSelector((state) => state.board);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [createDefaultLanes, setCreateDefaultLanes] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      dispatch(fetchBoards(workspaceId));
    }
  }, [workspaceId, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/workspaces');
  };

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    setNewBoardName('');
    setNewBoardDescription('');
    setCreateDefaultLanes(true);
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !workspaceId) return;

    const result = await dispatch(
      createBoard({
        workspaceId,
        name: newBoardName,
        description: newBoardDescription || undefined,
        createDefaultLanes,
      })
    );

    handleCloseCreateDialog();

    // Navigate to the new board if creation was successful
    if (result.type === 'board/create/fulfilled') {
      const board = result.payload as any;
      navigate(`/workspaces/${workspaceId}/boards/${board.id}`);
    }
  };

  const handleSelectBoard = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId);
    if (board) {
      dispatch(setCurrentBoard(board));
      navigate(`/workspaces/${workspaceId}/boards/${boardId}`);
    }
  };

  if (isLoading && boards.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={handleBack} edge="start" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Tracker
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            onClick={handleBack}
            sx={{ cursor: 'pointer' }}
          >
            Workspaces
          </Link>
          <Typography color="text.primary">
            {currentWorkspace?.name || 'Boards'}
          </Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1">
            Boards
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
            Create Board
          </Button>
        </Box>

        {boards.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No boards yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first board to start managing tasks
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateDialog}>
              Create Board
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {boards.map((board) => (
              <Grid item xs={12} sm={6} md={4} key={board.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleSelectBoard(board.id)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {board.name}
                    </Typography>
                    {board.description && (
                      <Typography variant="body2" color="text.secondary">
                        {board.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleSelectBoard(board.id)}>
                      Open
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create Board Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Board</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Board Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newBoardDescription}
            onChange={(e) => setNewBoardDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={createDefaultLanes}
                onChange={(e) => setCreateDefaultLanes(e.target.checked)}
              />
            }
            label="Create default lanes (To Do, In Progress, Review, Done)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreateBoard} variant="contained" disabled={!newBoardName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
