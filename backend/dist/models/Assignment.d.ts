import mongoose, { Document, Types } from 'mongoose';
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
export declare const Assignment: mongoose.Model<IAssignment, {}, {}, {}, mongoose.Document<unknown, {}, IAssignment, {}, mongoose.DefaultSchemaOptions> & IAssignment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAssignment>;
//# sourceMappingURL=Assignment.d.ts.map