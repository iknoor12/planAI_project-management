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
  if (!openai) {
    throw new Error('OpenAI API is not configured. Please add OPENAI_API_KEY to your .env file.');
  }
  
  try {
    const prompt = `You are a project management assistant. Generate a list of tasks for the following project.

Project Description: ${projectDescription}
${context ? `Additional Context: ${context}` : ''}

Generate 5-8 actionable tasks with the following details for each:
- Title (concise, action-oriented)
- Description (brief explanation)
- Priority (low, medium, high, or urgent)
- Estimated completion time

Format your response as a JSON array of task objects with properties: title, description, priority, estimatedTime.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful project management assistant that generates structured task lists. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: return a simple structure if parsing fails
    return [
      {
        title: 'Review generated tasks',
        description: 'AI response needs manual review',
        priority: 'medium',
        estimatedTime: '1 hour',
      },
    ];
  } catch (error) {
    console.error('AI task generation error:', error);
    throw new Error('Failed to generate tasks with AI');
  }
};

/**
 * Generate subtasks for a given task
 * @param {string} taskTitle - Title of the main task
 * @param {string} taskDescription - Description of the main task
 * @returns {Array} Array of subtask titles
 */
export const generateSubtasksWithAI = async (taskTitle, taskDescription = '') => {
  if (!openai) {
    throw new Error('OpenAI API is not configured. Please add OPENAI_API_KEY to your .env file.');
  }
  
  try {
    const prompt = `Break down the following task into smaller, actionable subtasks:

Task: ${taskTitle}
${taskDescription ? `Description: ${taskDescription}` : ''}

Generate 3-6 subtasks that would help complete this main task. Each subtask should be:
- Specific and actionable
- Smaller in scope than the main task
- Logically ordered

Format your response as a JSON array of objects with property: title.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that breaks down tasks into smaller subtasks. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback
    return [
      { title: 'Review task requirements', completed: false },
      { title: 'Plan implementation approach', completed: false },
      { title: 'Execute and test', completed: false },
    ];
  } catch (error) {
    console.error('AI subtask generation error:', error);
    throw new Error('Failed to generate subtasks with AI');
  }
};

/**
 * Analyze task delays and provide suggestions
 * @param {Array} tasks - Array of task objects with status and due dates
 * @param {string} projectContext - Context about the project
 * @returns {Object} Analysis with suggestions
 */
export const analyzeTaskDelaysWithAI = async (tasks, projectContext = '') => {
  if (!openai) {
    throw new Error('OpenAI API is not configured. Please add OPENAI_API_KEY to your .env file.');
  }
  
  try {
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

    const taskSummary = overdueTasks
      .map((task) => `- ${task.title} (Priority: ${task.priority}, Due: ${task.dueDate})`)
      .join('\n');

    const prompt = `Analyze the following overdue tasks and provide actionable suggestions to get back on track:

${taskSummary}

${projectContext ? `Project Context: ${projectContext}` : ''}

Provide:
1. A brief analysis of potential causes
2. 3-5 specific, actionable suggestions to address delays
3. Priority recommendations

Format your response as JSON with properties: analysis, suggestions (array of strings), priorityRecommendation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a project management consultant analyzing task delays and providing practical solutions. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0].message.content;
    
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        hasDelays: true,
        overdueCount: overdueTasks.length,
        ...analysis,
      };
    }

    // Fallback
    return {
      hasDelays: true,
      overdueCount: overdueTasks.length,
      analysis: 'Multiple tasks are overdue. Consider reprioritizing and reallocating resources.',
      suggestions: [
        'Review task priorities and adjust accordingly',
        'Break down large tasks into smaller milestones',
        'Consider delegating tasks to team members',
      ],
      priorityRecommendation: 'Focus on high-priority tasks first',
    };
  } catch (error) {
    console.error('AI delay analysis error:', error);
    throw new Error('Failed to analyze delays with AI');
  }
};
