import { useEffect, useState } from 'react';
import { FiArrowLeft, FiBarChart2, FiFileText, FiFolder, FiUsers, FiCheckCircle, FiClock, FiAlertTriangle, FiFlag } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectAnalytics } from '../api/projectApi';
import '../styles/ProjectAnalytics.css';

const emptyAnalytics = {
  project: { id: '', name: 'Project analytics' },
  summary: {
    totalTasks: 0,
    completedTasks: 0,
    incompleteTasks: 0,
    totalNotes: 0,
    totalFiles: 0,
    memberCount: 0,
  },
  members: [],
};

const ProjectAnalytics = ({ embedded = false, stats = null }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getProjectAnalytics(projectId);
        if (active) {
          setAnalytics({
            ...emptyAnalytics,
            ...data,
            summary: { ...emptyAnalytics.summary, ...(data?.summary || {}) },
            members: Array.isArray(data?.members) ? data.members : [],
          });
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load project analytics.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      active = false;
    };
  }, [projectId]);

  if (loading) {
    return <div className={embedded ? 'analytics-embedded-state' : 'analytics-state'}>Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className={embedded ? 'analytics-embedded-state analytics-error-state' : 'analytics-state analytics-error-state'}>
        <div className="analytics-state-card">
          <FiBarChart2 size={36} />
          <h2>Analytics unavailable</h2>
          <p>{error}</p>
          <button type="button" className="btn-secondary" onClick={() => navigate(`/project/${projectId}`)}>
            <FiArrowLeft /> Back to project
          </button>
        </div>
      </div>
    );
  }

  const currentAnalytics = analytics || emptyAnalytics;
  const summary = currentAnalytics.summary;
  const hasActivity = summary.totalTasks > 0 || summary.totalNotes > 0 || summary.totalFiles > 0;
  const summaryCards = [
    { label: 'Total tasks', value: summary.totalTasks, icon: FiFolder, tone: 'blue' },
    { label: 'Completed tasks', value: summary.completedTasks, icon: FiCheckCircle, tone: 'green' },
    { label: 'Incomplete tasks', value: summary.incompleteTasks, icon: FiClock, tone: 'amber' },
    { label: 'Total notes', value: summary.totalNotes, icon: FiFileText, tone: 'purple' },
    { label: 'Uploaded files', value: summary.totalFiles, icon: FiFolder, tone: 'red' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: FiAlertTriangle, tone: 'orange' },
    { label: 'High priority', value: stats?.highPriority || 0, icon: FiFlag, tone: 'coral' },
    { label: 'Project members', value: summary.memberCount, icon: FiUsers, tone: 'slate' },
  ];

  const content = (
    <main className="analytics-content">
        <section className="analytics-summary" aria-label="Project summary">
          {summaryCards.map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className={`analytics-summary-card ${tone}`}>
              <Icon size={22} />
              <div>
                <span>{label}</span>
                <strong>{Number(value) || 0}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="contributions-panel">
          <div className="contributions-heading">
            <div>
              <h2>Member contributions</h2>
              <p>Activity totals across this project.</p>
            </div>
            <span className="member-count-badge">{summary.memberCount} members</span>
          </div>

          {!hasActivity ? (
            <div className="analytics-empty-state">
              <FiBarChart2 size={34} />
              <h3>No project activity yet</h3>
              <p>Task, note, and file contributions will appear here as the project grows.</p>
            </div>
          ) : currentAnalytics.members.length === 0 ? (
            <div className="analytics-empty-state">
              <h3>No member data available</h3>
              <p>The project has activity, but no member contribution records were returned.</p>
            </div>
          ) : (
            <div className="contributions-table-wrap">
              <table className="contributions-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Tasks created</th>
                    <th>Tasks assigned</th>
                    <th>Notes created</th>
                    <th>Files uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAnalytics.members.map((entry) => (
                    <tr key={entry.member?.id || entry.member?._id || entry.member?.name}>
                      <th scope="row">{entry.member?.name || 'Unnamed member'}</th>
                      <td>{Number(entry.tasksCreated) || 0}</td>
                      <td>{Number(entry.tasksAssigned) || 0}</td>
                      <td>{Number(entry.notesCreated) || 0}</td>
                      <td>{Number(entry.filesUploaded) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </main>
  );

  if (embedded) {
    return content;
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <button type="button" className="btn-back" onClick={() => navigate(`/project/${projectId}`)}>
          <FiArrowLeft /> Back to project
        </button>
        <div>
          <div className="analytics-eyebrow"><FiBarChart2 /> Contribution analytics</div>
          <h1>{currentAnalytics.project?.name || 'Project analytics'}</h1>
          <p>Project activity and member contribution overview.</p>
        </div>
      </header>
      {content}
    </div>
  );
};

export default ProjectAnalytics;