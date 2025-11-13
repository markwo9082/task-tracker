import { Card, CardContent, Typography, Box, Chip, Avatar, AvatarGroup } from '@mui/material';
import {
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  CheckCircleOutline as SubtaskIcon,
} from '@mui/icons-material';
import { Task, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  CRITICAL: '#d32f2f',
  HIGH: '#f57c00',
  MEDIUM: '#fbc02d',
  LOW: '#388e3c',
};

export default function TaskCard({ task, onClick }: TaskCardProps) {
  const completedSubtasks = task.subtasks?.filter((st) => st.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 4,
        },
      }}
      onClick={() => onClick(task)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Priority indicator */}
        {task.priority && (
          <Box display="flex" alignItems="center" mb={1}>
            <FlagIcon
              sx={{
                fontSize: 16,
                color: priorityColors[task.priority],
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: priorityColors[task.priority], fontWeight: 'bold' }}
            >
              {task.priority}
            </Typography>
          </Box>
        )}

        {/* Task title */}
        <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
          {task.title}
        </Typography>

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
            {task.labels.map((taskLabel) => (
              <Chip
                key={taskLabel.labelId}
                label={taskLabel.label?.name}
                size="small"
                sx={{
                  bgcolor: taskLabel.label?.color || '#ccc',
                  color: '#fff',
                  height: 20,
                  fontSize: '0.7rem',
                }}
              />
            ))}
          </Box>
        )}

        {/* Task metadata */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            {/* Due date */}
            {task.dueDate && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(task.dueDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {/* Comments count */}
            {task.comments && task.comments.length > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <CommentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {task.comments.length}
                </Typography>
              </Box>
            )}

            {/* Subtasks progress */}
            {totalSubtasks > 0 && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <SubtaskIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {completedSubtasks}/{totalSubtasks}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 12 } }}>
              {task.assignees.map((assignee) => (
                <Avatar
                  key={assignee.userId}
                  alt={assignee.user?.name}
                  src={assignee.user?.avatarUrl}
                  sx={{ width: 24, height: 24 }}
                >
                  {assignee.user?.name.charAt(0).toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
