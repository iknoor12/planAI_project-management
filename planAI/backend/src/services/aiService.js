import openai from '../config/openai.js';

/**
 * AI Service
 * Provides AI-powered features using OpenAI API
 */

/**
 * Generate tasks based on project description
 * @param {string} projectDescription - Description of the project
 * @param {string} context - Additional context (optional)
 * @returns {Array} Array of generated tasks
 */
export const generateTasksWithAI = async (projectDescription, context = '') => {
  // Mock data for testing when OpenAI quota is exceeded
  console.log('Generating tasks for:', projectDescription);
  
  return [
    {
      title: 'Project Planning & Requirement Analysis',
      description: `Define detailed requirements and scope for: ${projectDescription}. Create project roadmap and timelines.`,
      priority: 'high',
      estimatedTime: '1-2 days',
    },
    {
      title: 'Design & Architecture',
      description: 'Create system architecture, design wireframes, and technical specifications. Document design decisions.',
      priority: 'high',
      estimatedTime: '2-3 days',
    },
    {
      title: 'Infrastructure Setup',
      description: 'Set up development environment, version control, CI/CD pipelines, and deployment infrastructure.',
      priority: 'high',
      estimatedTime: '1-2 days',
    },
    {
      title: 'Core Development',
      description: 'Implement core features and functionality based on design specifications and requirements.',
      priority: 'high',
      estimatedTime: '5-7 days',
    },
    {
      title: 'Testing & Quality Assurance',
      description: 'Perform unit testing, integration testing, and end-to-end testing. Fix bugs and optimize performance.',
      priority: 'medium',
      estimatedTime: '2-3 days',
    },
    {
      title: 'Documentation & Deployment',
      description: 'Create user documentation, API documentation, and deploy to production environment.',
      priority: 'medium',
      estimatedTime: '1-2 days',
    },
    {
      title: 'Monitoring & Maintenance',
      description: 'Set up monitoring, logging, and implement ongoing maintenance and support procedures.',
      priority: 'medium',
      estimatedTime: 'Ongoing',
    },
  ];
};

/**
 * Generate subtasks for a given task
 * @param {string} taskTitle - Title of the main task
 * @param {string} taskDescription - Description of the main task
 * @returns {Array} Array of subtask titles
 */
export const generateSubtasksWithAI = async (taskTitle, taskDescription = '') => {
  // Mock data for testing when OpenAI quota is exceeded
  console.log('Generating subtasks for:', taskTitle);
  
  return [
    {
      title: 'Research and collect requirements',
      completed: false,
    },
    {
      title: 'Create detailed plan and timeline',
      completed: false,
    },
    {
      title: 'Implement core functionality',
      completed: false,
    },
    {
      title: 'Test and validate implementation',
      completed: false,
    },
    {
      title: 'Document and prepare for deployment',
      completed: false,
    },
  ];
};

/**
 * Analyze task delays and provide suggestions
 * @param {Array} tasks - Array of task objects with status and due dates
 * @param {string} projectContext - Context about the project
 * @returns {Object} Analysis with suggestions
 */
export const analyzeTaskDelaysWithAI = async (tasks, projectContext = '') => {
  // Mock data for testing when OpenAI quota is exceeded
  console.log('Analyzing delays for', tasks.length, 'tasks');
  
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'
  );

  if (overdueTasks.length === 0) {
    return {
      hasDelays: false,
      message: 'All tasks are on track! No delays detected.',
      suggestions: [],
    };
  }

  // Mock analysis response
  return {
    hasDelays: true,
    overdueCount: overdueTasks.length,
    analysis: 'Multiple tasks are overdue. The delay appears to be due to resource constraints and scope creep. Immediate action is needed to reallocate resources and reprioritize.',
    suggestions: [
      'Immediately review all overdue tasks and identify blockers',
      'Reallocate team members to high-priority overdue tasks',
      'Break down large overdue tasks into smaller milestones for faster completion',
      'Communicate with stakeholders about revised timelines',
      'Consider bringing in additional resources or contractors',
    ],
    priorityRecommendation: 'Focus on critical business-blocking tasks first, then address other delays.',
  };
};
