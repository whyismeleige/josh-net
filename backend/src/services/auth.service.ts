import { env } from "src/config/env.config";
import User from "src/models/User.model";
import { createToken, sanitizeUser } from "src/utils/auth.utils";
import { ValidationError } from "src/utils/error.utils";

class AuthService {
  async registerUser(userData: any, metadata: any) {
    const { name, email, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) throw new ValidationError("User already exists");

    const newUser = await User.create({
      email,
      name,
      password,
      role,
      academic: {
        course: "BBA - IT",
        currentSemester: "Semester - V",
        year: "R23",
      },
      providers: ["local"],
      activity: {
        totalLogins: [
          {
            metadata,
          },
        ],
      },
    });

    const token = createToken({ id: newUser._id.toString(), role });

    return {
      user: sanitizeUser(newUser),
      token,
    };
  }

  async loginUser() {}
}

export default new AuthService();
