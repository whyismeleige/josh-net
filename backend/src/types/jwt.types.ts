import { ObjectId } from "mongoose";
import { UserRole } from "./models/user.model.types";

export interface JWTPayload {
    id: string;
    role: UserRole
}