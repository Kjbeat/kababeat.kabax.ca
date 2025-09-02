import { Response, NextFunction } from 'express';
import { IUserController, UserRequest } from './user.interface';
export declare class UserController implements IUserController {
    private userService;
    constructor();
    getProfile: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    updateProfile: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    followUser: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    unfollowUser: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    getFollowers: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    getFollowing: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    searchUsers: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    getRecommendedUsers: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    getTopProducers: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
    getRecentUsers: (req: UserRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map