import mongoose, { Document, Types } from 'mongoose';
export interface IAnnouncement extends Document {
    course: Types.ObjectId;
    title: string;
    message: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Announcement: mongoose.Model<IAnnouncement, {}, {}, {}, mongoose.Document<unknown, {}, IAnnouncement, {}, mongoose.DefaultSchemaOptions> & IAnnouncement & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAnnouncement>;
//# sourceMappingURL=Announcement.d.ts.map