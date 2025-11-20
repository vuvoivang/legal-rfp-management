import { IUser } from ".";

declare global {
    namespace Express {
        interface Request {
            user?: IUser; // attach User document to req.user
        }
    }
}