import mongoose, { Document, Types } from 'mongoose';
export interface IEnrollment extends Document {
    course: Types.ObjectId;
    student: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Enrollment: mongoose.Model<IEnrollment, {}, {}, {}, mongoose.Document<unknown, {}, IEnrollment, {}, mongoose.DefaultSchemaOptions> & IEnrollment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEnrollment>;
//# sourceMappingURL=Enrollment.d.ts.map