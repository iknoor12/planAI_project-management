import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiFolder, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getProjects, createProject, deleteProject } from '../api/projectApi';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const project = await createProject(newProject);
      setProjects([project, ...projects]);
      setNewProject({ name: '', description: '', color: '#3b82f6' });
      setShowCreateModal(false);
    } catch (error) {
      alert('Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p._id !== projectId));
    } catch (error) {
      alert('Failed to delete project');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🎯 PlanAI</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <FiLogOut /> Logout
        </button>
      </header>

      <div className="dashboard-content">
        <div className="projects-header">
          <h2>Your Projects</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <FiPlus /> New Project
          </button>
        </div>

        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project._id}
              className="project-card"
              style={{ borderTopColor: project.color }}
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <div className="project-icon" style={{ backgroundColor: project.color }}>
                <FiFolder />
              </div>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="project-meta">
                <span>{project.members?.length || 0} members</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(project._id);
                }}
                className="btn-delete-small"
              >
                Delete
              </button>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="empty-state">
              <FiFolder size={64} />
              <h3>No projects yet</h3>
              <p>Create your first project to get started</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                  required
                  placeholder="Enter project name"
                />
              </div>

              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject({ ...newProject, description: e.target.value })
                  }
                  placeholder="Enter project description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(
                    (color) => (
                      <div
                        key={color}
                        className={`color-option ${
                          newProject.color === color ? 'selected' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewProject({ ...newProject, color })}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
