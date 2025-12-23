import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  APIResponse,
  LocalAuthResponse,
  User,
  VerificationPurpose,
} from "../../types/auth.types";
import { BACKEND_URL } from "@/src/utils/config";
import { RootState } from "..";

export interface AuthState {
  user: User | null;
  id: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  verificationId: string | null;
  purpose: VerificationPurpose | null;
  error: string | null;
}

const TokenService = {
  getAccessToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
  getRefreshToken: () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  },
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
    }
  },
  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("refreshToken", token);
    }
  },
  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },
  isTokenExpired: (token: string) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  },
};

const initialState: AuthState = {
  user: null,
  id: null,
  accessToken: TokenService.getAccessToken() || null,
  isAuthenticated: false,
  isLoading: false,
  verificationId: null,
  purpose: null,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    credentials: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (data.type !== "success") return rejectWithValue(data.message);

      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Registering Error");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (data.type !== "success") return rejectWithValue(data.message);

      if (data.verificationId) {
        return data;
      }

      return {
        credentials: {
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error: unknown) {
      console.log("The error is", error);
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(message);
    }
  }
);

export const sendOTP = createAsyncThunk<
  APIResponse & { verificationId?: string; purpose?: VerificationPurpose },
  { purpose: string; email: string },
  { state: RootState }
>("auth/sendOTP", async (credentials, { rejectWithValue }) => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.type !== "success") return rejectWithValue(data.message);

    return { ...data, purpose: credentials.purpose };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return rejectWithValue(message);
  }
});

export const verifyOTP = createAsyncThunk<any, string, { state: RootState }>(
  "auth/verifyOTP",
  async (otp: string, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp, verificationId: auth.verificationId }),
      });

      const data = await response.json();

      if (data.type !== "success") return rejectWithValue(data.message);

      return data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk<
  any,
  string,
  { state: RootState }
>("auth/changePassword", async (newPassword, { getState, rejectWithValue }) => {
  try {
    const { auth } = getState();

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: auth.id, newPassword }),
    });

    const data = await response.json();

    if (data.type !== "success") return rejectWithValue(data.message);

    return data;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An error occurred";
    return rejectWithValue(message);
  }
});

export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = TokenService.getAccessToken();

      if (!accessToken) throw new Error("No access token");

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to Fetch Profile");

      const userData = await response.json();

      return userData;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const refreshToken = TokenService.getRefreshToken();

      if (!refreshToken) throw new Error("No Refresh Token");

      const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.type !== "success") return rejectWithValue(data.message);

      TokenService.setAccessToken(data.accessToken);
      if (data.refreshToken) TokenService.setRefreshToken(data.refreshToken);

      const userData = await dispatch(fetchUserProfile()).unwrap();

      return {
        ...data,
        ...userData,
      };
    } catch (error: unknown) {
      TokenService.clearTokens();
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(message);
    }
  }
);

export const verifyAuth = createAsyncThunk<LocalAuthResponse>(
  "auth/verifyAuth",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const accessToken = TokenService.getAccessToken();

      if (!accessToken || TokenService.isTokenExpired(accessToken)) {
        const result = await dispatch(refreshToken()).unwrap();
        return result;
      }

      const data = await dispatch(fetchUserProfile()).unwrap();

      return {
        accessToken,
        ...data,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An error occurred";
      return rejectWithValue(message);
    }
  }
);

const setAuthCredentials = (state: AuthState, payload: LocalAuthResponse) => {
  const { user, accessToken, refreshToken } = payload;
  state.accessToken = accessToken;
  state.user = user;
  state.isAuthenticated = true;
  state.isLoading = false;
  state.error = null;

  TokenService.setAccessToken(accessToken);
  if (refreshToken) TokenService.setRefreshToken(refreshToken);
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LocalAuthResponse>) => {
      setAuthCredentials(state, action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.verificationId = null;
      state.purpose = null;
      state.id = null;
      state.error = null;
      TokenService.clearTokens();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<LocalAuthResponse>) => {
          setAuthCredentials(state, action.payload);
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (
          state,
          action: PayloadAction<{
            verificationId?: string;
            credentials?: LocalAuthResponse;
          }>
        ) => {
          if (action.payload.verificationId) {
            state.isLoading = false;
            state.verificationId = action.payload.verificationId;
            state.purpose = "two_factor_auth";
            return;
          }

          if (action.payload.credentials) {
            setAuthCredentials(state, action.payload.credentials);
          }
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.purpose = null;
        state.verificationId = null;
      })
      .addCase(
        sendOTP.fulfilled,
        (
          state,
          action: PayloadAction<
            APIResponse & {
              verificationId?: string;
              purpose?: VerificationPurpose;
            }
          >
        ) => {
          state.isLoading = false;
          state.error = null;

          if (action.payload.verificationId)
            state.verificationId = action.payload.verificationId;
          if (action.payload.purpose) state.purpose = action.payload.purpose;
        }
      )
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.purpose = null;
        state.verificationId = null;
        state.error = action.payload as string;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        verifyOTP.fulfilled,
        (
          state,
          action: PayloadAction<LocalAuthResponse & { userId: string }>
        ) => {
          switch (state.purpose) {
            case "two_factor_auth":
              setAuthCredentials(state, action.payload);
              break;
            case "password_reset":
              state.id = action.payload.userId;
              break;
          }
          state.isLoading = false;
          state.verificationId = null;
          state.purpose = null;
        }
      )
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.verificationId = null;
        state.purpose = null;
        state.error = action.payload as string;
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.id = null;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.id = null;
        state.error = action.payload as string;
      })
      .addCase(verifyAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        verifyAuth.fulfilled,
        (state, action: PayloadAction<LocalAuthResponse>) => {
          setAuthCredentials(state, action.payload);
        }
      )
      .addCase(verifyAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
        TokenService.clearTokens();
      });
  },
});

export const { setCredentials } = authSlice.actions;
export default authSlice.reducer;
