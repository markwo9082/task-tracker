import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { getProfile } from '../store/authSlice';
import { fetchWorkspaces } from '../store/workspaceSlice';
import { fetchBoards } from '../store/boardSlice';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector(
    (state) => state.auth
  );
  const { workspaces } = useAppSelector((state) => state.workspace);
  const { boards } = useAppSelector((state) => state.board);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!user) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWorkspaces());
      dispatch(fetchBoards(undefined));
    }
  }, [isAuthenticated, dispatch]);

  if (authLoading || !user) {
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
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {user.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your workspace
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WorkspacesIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{workspaces.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Workspaces
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DashboardIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{boards.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Boards
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AssignmentIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {boards.reduce(
                      (acc, board) =>
                        acc +
                        (board.lanes?.reduce(
                          (laneAcc, lane) => laneAcc + (lane.tasks?.length || 0),
                          0
                        ) || 0),
                      0
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<WorkspacesIcon />}
            onClick={() => navigate('/workspaces')}
          >
            View Workspaces
          </Button>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => {
              if (boards.length > 0) {
                navigate(`/boards/${boards[0].id}`);
              } else {
                navigate('/workspaces');
              }
            }}
          >
            {boards.length > 0 ? 'Go to Recent Board' : 'Create a Board'}
          </Button>
        </Box>
      </Paper>

      {workspaces.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Get Started
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            You don't have any workspaces yet. Create your first workspace to start
            managing tasks!
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<WorkspacesIcon />}
            onClick={() => navigate('/workspaces')}
          >
            Create Your First Workspace
          </Button>
        </Paper>
      )}
    </Box>
  );
}
