import { Request, Response, NextFunction } from 'express';
export declare function listCourses(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCourse(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteCourseHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignInstructorHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function listEnrollments(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function enrollStudentHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function unenrollStudentHandler(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=course.controller.d.ts.map