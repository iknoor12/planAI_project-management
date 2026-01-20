import { useState } from 'react';
import { FiEdit2, FiTrash2, FiCalendar, FiUser, FiMoreVertical } from 'react-icons/fi';
import { format } from 'date-fns';
import '../styles/TaskCard.css';

/**
 * TaskCard Component
 * Displays individual task information with actions
 */
const TaskCard = ({ task, onEdit, onDelete, provided }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444',
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityLabel = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`task-card ${isOverdue ? 'overdue' : ''}`}
    >
      <div className="task-header">
        <h4>{task.title}</h4>
        <div className="task-menu">
          <button
            className="menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FiMoreVertical />
          </button>
          {showMenu && (
            <div className="task-menu-dropdown">
              <button onClick={() => { onEdit(task); setShowMenu(false); }}>
                <FiEdit2 /> Edit
              </button>
              <button onClick={() => { onDelete(task._id); setShowMenu(false); }} className="delete-btn">
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span
          className="task-priority"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {getPriorityLabel(task.priority)}
        </span>

        {task.dueDate && (
          <span className={`task-due-date ${isOverdue ? 'overdue-text' : ''}`}>
            <FiCalendar />
            {format(new Date(task.dueDate), 'MMM dd')}
          </span>
        )}

        {task.assignedTo && (
          <span className="task-assigned">
            <FiUser />
            {task.assignedTo.name}
          </span>
        )}
      </div>

      {task.subtasks && task.subtasks.length > 0 && (
        <div className="task-subtasks">
          <span className="subtasks-count">
            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
