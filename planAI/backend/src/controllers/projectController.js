import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';
import ProjectFile from '../models/ProjectFile.js';
import User from '../models/User.js';
import crypto from 'crypto';
import { isProjectMember, isProjectOwner, normalizeEmail } from '../middleware/authMiddleware.js';
import { generateTasksWithAI } from '../services/aiService.js';

/**
 * @route   GET /api/projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects' });
  }
};

/**
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project' });
  }
};

/**
 * @route   GET /api/projects/:projectId/analytics
 * @access  Private
 */
export const getProjectAnalytics = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate('members', 'name');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectMember(project, req.user._id) && !isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    const [taskStats, noteStats, fileStats] = await Promise.all([
      Task.aggregate([
        { $match: { project: project._id } },
        {
          $facet: {
            summary: [
              {
                $group: {
                  _id: null,
                  total: { $sum: 1 },
                  completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
                  },
                },
              },
            ],
            createdByMember: [
              { $group: { _id: '$createdBy', count: { $sum: 1 } } },
            ],
            assignedToMember: [
              { $match: { assignedTo: { $ne: null } } },
              { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
            ],
          },
        },
      ]),
      Note.aggregate([
        { $match: { project: project._id } },
        {
          $facet: {
            summary: [{ $count: 'total' }],
            createdByMember: [
              { $group: { _id: '$createdBy', count: { $sum: 1 } } },
            ],
          },
        },
      ]),
      ProjectFile.aggregate([
        { $match: { project: project._id } },
        {
          $facet: {
            summary: [{ $count: 'total' }],
            uploadedByMember: [
              { $group: { _id: '$uploadedBy', count: { $sum: 1 } } },
            ],
          },
        },
      ]),
    ]);

    const taskData = taskStats[0] || {};
    const noteData = noteStats[0] || {};
    const fileData = fileStats[0] || {};
    const taskSummary = taskData.summary?.[0] || { total: 0, completed: 0 };
    const noteTotal = noteData.summary?.[0]?.total || 0;
    const fileTotal = fileData.summary?.[0]?.total || 0;
    const createdTaskCounts = new Map(
      (taskData.createdByMember || []).map((entry) => [String(entry._id), entry.count])
    );
    const assignedTaskCounts = new Map(
      (taskData.assignedToMember || []).map((entry) => [String(entry._id), entry.count])
    );
    const noteCounts = new Map(
      (noteData.createdByMember || []).map((entry) => [String(entry._id), entry.count])
    );
    const fileCounts = new Map(
      (fileData.uploadedByMember || []).map((entry) => [String(entry._id), entry.count])
    );

    const members = project.members.map((member) => {
      const memberId = String(member._id);

      return {
        member: {
          id: member._id,
          name: member.name,
        },
        tasksCreated: createdTaskCounts.get(memberId) || 0,
        tasksAssigned: assignedTaskCounts.get(memberId) || 0,
        notesCreated: noteCounts.get(memberId) || 0,
        filesUploaded: fileCounts.get(memberId) || 0,
      };
    });

    res.json({
      project: {
        id: project._id,
        name: project.name,
      },
      summary: {
        totalTasks: taskSummary.total,
        completedTasks: taskSummary.completed,
        incompleteTasks: taskSummary.total - taskSummary.completed,
        totalNotes: noteTotal,
        totalFiles: fileTotal,
        memberCount: project.members.length,
      },
      members,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Get project analytics error:', error);
    res.status(500).json({ message: 'Server error fetching project analytics' });
  }
};

const getShareUrl = (token) => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl.replace(/\/$/, '')}/shared/project/${token}`;
};

/**
 * @route   GET /api/projects/:id/share
 * @access  Private, project owner only
 */
export const getProjectSharing = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('+publicShareToken');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can manage public sharing' });
    }

    res.json({
      enabled: project.publicSharingEnabled,
      shareUrl: project.publicSharingEnabled && project.publicShareToken
        ? getShareUrl(project.publicShareToken)
        : null,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Get project sharing error:', error);
    res.status(500).json({ message: 'Server error fetching project sharing status' });
  }
};

/**
 * @route   POST /api/projects/:id/share
 * @access  Private, project owner only
 */
export const enableProjectSharing = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('+publicShareToken');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can manage public sharing' });
    }

    if (!project.publicShareToken || !project.publicSharingEnabled) {
      project.publicShareToken = crypto.randomBytes(32).toString('hex');
    }

    project.publicSharingEnabled = true;
    await project.save();

    res.status(200).json({
      enabled: true,
      shareUrl: getShareUrl(project.publicShareToken),
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Enable project sharing error:', error);
    res.status(500).json({ message: 'Server error enabling project sharing' });
  }
};

/**
 * @route   DELETE /api/projects/:id/share
 * @access  Private, project owner only
 */
export const disableProjectSharing = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('+publicShareToken');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can manage public sharing' });
    }

    project.publicSharingEnabled = false;
    project.publicShareToken = null;
    await project.save();

    res.json({ enabled: false, shareUrl: null });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Disable project sharing error:', error);
    res.status(500).json({ message: 'Server error disabling project sharing' });
  }
};

export const getPublicProjectByToken = async (req, res) => {
  res.set('Cache-Control', 'no-store');

  try {
    const project = await Project.findOne({
      publicShareToken: req.params.token,
      publicSharingEnabled: true,
    }).select('name description');

    if (!project) {
      return res.status(404).json({ message: 'Public project link is invalid or no longer available' });
    }

    const tasks = await Task.find({ project: project._id })
      .select('title status')
      .sort({ position: 1, createdAt: -1 })
      .lean();

    res.json({
      project: {
        name: project.name,
        description: project.description,
      },
      tasks: tasks.map((task) => ({
        title: task.title,
        status: task.status,
      })),
    });
  } catch (error) {
    console.error('Get public project error:', error);
    res.status(500).json({ message: 'Server error fetching public project' });
  }
};

/**
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a project name' });
    }

    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [req.user._id],
    });

    let aiTasks = [];
    try {
      const prompt = `${name}${description ? ` - ${description}` : ''}`;
      const generated = await generateTasksWithAI(prompt, 'Generate initial tasks for this new project.');
      aiTasks = generated.tasks;
    } catch (error) {
      console.error('AI default task generation error:', error);
    }

    const defaultTasks = aiTasks.map((task, index) => ({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: 'todo',
      project: project._id,
      createdBy: req.user._id,
      position: index,
    }));

    if (defaultTasks.length > 0) {
      await Task.insertMany(defaultTasks);
    }

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project' });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { name, description, color } = req.body;

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.color = color || project.color;

    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(populatedProject);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project' });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Task.deleteMany({ project: req.params.id });

    await project.deleteOne();

    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project' });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Please provide a valid member email' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can manage members' });
    }

    const userToAdd = await User.findOne({ email: normalizedEmail }).select('_id name email');

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (String(project.owner) === String(userToAdd._id)) {
      return res.status(400).json({ message: 'This user is already the project owner' });
    }

    if (project.members.some((member) => String(member) === String(userToAdd._id))) {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json(populatedProject);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Add project member error:', error);
    res.status(500).json({ message: 'Server error adding project member' });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    if (!memberId) {
      return res.status(400).json({ message: 'Please provide a member ID' });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!isProjectOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can manage members' });
    }

    if (String(project.owner) === String(memberId)) {
      return res.status(400).json({ message: 'The project owner cannot be removed from the project' });
    }

    const memberExists = project.members.some((member) => String(member) === String(memberId));

    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found in this project' });
    }

    project.members = project.members.filter((member) => String(member) !== String(memberId));
    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json(populatedProject);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    console.error('Remove project member error:', error);
    res.status(500).json({ message: 'Server error removing project member' });
  }
};
