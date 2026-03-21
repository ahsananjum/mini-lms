import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IModule extends Document {
  course: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>(
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
    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

moduleSchema.index({ course: 1, order: 1 }, { unique: true });

export const Module = mongoose.model<IModule>('Module', moduleSchema);
