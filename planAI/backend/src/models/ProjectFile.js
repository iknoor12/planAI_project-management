import mongoose from 'mongoose';

const projectFileSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
      trim: true,
    },
    extension: {
      type: String,
      trim: true,
      default: '',
    },
    size: {
      type: Number,
      required: true,
      default: 0,
    },
    format: {
      type: String,
      trim: true,
      default: '',
    },
    resourceType: {
      type: String,
      enum: ['image', 'raw', 'video'],
      default: 'raw',
    },
    deliveryType: {
      type: String,
      enum: ['private'],
      default: 'private',
    },
    secureUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

projectFileSchema.index({ project: 1, createdAt: -1 });

const ProjectFile = mongoose.model('ProjectFile', projectFileSchema);

export default ProjectFile;