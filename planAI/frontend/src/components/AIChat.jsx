import { useState } from 'react';
import { FiSend, FiLoader } from 'react-icons/fi';
import { chatWithAI } from '../api/aiApi';
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
      const response = await chatWithAI(input, projectContext);
      const aiMessage = {
        role: 'assistant',
        content: response.reply,
        tasks: response.tasks || null,
        subtasks: response.subtasks || null,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.tasks && onTasksGenerated) {
        onTasksGenerated(response.tasks);
      }

      if (response.subtasks && onSubtasksGenerated) {
        onSubtasksGenerated(response.subtasks);
      }

    } catch (error) {
      const errorMessage = error.response?.data?.message
        || 'The AI assistant is temporarily unavailable. Please try again shortly.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
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
          onKeyDown={handleKeyDown}
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
