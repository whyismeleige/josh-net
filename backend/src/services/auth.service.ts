import User from "@models/User.model";
import { createToken, sanitizeUser } from "@utils/auth.utils";
import { ValidationError } from "@utils/error.utils";

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

  async loginUser(credentials: any, metadata: any) {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select("+password");

    if (!user)
      throw new ValidationError("User does not exist. Please Register");

    if (user.isLocked() && user.security.lockUntil) {
      const minutesLeft = Math.ceil(
        (user.security.lockUntil.getTime() - Date.now()) / (1000 * 60),
      );
      throw new ValidationError(
        `Account is Locked, \nDue to Repeated Incorrect Login Attempts,\nTry after ${minutesLeft}  minutes`,
      );
    }

    if(!user.password) throw new ValidationError("No Password Set for this Account. \n Please Authenticate with Gmail");
    
    const passwordsMatch = await user.passwordsMatch(password);

    if(!passwordsMatch) {
      await user.inSuccessfulLogin();
      throw new ValidationError("Passwords do not match");
    }

    const token = createToken({ id: user._id.toString(), role: user.role });

    return {
      user: sanitizeUser(user),
      token,
    };
  }
}

export default new AuthService();
