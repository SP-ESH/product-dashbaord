export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
};

/** POST /auth/login returns the user fields plus the tokens. */
export type LoginResponse = User & {
  accessToken: string;
  refreshToken: string;
};

export type LoginFormValues = {
  username: string;
  password: string;
};
