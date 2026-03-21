import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  course: Types.ObjectId;
  title: string;
  description: string;
  dueDate: Date;
  gradingType: 'graded' | 'ungraded';
  totalMarks: number | null;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assignmentSchema = new Schema<IAssignment>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    gradingType: {
      type: String,
      enum: ['graded', 'ungraded'],
      default: 'graded',
      required: [true, 'Grading type is required'],
    },
    totalMarks: {
      type: Number,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);
