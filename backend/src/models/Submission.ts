import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
  assignment: Types.ObjectId;
  student: Types.ObjectId;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  submittedAt: Date;
  marks: number | null;
  feedback: string | null;
  gradedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    marks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    gradedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
