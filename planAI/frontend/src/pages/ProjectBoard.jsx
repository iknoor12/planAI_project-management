import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FiPlus, FiArrowLeft, FiMessageSquare, FiUserPlus, FiTrash2, FiFileText, FiUpload, FiDownload, FiEye, FiX, FiBarChart2, FiShare2, FiCopy, FiBookOpen, FiGrid, FiFolder } from 'react-icons/fi';
import KanbanBoard from '../components/KanbanBoard';
import AIChat from '../components/AIChat';
import MarkdownEditor from '../components/MarkdownEditor';
import ProjectAnalytics from './ProjectAnalytics';
import { getProjectById, addProjectMember, removeProjectMember, getProjectSharing, enableProjectSharing, disableProjectSharing } from '../api/projectApi';
import { generateProjectTasks } from '../api/aiApi';
import { explainNote } from '../api/aiApi';
import { getTasksByProject, createTask, updateTask, deleteTask, getTaskStats } from '../api/taskApi';
import { getNotesByProject, createNote, updateNote, deleteNote } from '../api/notesApi';
import { getProjectFiles, uploadProjectFile, getFilePreviewUrl, getFileDownloadUrl, deleteFile } from '../api/fileApi';
import { useAuth } from '../context/AuthContext';
import '../styles/ProjectBoard.css';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const activeSection = location.pathname.endsWith('/related')
    ? 'related'
    : location.pathname.endsWith('/analytics')
      ? 'analytics'
      : 'kanban';

  const navigateToSection = (section) => {
    const paths = {
      kanban: `/project/${projectId}`,
      related: `/project/${projectId}/related`,
      analytics: `/project/${projectId}/analytics`,
    };
    navigate(paths[section]);
  };

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberMessage, setMemberMessage] = useState({ type: '', text: '' });
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [noteLoading, setNoteLoading] = useState(true);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteExplanation, setNoteExplanation] = useState('');
  const [noteExplanationLoading, setNoteExplanationLoading] = useState(false);
  const [noteExplanationError, setNoteExplanationError] = useState('');
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);
  const [showGenerateTasksModal, setShowGenerateTasksModal] = useState(false);
  const [taskGenerationContext, setTaskGenerationContext] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [projectFilesLoading, setProjectFilesLoading] = useState(true);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [fileMessage, setFileMessage] = useState({ type: '', text: '' });
  const [selectedFilePreview, setSelectedFilePreview] = useState(null);
  const [selectedFileText, setSelectedFileText] = useState('');
  const [sharing, setSharing] = useState({ enabled: false, shareUrl: null });
  const [sharingLoading, setSharingLoading] = useState(false);
  const [sharingActionLoading, setSharingActionLoading] = useState(false);
  const [sharingMessage, setSharingMessage] = useState({ type: '', text: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    status: 'todo',
    assignedTo: '',
  });

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    if (project && projectId) {
      fetchNotes();
      fetchProjectFilesList();
    }
  }, [projectId, project?._id]);

  useEffect(() => {
    if (project && projectId && isOwner) {
      fetchSharingStatus();
    }
  }, [projectId, project?._id, user?._id]);

  useEffect(() => {
    if (!selectedFilePreview) {
      setSelectedFileText('');
      return;
    }

    const shouldFetchText = selectedFilePreview.file && !selectedFilePreview.file.mimeType.startsWith('image/') && !selectedFilePreview.file.mimeType.includes('pdf') && !selectedFilePreview.file.mimeType.includes('json');

    if (!shouldFetchText || !selectedFilePreview.url) {
      setSelectedFileText('');
      return;
    }

    const fetchPreviewText = async () => {
      try {
        const response = await fetch(selectedFilePreview.url, { method: 'GET' });
        const text = await response.text();
        setSelectedFileText(text);
      } catch (error) {
        setSelectedFileText('Preview text is unavailable for this file.');
      }
    };

    fetchPreviewText();
  }, [selectedFilePreview]);

  const fetchNotes = async () => {
    try {
      const notesData = await getNotesByProject(projectId);
      setNotes(notesData);

      if (!selectedNoteId && notesData.length > 0) {
        setSelectedNoteId(notesData[0]._id);
        setNoteForm({ title: notesData[0].title, content: notesData[0].content || '' });
      }

      if (!notesData.length) {
        setSelectedNoteId('');
        setNoteForm({ title: '', content: '' });
      }
    } catch (error) {
      setNoteError(error.response?.data?.message || 'Failed to load notes.');
    } finally {
      setNoteLoading(false);
    }
  };

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

  const fetchProjectFilesList = async () => {
    try {
      const files = await getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (error) {
      setProjectFiles([]);
    } finally {
      setProjectFilesLoading(false);
    }
  };

  const fetchSharingStatus = async () => {
    setSharingLoading(true);

    try {
      const status = await getProjectSharing(projectId);
      setSharing({ enabled: Boolean(status.enabled), shareUrl: status.shareUrl || null });
      setSharingMessage({ type: '', text: '' });
    } catch (error) {
      setSharingMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load sharing status.',
      });
    } finally {
      setSharingLoading(false);
    }
  };

  const handleEnableSharing = async () => {
    if (sharingActionLoading) return;

    setSharingActionLoading(true);
    setSharingMessage({ type: '', text: '' });

    try {
      await enableProjectSharing(projectId);
      await fetchSharingStatus();
      setSharingMessage({ type: 'success', text: 'Public sharing enabled.' });
    } catch (error) {
      setSharingMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to enable public sharing.',
      });
    } finally {
      setSharingActionLoading(false);
    }
  };

  const handleDisableSharing = async () => {
    if (sharingActionLoading) return;

    setSharingActionLoading(true);
    setSharingMessage({ type: '', text: '' });

    try {
      await disableProjectSharing(projectId);
      await fetchSharingStatus();
      setSharingMessage({ type: 'success', text: 'Public sharing disabled. The previous link no longer works.' });
    } catch (error) {
      setSharingMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to disable public sharing.',
      });
    } finally {
      setSharingActionLoading(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!sharing.shareUrl) return;

    try {
      await navigator.clipboard.writeText(sharing.shareUrl);
      setSharingMessage({ type: 'success', text: 'Share link copied to clipboard.' });
    } catch (error) {
      setSharingMessage({ type: 'error', text: 'Unable to copy the share link. Please copy it manually.' });
    }
  };

  const handleFilePreview = async (file) => {
    try {
      const result = await getFilePreviewUrl(file._id);
      setSelectedFilePreview({ file, url: result.url });
    } catch (error) {
      setFileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to open file preview.',
      });
    }
  };

  const handleFileDownload = async (file) => {
    try {
      const result = await getFileDownloadUrl(file._id);
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setFileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to download file.',
      });
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(fileId);
      setProjectFiles((current) => current.filter((file) => file._id !== fileId));
      if (selectedFilePreview && selectedFilePreview.file._id === fileId) {
        setSelectedFilePreview(null);
      }
      setFileMessage({ type: 'success', text: 'File deleted successfully.' });
    } catch (error) {
      setFileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete file.',
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setFileUploadLoading(true);
    setFileMessage({ type: '', text: '' });

    try {
      const uploadedFile = await uploadProjectFile(projectId, formData);
      const previewResult = await getFilePreviewUrl(uploadedFile._id);
      setProjectFiles((current) => [uploadedFile, ...current]);
      setFileMessage({ type: 'success', text: `${file.name} uploaded successfully.` });
      setSelectedFilePreview({ file: uploadedFile, url: previewResult.url });
    } catch (error) {
      setFileMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to upload file.',
      });
    } finally {
      setFileUploadLoading(false);
      event.target.value = '';
    }
  };

  const isOwner = project && (String(project.owner?._id || project.owner) === String(user?._id));

  const openNewNote = () => {
    setSelectedNoteId('');
    setShowCreateNote(true);
    setNoteForm({ title: '', content: '' });
    setNoteError('');
    setNoteSuccess('');
  };

  const selectNote = (note) => {
    setSelectedNoteId(note._id);
    setShowCreateNote(false);
    setNoteForm({ title: note.title, content: note.content || '' });
    setNoteError('');
    setNoteSuccess('');
    setNoteExplanation('');
    setNoteExplanationError('');
  };

  const handleExplainNote = async () => {
    if (!selectedNoteId || noteExplanationLoading) return;

    setNoteExplanationLoading(true);
    setNoteExplanationError('');

    try {
      const result = await explainNote(selectedNoteId);
      setNoteExplanation(result.explanation || 'Gemini returned no explanation.');
    } catch (error) {
      setNoteExplanationError(error.response?.data?.message || 'Failed to explain this note.');
    } finally {
      setNoteExplanationLoading(false);
    }
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();

    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      setNoteError('Please provide both a title and markdown content.');
      return;
    }

    setNoteSaving(true);
    setNoteError('');
    setNoteSuccess('');

    try {
      if (selectedNoteId) {
        const updatedNote = await updateNote(selectedNoteId, {
          title: noteForm.title,
          content: noteForm.content,
        });

        setNotes((current) =>
          current.map((note) => (note._id === updatedNote._id ? updatedNote : note))
        );
        setSelectedNoteId(updatedNote._id);
        setNoteForm({ title: updatedNote.title, content: updatedNote.content || '' });
        setNoteSuccess('Note updated successfully.');
      } else {
        const createdNote = await createNote({
          title: noteForm.title,
          content: noteForm.content,
          project: projectId,
        });

        setNotes((current) => [createdNote, ...current]);
        setSelectedNoteId(createdNote._id);
        setShowCreateNote(false);
        setNoteForm({ title: createdNote.title, content: createdNote.content || '' });
        setNoteSuccess('Note created successfully.');
      }
    } catch (error) {
      setNoteError(error.response?.data?.message || 'Failed to save note.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNoteId) return;

    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await deleteNote(selectedNoteId);
      const updatedNotes = notes.filter((note) => note._id !== selectedNoteId);
      setNotes(updatedNotes);

      if (updatedNotes.length > 0) {
        const nextNote = updatedNotes[0];
        setSelectedNoteId(nextNote._id);
        setNoteForm({ title: nextNote.title, content: nextNote.content || '' });
        setShowCreateNote(false);
      } else {
        setSelectedNoteId('');
        setShowCreateNote(true);
        setNoteForm({ title: '', content: '' });
      }

      setNoteSuccess('Note deleted successfully.');
    } catch (error) {
      setNoteError(error.response?.data?.message || 'Failed to delete note.');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim() || memberLoading) return;

    setMemberLoading(true);
    setMemberMessage({ type: '', text: '' });

    try {
      const updatedProject = await addProjectMember(projectId, memberEmail.trim());
      setProject(updatedProject);
      setMemberEmail('');
      setMemberMessage({ type: 'success', text: 'Member added successfully.' });
    } catch (error) {
      setMemberMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add member.',
      });
    } finally {
      setMemberLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!memberId || memberLoading) return;

    setMemberLoading(true);
    setMemberMessage({ type: '', text: '' });

    try {
      const updatedProject = await removeProjectMember(projectId, memberId);
      setProject(updatedProject);
      setMemberMessage({ type: 'success', text: 'Member removed successfully.' });
    } catch (error) {
      setMemberMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to remove member.',
      });
    } finally {
      setMemberLoading(false);
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
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', assignedTo: '' });
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
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', assignedTo: '' });
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
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
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

  const closeGenerateTasksModal = () => {
    if (generatingTasks) return;

    setShowGenerateTasksModal(false);
    setTaskGenerationContext('');
  };

  const handleGenerateTasksDialogKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeGenerateTasksModal();
    }
  };

  const handleGenerateProjectTasks = async (e) => {
    e.preventDefault();
    if (generatingTasks) return;

    setGeneratingTasks(true);
    try {
      const result = await generateProjectTasks(projectId, taskGenerationContext.trim());
      await fetchProjectData();

      const generatedCount = Array.isArray(result.tasks) ? result.tasks.length : 0;
      setShowGenerateTasksModal(false);
      setTaskGenerationContext('');
      alert(
        generatedCount > 0
          ? `Generated ${generatedCount} tasks successfully.`
          : 'No new tasks were generated.'
      );
    } catch (error) {
      setShowGenerateTasksModal(false);
      setTaskGenerationContext('');
      alert(error.response?.data?.message || 'Failed to generate tasks.');
    } finally {
      setGeneratingTasks(false);
    }
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
          <button
            onClick={() => setShowGenerateTasksModal(true)}
            className="btn-ai"
            disabled={generatingTasks}
          >
            {generatingTasks ? 'Generating...' : 'Generate Tasks with AI'}
          </button>
          <button onClick={() => {
            setEditingTask(null);
            setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', status: 'todo', assignedTo: '' });
            setShowTaskModal(true);
          }} className="btn-primary">
            <FiPlus /> New Task
          </button>
        </div>
      </header>

      <div className="project-workspace">
        <aside className="project-sidebar" aria-label="Project sections">
          <button
            type="button"
            className={`project-sidebar-item ${activeSection === 'kanban' ? 'active' : ''}`}
            onClick={() => navigateToSection('kanban')}
          >
            <FiGrid />
            <span>Kanban Board</span>
          </button>
          <button
            type="button"
            className={`project-sidebar-item ${activeSection === 'related' ? 'active' : ''}`}
            onClick={() => navigateToSection('related')}
          >
            <FiFolder />
            <span>Related Project</span>
          </button>
          <button
            type="button"
            className={`project-sidebar-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => navigateToSection('analytics')}
          >
            <FiBarChart2 />
            <span>Analytics</span>
          </button>
        </aside>

        <main className={`project-content project-content-${activeSection}`}>
          {activeSection === 'analytics' && (
            <>
              <ProjectAnalytics embedded stats={stats} />
            </>
          )}

          {activeSection === 'related' && (
      <div className="project-section notes-layout">
        <div className="files-card">
          <div className="notes-header">
            <div className="notes-title-wrap">
              <FiUpload />
              <h3>Project Files</h3>
            </div>
            <label className="btn-primary file-upload-button">
              <input type="file" onChange={handleFileUpload} disabled={fileUploadLoading} />
              {fileUploadLoading ? 'Uploading...' : 'Upload file'}
            </label>
          </div>

          {fileMessage.text && (
            <div className={`member-feedback ${fileMessage.type}`}>{fileMessage.text}</div>
          )}

          {projectFilesLoading ? (
            <div className="notes-loading">Loading files...</div>
          ) : (
            <div className="files-layout">
              <div className="files-list">
                {projectFiles.length === 0 ? (
                  <p className="notes-empty">No files uploaded yet.</p>
                ) : (
                  projectFiles.map((file) => (
                    <div key={file._id} className={`file-item ${selectedFilePreview?.file?._id === file._id ? 'selected' : ''}`}>
                      <div className="file-item-meta">
                        <strong>{file.originalName}</strong>
                        <small>
                          {file.mimeType} · {Math.max(1, Math.ceil((file.size || 0) / 1024))} KB
                        </small>
                      </div>

                      <div className="file-actions">
                        <button type="button" className="icon-button" onClick={() => handleFilePreview(file)}>
                          <FiEye />
                        </button>
                        <button type="button" className="icon-button" onClick={() => handleFileDownload(file)}>
                          <FiDownload />
                        </button>
                        {String(file.uploadedBy?._id || file.uploadedBy) === String(user?._id) && (
                          <button type="button" className="icon-button danger" onClick={() => handleFileDelete(file._id)}>
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selectedFilePreview && (
                <div className="file-preview-card">
                  <div className="file-preview-header">
                    <h4>{selectedFilePreview.file.originalName}</h4>
                    <button type="button" className="icon-button" onClick={() => setSelectedFilePreview(null)}>
                      <FiX />
                    </button>
                  </div>

                  {selectedFilePreview.file.mimeType.startsWith('image/') ? (
                    <img src={selectedFilePreview.url} alt={selectedFilePreview.file.originalName} className="file-preview-image" />
                  ) : selectedFilePreview.file.mimeType === 'application/pdf' || selectedFilePreview.file.extension === 'pdf' ? (
                    <iframe src={selectedFilePreview.url} title={selectedFilePreview.file.originalName} className="file-preview-iframe" />
                  ) : (
                    <pre className="file-preview-text">{selectedFileText || 'Loading preview...'}</pre>
                  )}

                  <div className="file-preview-actions">
                    <button type="button" className="btn-primary" onClick={() => handleFileDownload(selectedFilePreview.file)}>
                      <FiDownload /> Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="project-members-card">
          <div className="member-card-header">
            <h3>Project Members</h3>
            {project?.owner && (
              <span className="owner-badge">Owner</span>
            )}
          </div>

          <div className="member-list">
            <div className="member-item owner-member">
              <div>
                <strong>{project.owner?.name || 'Project Owner'}</strong>
                <small>{project.owner?.email || ''}</small>
              </div>
            </div>

            {(project.members || []).filter((member) => String(member?._id || member) !== String(project.owner?._id || project.owner)).map((member) => (
              <div key={member._id || member} className="member-item">
                <div>
                  <strong>{member.name}</strong>
                  <small>{member.email}</small>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    className="icon-button danger"
                    onClick={() => handleRemoveMember(member._id)}
                    disabled={memberLoading}
                    aria-label={`Remove ${member.name}`}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}

            {(!project.members || project.members.length === 1) && (
              <p className="member-empty">No additional members yet.</p>
            )}
          </div>

          {isOwner && (
            <form onSubmit={handleAddMember} className="member-form">
              <label htmlFor="member-email">Add member by email</label>
              <div className="member-form-row">
                <input
                  id="member-email"
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  disabled={memberLoading}
                />
                <button type="submit" className="btn-primary" disabled={memberLoading || !memberEmail.trim()}>
                  <FiUserPlus /> {memberLoading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {!isOwner && (
            <p className="member-access-note">You are a member of this project.</p>
          )}

          {memberMessage.text && (
            <div className={`member-feedback ${memberMessage.type}`}>
              {memberMessage.text}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="sharing-card">
            <div className="sharing-header">
              <div className="notes-title-wrap">
                <FiShare2 />
                <h3>Public Sharing</h3>
              </div>
              <span className={`sharing-status ${sharing.enabled ? 'enabled' : 'disabled'}`}>
                {sharingLoading ? 'Checking...' : sharing.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="sharing-description">
              Share a read-only view of this project without exposing notes, files, members, or analytics.
            </p>

            {sharing.enabled && sharing.shareUrl && (
              <div className="sharing-link-row">
                <input type="text" value={sharing.shareUrl} readOnly aria-label="Public project share link" />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopyShareLink}
                  disabled={sharingActionLoading}
                >
                  <FiCopy /> Copy link
                </button>
              </div>
            )}

            {sharingMessage.text && (
              <div className={`member-feedback ${sharingMessage.type}`}>
                {sharingMessage.text}
              </div>
            )}

            <div className="sharing-actions">
              {sharing.enabled ? (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDisableSharing}
                  disabled={sharingLoading || sharingActionLoading}
                >
                  <FiShare2 /> {sharingActionLoading ? 'Updating...' : 'Disable sharing'}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleEnableSharing}
                  disabled={sharingLoading || sharingActionLoading}
                >
                  <FiShare2 /> {sharingActionLoading ? 'Enabling...' : 'Enable sharing'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="notes-card">
          <div className="notes-header">
            <div className="notes-title-wrap">
              <FiFileText />
              <h3>Project Notes</h3>
            </div>
            <button type="button" className="btn-primary" onClick={openNewNote}>
              <FiPlus /> New Note
            </button>
          </div>

          {noteLoading ? (
            <div className="notes-loading">Loading notes...</div>
          ) : (
            <div className="notes-content">
              <div className="notes-sidebar">
                {notes.length === 0 ? (
                  <p className="notes-empty">No notes yet. Create one to capture project details.</p>
                ) : (
                  notes.map((note) => (
                    <button
                      key={note._id}
                      type="button"
                      className={`note-item ${selectedNoteId === note._id ? 'selected' : ''}`}
                      onClick={() => selectNote(note)}
                    >
                      <span>{note.title}</span>
                      <small>{new Date(note.updatedAt).toLocaleDateString()}</small>
                    </button>
                  ))
                )}
              </div>

              <form className="note-editor-form" onSubmit={handleSaveNote}>
                <div className="note-editor-header">
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    placeholder="Note title"
                    className="note-title-input"
                  />
                  {selectedNoteId && (
                    <div className="note-editor-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleExplainNote}
                        disabled={noteExplanationLoading}
                      >
                        <FiBookOpen /> {noteExplanationLoading ? 'Explaining...' : 'Explain with AI'}
                      </button>
                      <button type="button" className="btn-danger" onClick={handleDeleteNote}>
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  )}
                </div>

                {noteError && <div className="error-message">{noteError}</div>}
                {noteSuccess && <div className="success-message">{noteSuccess}</div>}
                {noteExplanationError && <div className="error-message">{noteExplanationError}</div>}

                {noteExplanation && (
                  <div className="note-explanation-panel">
                    <div className="note-explanation-header">
                      <div className="notes-title-wrap">
                        <FiBookOpen />
                        <h4>AI explanation</h4>
                      </div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setNoteExplanation('')}
                        aria-label="Close AI explanation"
                      >
                        <FiX />
                      </button>
                    </div>
                    <div className="markdown-preview note-explanation-content">
                      <ReactMarkdown>{noteExplanation}</ReactMarkdown>
                    </div>
                  </div>
                )}

                <MarkdownEditor
                  value={noteForm.content}
                  onChange={(content) => setNoteForm({ ...noteForm, content })}
                />

                <div className="note-actions">
                  <button type="button" className="btn-secondary" onClick={() => {
                    if (selectedNoteId) {
                      const current = notes.find((note) => note._id === selectedNoteId);
                      setNoteForm({ title: current?.title || '', content: current?.content || '' });
                      setNoteError('');
                      setNoteSuccess('');
                    } else {
                      setNoteForm({ title: '', content: '' });
                    }
                  }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={noteSaving}>
                    {noteSaving ? 'Saving...' : selectedNoteId ? 'Save Changes' : 'Create Note'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        </div>
          )}

          {activeSection === 'kanban' && (
      <div className="board-container">
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskEdit={handleEditTask}
          onTaskDelete={handleDeleteTask}
        />
      </div>
          )}

          {showAIChat && (
            <div className="ai-panel ai-panel-shared">
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
        </main>
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

              <div className="form-group">
                <label htmlFor="task-assignee">Assign To</label>
                <select
                  id="task-assignee"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {(project.members || []).map((member) => (
                    <option key={member._id || member} value={member._id || member}>
                      {member.name || 'Project member'}{member.email ? ` (${member.email})` : ''}
                    </option>
                  ))}
                </select>
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

      {showGenerateTasksModal && (
        <div className="modal-overlay" onClick={closeGenerateTasksModal}>
          <div
            className="modal ai-task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-tasks-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleGenerateTasksDialogKeyDown}
          >
            <h2 id="generate-tasks-title">Generate Tasks with AI</h2>
            <p className="ai-task-project">Project: {project.name}</p>
            <form onSubmit={handleGenerateProjectTasks}>
              <div className="form-group">
                <label htmlFor="task-generation-context">
                  Additional instructions (optional)
                </label>
                <textarea
                  id="task-generation-context"
                  value={taskGenerationContext}
                  onChange={(e) => setTaskGenerationContext(e.target.value)}
                  placeholder="Generate frontend and API integration tasks only"
                  rows="4"
                  autoFocus
                  disabled={generatingTasks}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={closeGenerateTasksModal}
                  className="btn-secondary"
                  disabled={generatingTasks}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={generatingTasks}>
                  {generatingTasks ? 'Generating...' : 'Generate'}
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
