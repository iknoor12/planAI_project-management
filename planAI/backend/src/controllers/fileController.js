import crypto from 'crypto';
import path from 'path';
import multer from 'multer';

import cloudinary from '../config/cloudinary.js';
import ProjectFile from '../models/ProjectFile.js';
import Project from '../models/Project.js';
import { isProjectMember, isProjectOwner } from '../middleware/authMiddleware.js';

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_UPLOAD_SIZE_BYTES = Number(process.env.MAX_UPLOAD_SIZE_MB || 10) * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Map([
    ['png', 'image/png'],
    ['jpg', 'image/jpeg'],
    ['jpeg', 'image/jpeg'],
    ['gif', 'image/gif'],
    ['webp', 'image/webp'],
    ['pdf', 'application/pdf'],
    ['txt', 'text/plain'],
    ['csv', 'text/csv'],
    ['svg', 'image/svg+xml'],
]);

const mimeAllowList = new Set([
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/csv',
    'application/vnd.ms-excel',
    'image/svg+xml',
]);

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

const sanitizeFileName = (originalName) => {
    const parsed = path.parse(String(originalName || 'file'));
    const safeBase = parsed.name
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80) || 'file';

    return `${safeBase}${parsed.ext ? parsed.ext.toLowerCase() : ''}`;
};

const determineResourceType = (fileName, mimeType) => {
    const ext = path.extname(fileName || '').toLowerCase();
    const lowerMime = (mimeType || '').toLowerCase();

    if (lowerMime.startsWith('image/')) {
        return 'image';
    }

    if (ext === '.pdf' || lowerMime === 'application/pdf' || lowerMime === 'text/plain' || lowerMime === 'text/csv' || lowerMime === 'application/csv' || lowerMime === 'application/vnd.ms-excel') {
        return 'raw';
    }

    return 'raw';
};

const validateUploadedFile = (file) => {
    if (!file || !file.originalname) {
        return 'Please attach a file to upload.';
    }

    if (!file.buffer || file.buffer.length === 0) {
        return 'Uploaded file is empty.';
    }

    const fileExt = path.extname(file.originalname).toLowerCase().slice(1);
    const normalizedMime = (file.mimetype || '').toLowerCase();
    const allowedMime = ALLOWED_EXTENSIONS.get(fileExt);

    if (!fileExt || !allowedMime) {
        return 'Unsupported file type. Allowed types are images, PDF, text, and CSV files.';
    }

    if (!mimeAllowList.has(normalizedMime) && normalizedMime !== allowedMime) {
        return 'File MIME type does not match the allowed file types.';
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return `File exceeds the ${Math.round(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024))}MB upload limit.`;
    }

    return null;
};

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_UPLOAD_SIZE_BYTES || DEFAULT_MAX_SIZE_BYTES,
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase().slice(1);
        const normalizedMime = (file.mimetype || '').toLowerCase();

        if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
            return cb(new Error('Unsupported file type. Allowed types are images, PDF, text, and CSV files.'));
        }

        if (!mimeAllowList.has(normalizedMime) && normalizedMime !== ALLOWED_EXTENSIONS.get(ext)) {
            return cb(new Error('File MIME type is not allowed.'));
        }

        cb(null, true);
    },
});

const formatSignedUrl = (file, mode = 'preview') => {
    const resourceType = file.resourceType || 'raw';
    const options = {
        resource_type: resourceType,
        type: 'private',
        secure: true,
        sign_url: true,
    };

    if (mode === 'download') {
        return cloudinary.utils.private_download_url(file.publicId, file.format || file.extension || '', {
            ...options,
            attachment: true,
        });
    }

    return cloudinary.url(file.publicId, {
        ...options,
        resource_type: resourceType,
    });
};

export const getFilesByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const { project, error } = await getProjectAccess(req, projectId);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const files = await ProjectFile.find({ project: project._id })
            .populate('uploadedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(files);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        console.error('Get project files error:', error);
        res.status(500).json({ message: 'Server error fetching project files' });
    }
};

export const getFileById = async (req, res) => {
    try {
        const fileDoc = await ProjectFile.findById(req.params.fileId).populate('uploadedBy', 'name email');

        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { project, error } = await getProjectAccess(req, fileDoc.project);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        res.json(fileDoc);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        console.error('Get file metadata error:', error);
        res.status(500).json({ message: 'Server error fetching file metadata' });
    }
};

export const getFilePreviewUrl = async (req, res) => {
    try {
        const fileDoc = await ProjectFile.findById(req.params.fileId);

        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { project, error } = await getProjectAccess(req, fileDoc.project);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const signedUrl = formatSignedUrl(fileDoc, 'preview');

        res.json({
            file: fileDoc,
            url: signedUrl,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        console.error('Preview URL generation error:', error);
        res.status(500).json({ message: 'Server error generating preview URL' });
    }
};

export const getFileDownloadUrl = async (req, res) => {
    try {
        const fileDoc = await ProjectFile.findById(req.params.fileId);

        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { project, error } = await getProjectAccess(req, fileDoc.project);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const signedUrl = formatSignedUrl(fileDoc, 'download');

        res.json({
            file: fileDoc,
            url: signedUrl,
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        console.error('Download URL generation error:', error);
        res.status(500).json({ message: 'Server error generating download URL' });
    }
};

export const uploadProjectFile = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'Please select a file to upload.' });
        }

        const { project, error } = await getProjectAccess(req, projectId);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const validationError = validateUploadedFile(req.file);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const originalName = sanitizeFileName(req.file.originalname);
        const ext = path.extname(originalName).toLowerCase();
        const mimeType = (req.file.mimetype || '').toLowerCase();
        const resourceType = determineResourceType(originalName, mimeType);
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `planai/projects/${project._id}`,
                    public_id: uniqueName,
                    resource_type: resourceType,
                    type: 'private',
                    overwrite: false,
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        const fileDoc = await ProjectFile.create({
            project: project._id,
            uploadedBy: req.user._id,
            originalName: String(req.file.originalname || originalName).trim(),
            storedName: originalName,
            publicId: uploadResult.public_id,
            mimeType,
            extension: ext.replace('.', ''),
            size: req.file.size,
            format: uploadResult.format || ext.replace('.', ''),
            resourceType,
            deliveryType: 'private',
            secureUrl: uploadResult.secure_url,
        });

        const populatedFile = await ProjectFile.findById(fileDoc._id).populate('uploadedBy', 'name email');

        res.status(201).json(populatedFile);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        console.error('Upload file error:', error);
        res.status(500).json({ message: 'Server error uploading file' });
    }
};

export const deleteFile = async (req, res) => {
    try {
        const fileDoc = await ProjectFile.findById(req.params.fileId);

        if (!fileDoc) {
            return res.status(404).json({ message: 'File not found' });
        }

        const { project, error } = await getProjectAccess(req, fileDoc.project);
        if (error) {
            return res.status(error.status).json({ message: error.message });
        }

        const isOwner = isProjectOwner(project, req.user._id);
        const isUploader = String(fileDoc.uploadedBy) === String(req.user._id);

        if (!isOwner && !isUploader) {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }

        try {
            await cloudinary.uploader.destroy(fileDoc.publicId, {
                resource_type: fileDoc.resourceType,
                type: 'private',
            });
        } catch (cloudinaryError) {
            console.error('Cloudinary delete error:', cloudinaryError);
            return res.status(500).json({ message: 'Failed to remove the uploaded file from storage.' });
        }

        await fileDoc.deleteOne();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        console.error('Delete file error:', error);
        res.status(500).json({ message: 'Server error deleting file' });
    }
};