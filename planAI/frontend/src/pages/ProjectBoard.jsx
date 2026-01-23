import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlus, FiArrowLeft, FiBarChart2, FiMessageSquare } from 'react-icons/fi';
import KanbanBoard from '../components/KanbanBoard';
import DashboardStats from '../components/DashboardStats';
import AIChat from '../components/AIChat';
import { getProjectById } from '../api/projectApi';
import { getTasksByProject, createTask, updateTask, deleteTask, getTaskStats } from '../api/taskApi';
import '../styles/ProjectBoard.css';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
  });

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectData, tasksData, statsData] = await Promise.all([
        getProjectById(projectId),
        getTasksByProject(projectId),
        getTaskStats(projectId),
      ]);
      setProject(projectData);
      setTasks(tasksData);
      setStats(statsData);
    } catch (error) {
      alert('Failed to load project');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const newTask = await createTask({
        ...taskForm,
        project: projectId,
      });
      setTasks([...tasks, newTask]);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
      setShowTaskModal(false);
      fetchProjectData();
    } catch (error) {
      alert('Failed to create task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateTask(editingTask._id, taskForm);
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
      setEditingTask(null);
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
      setShowTaskModal(false);
      fetchProjectData();
    } catch (error) {
      alert('Failed to update task');
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const updated = await updateTask(taskId, updates);
      setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
      fetchProjectData();
    } catch (error) {}
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter((t) => t._id !== taskId));
      fetchProjectData();
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      status: task.status,
    });
    setShowTaskModal(true);
  };

  const handleTasksGenerated = async (generatedTasks) => {
    try {
      const promises = generatedTasks.map((task) =>
        createTask({
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          project: projectId,
        })
      );
      const newTasks = await Promise.all(promises);
      setTasks([...tasks, ...newTasks]);
      fetchProjectData();
    } catch (error) {}
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  return (
    <div className="project-board">
      <header className="project-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowAIChat(!showAIChat)} className="btn-ai">
            <FiMessageSquare /> AI Assistant
          </button>
          <button onClick={() => {
            setEditingTask(null);
            setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo' });
            setShowTaskModal(true);
          }} className="btn-primary">
            <FiPlus /> New Task
          </button>
        </div>
      </header>

      <DashboardStats stats={stats} />

      <div className="board-container">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
        />

        {showAIChat && (
          <div className="ai-panel">
            <div className="ai-panel-header">
              <h3>AI Assistant</h3>
              <button onClick={() => setShowAIChat(false)}>×</button>
            </div>
            <AIChat
              projectContext={`Project: ${project.name}. ${project.description}`}
              onTasksGenerated={handleTasksGenerated}
            />
          </div>
        )}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  required
                  placeholder="Enter task title"
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Enter task description"
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, status: e.target.value })
                    }
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Due Date (optional)</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;
