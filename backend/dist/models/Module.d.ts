import mongoose, { Document, Types } from 'mongoose';
export interface IModule extends Document {
    course: Types.ObjectId;
    title: string;
    description: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Module: mongoose.Model<IModule, {}, {}, {}, mongoose.Document<unknown, {}, IModule, {}, mongoose.DefaultSchemaOptions> & IModule & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IModule>;
//# sourceMappingURL=Module.d.ts.map