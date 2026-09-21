import { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiExternalLink, FiShare2 } from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { getPublicProjectByToken } from '../api/projectApi';
import '../styles/PublicProject.css';

const statusLabels = {
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
};

const PublicProject = () => {
  const { token } = useParams();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchProject = async () => {
      if (!token) {
        setError('This public project link is incomplete.');
        setLoading(false);
        return;
      }

      try {
        const data = await getPublicProjectByToken(token);
        if (active) setProjectData(data);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'This public project link is invalid or no longer available.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProject();

    return () => {
      active = false;
    };
  }, [token]);

  if (loading) {
    return <div className="public-project-state">Loading shared project...</div>;
  }

  if (error) {
    return (
      <div className="public-project-state">
        <div className="public-project-state-card">
          <FiShare2 size={40} />
          <h1>Project unavailable</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const project = projectData?.project || {};
  const tasks = Array.isArray(projectData?.tasks) ? projectData.tasks : [];

  return (
    <main className="public-project-page">
      <header className="public-project-header">
        <div className="public-project-mark"><FiShare2 /> Shared project</div>
        <h1>{project.name || 'Shared project'}</h1>
        <p>{project.description || 'This project has no public description.'}</p>
      </header>

      <section className="public-project-tasks" aria-labelledby="public-tasks-heading">
        <div className="public-project-section-heading">
          <div>
            <span className="public-project-eyebrow">Project plan</span>
            <h2 id="public-tasks-heading">Tasks</h2>
          </div>
          <span className="public-project-task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>

        {tasks.length === 0 ? (
          <div className="public-project-empty">
            <FiCheckCircle size={32} />
            <h3>No tasks to display</h3>
            <p>This project has not shared any tasks yet.</p>
          </div>
        ) : (
          <div className="public-task-list">
            {tasks.map((task, index) => {
              const status = statusLabels[task.status] || 'Unknown status';
              const isDone = task.status === 'done';

              return (
                <article className="public-task-item" key={`${task.title || 'task'}-${index}`}>
                  <div className={`public-task-icon ${isDone ? 'done' : ''}`}>
                    {isDone ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <h3>{task.title || 'Untitled task'}</h3>
                  <span className={`public-task-status status-${task.status || 'unknown'}`}>{status}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="public-project-footer">
        <FiExternalLink /> Shared from PlanAI
      </footer>
    </main>
  );
};

export default PublicProject;