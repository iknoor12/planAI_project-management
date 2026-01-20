import '../styles/DashboardStats.css';

/**
 * DashboardStats Component
 * Displays project statistics (total, in progress, completed, overdue tasks)
 */
const DashboardStats = ({ stats }) => {
  if (!stats) {
    return <div className="stats-loading">Loading statistics...</div>;
  }

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total || 0,
      icon: '📋',
      color: '#3b82f6',
    },
    {
      title: 'To Do',
      value: stats.todo || 0,
      icon: '⏳',
      color: '#64748b',
    },
    {
      title: 'In Progress',
      value: stats.inProgress || 0,
      icon: '🔄',
      color: '#f59e0b',
    },
    {
      title: 'Completed',
      value: stats.done || 0,
      icon: '✅',
      color: '#10b981',
    },
    {
      title: 'Overdue',
      value: stats.overdue || 0,
      icon: '⚠️',
      color: '#ef4444',
    },
    {
      title: 'High Priority',
      value: stats.highPriority || 0,
      icon: '🔥',
      color: '#f97316',
    },
  ];

  return (
    <div className="dashboard-stats">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="stat-card"
          style={{ borderLeftColor: stat.color }}
        >
          <div className="stat-icon" style={{ color: stat.color }}>
            {stat.icon}
          </div>
          <div className="stat-content">
            <h3>{stat.title}</h3>
            <p className="stat-value">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
