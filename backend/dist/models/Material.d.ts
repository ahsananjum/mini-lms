import mongoose, { Document, Types } from 'mongoose';
export interface IMaterial extends Document {
    module: Types.ObjectId;
    title: string;
    description: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    uploadedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Material: mongoose.Model<IMaterial, {}, {}, {}, mongoose.Document<unknown, {}, IMaterial, {}, mongoose.DefaultSchemaOptions> & IMaterial & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IMaterial>;
//# sourceMappingURL=Material.d.ts.map