import Note from '../models/Note.js';
import Project from '../models/Project.js';
import { isProjectMember, isProjectOwner } from '../middleware/authMiddleware.js';

const getProjectAccess = async (req, projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    return { project: null, error: { status: 404, message: 'Project not found' } };
  }

  if (!isProjectMember(project, req.user._id)) {
    return { project: null, error: { status: 403, message: 'Not authorized to access this project' } };
  }

  return { project, error: null };
};

const canManageNote = (project, note, userId) => {
  return isProjectOwner(project, userId) || String(note.createdBy) === String(userId);
};

export const getNotesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { project, error } = await getProjectAccess(req, projectId);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const notes = await Note.find({ project: project._id })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { project, error } = await getProjectAccess(req, note.project);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    res.json(note);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    console.error('Get note error:', error);
    res.status(500).json({ message: 'Server error fetching note' });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, project } = req.body;

    if (!project) {
      return res.status(400).json({ message: 'Please provide a project ID' });
    }

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Please provide a note title' });
    }

    if (content === undefined || !String(content).trim()) {
      return res.status(400).json({ message: 'Please provide note content' });
    }

    const { project: projectDoc, error } = await getProjectAccess(req, project);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const note = await Note.create({
      title: String(title).trim(),
      content: String(content).trim(),
      project: projectDoc._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const populatedNote = await Note.findById(note._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json(populatedNote);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error creating note' });
  }
};

export const updateNote = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Please provide note updates' });
    }

    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { project, error } = await getProjectAccess(req, note.project);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (!canManageNote(project, note, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }

    const { title, content } = req.body;

    if (title !== undefined) {
      if (!String(title).trim()) {
        return res.status(400).json({ message: 'Please provide a note title' });
      }
      note.title = String(title).trim();
    }

    if (content !== undefined) {
      if (!String(content).trim()) {
        return res.status(400).json({ message: 'Please provide note content' });
      }
      note.content = String(content).trim();
    }

    note.updatedBy = req.user._id;
    const updatedNote = await note.save();

    const populatedNote = await Note.findById(updatedNote._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.json(populatedNote);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error updating note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { project, error } = await getProjectAccess(req, note.project);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    if (!canManageNote(project, note, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error deleting note' });
  }
};
