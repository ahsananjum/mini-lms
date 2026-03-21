import { ICourse } from '../models/Course';
import { Types } from 'mongoose';
interface ListCoursesQuery {
    search?: string;
}
interface CourseData {
    title: string;
    code: string;
    description: string;
}
export declare function getCourses(query: ListCoursesQuery): Promise<(import("mongoose").Document<unknown, {}, ICourse, {}, import("mongoose").DefaultSchemaOptions> & ICourse & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
})[]>;
export declare function createCourse(data: CourseData): Promise<ICourse>;
export declare function getCourseById(courseId: string): Promise<ICourse>;
export declare function updateCourse(courseId: string, data: Partial<CourseData>): Promise<ICourse>;
export declare function deleteCourse(courseId: string): Promise<void>;
export declare function assignInstructor(courseId: string, instructorId: string | null): Promise<ICourse>;
export declare function getEnrollments(courseId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models/Enrollment").IEnrollment, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Enrollment").IEnrollment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
})[]>;
export declare function enrollStudent(courseId: string, studentId: string): Promise<import("mongoose").Document<unknown, {}, import("../models/Enrollment").IEnrollment, {}, import("mongoose").DefaultSchemaOptions> & import("../models/Enrollment").IEnrollment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare function unenrollStudent(courseId: string, studentId: string): Promise<void>;
export {};
//# sourceMappingURL=course.service.d.ts.map