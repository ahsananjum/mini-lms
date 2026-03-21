import mongoose, { Document, Types } from 'mongoose';
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
export declare const Submission: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}, mongoose.DefaultSchemaOptions> & ISubmission & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
//# sourceMappingURL=Submission.d.ts.map