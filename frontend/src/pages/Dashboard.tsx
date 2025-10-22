import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout, getProfile } from '../store/authSlice';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!user) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (isLoading || !user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Welcome, {user.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email: {user.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Role: {user.role}
            </Typography>
          </Box>

          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              🚧 Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The workspace and board management features are currently under development.
              Stay tuned for:
            </Typography>
            <Box component="ul" sx={{ mt: 2 }}>
              <li>
                <Typography variant="body2">Create and manage workspaces</Typography>
              </li>
              <li>
                <Typography variant="body2">Kanban boards with drag & drop</Typography>
              </li>
              <li>
                <Typography variant="body2">Task management and collaboration</Typography>
              </li>
              <li>
                <Typography variant="body2">Real-time updates</Typography>
              </li>
              <li>
                <Typography variant="body2">And much more...</Typography>
              </li>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
