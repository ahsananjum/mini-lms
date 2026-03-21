import mongoose, { Document, Types } from 'mongoose';
export interface ICourse extends Document {
    title: string;
    code: string;
    description: string;
    instructor?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Course: mongoose.Model<ICourse, {}, {}, {}, mongoose.Document<unknown, {}, ICourse, {}, mongoose.DefaultSchemaOptions> & ICourse & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICourse>;
//# sourceMappingURL=Course.d.ts.map