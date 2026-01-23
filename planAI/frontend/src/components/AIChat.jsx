import { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import { chatWithAI, generateTasks, generateSubtasks } from '../api/aiApi';
import '../styles/AIChat.css';

const AIChat = ({ projectContext, onTasksGenerated, onSubtasksGenerated }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI project assistant. I can help you generate tasks, break down work, and provide project management advice. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      if (input.toLowerCase().includes('generate task') || input.toLowerCase().includes('create task')) {
        const response = await generateTasks(input, projectContext);
        const aiMessage = {
          role: 'assistant',
          content: `I've generated ${response.tasks.length} tasks based on your request. Would you like me to add them to your project?`,
          tasks: response.tasks,
        };
        setMessages((prev) => [...prev, aiMessage]);
        
        if (onTasksGenerated) {
          onTasksGenerated(response.tasks);
        }
      } else if (input.toLowerCase().includes('subtask') || input.toLowerCase().includes('break down')) {
        const taskTitle = input.replace(/generate subtasks?|break down|for|the task/gi, '').trim();
        if (taskTitle) {
          const response = await generateSubtasks(taskTitle);
          const aiMessage = {
            role: 'assistant',
            content: `Here are suggested subtasks for "${taskTitle}":`,
            subtasks: response.subtasks,
          };
          setMessages((prev) => [...prev, aiMessage]);
          
          if (onSubtasksGenerated) {
            onSubtasksGenerated(response.subtasks);
          }
        } else {
          setMessages((prev) => [...prev, {
            role: 'assistant',
            content: 'Please specify which task you\'d like me to break down into subtasks.',
          }]);
        }
      } else {
        const response = await chatWithAI(input, projectContext);
        const aiMessage = { role: 'assistant', content: response.reply };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again or check your OpenAI API configuration.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              <p>{message.content}</p>
              
              {message.tasks && (
                <div className="generated-tasks">
                  {message.tasks.map((task, idx) => (
                    <div key={idx} className="generated-task">
                      <strong>{task.title}</strong>
                      <p>{task.description}</p>
                      <span className="task-meta">
                        Priority: {task.priority} | Est: {task.estimatedTime}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {message.subtasks && (
                <ul className="generated-subtasks">
                  {message.subtasks.map((subtask, idx) => (
                    <li key={idx}>{subtask.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message assistant">
            <div className="message-content loading">
              <FiLoader className="spinner" /> Thinking...
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything about your project..."
          disabled={loading}
          rows="2"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
