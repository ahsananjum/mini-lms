import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEnrollment extends Document {
  course: Types.ObjectId;
  student: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment for same course+student pair
enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
