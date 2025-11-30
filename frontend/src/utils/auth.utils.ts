export const validateEmail = (email: string) => {
  return email.endsWith("@josephscollege.ac.in");
};

export const validatePasswords = (
  password: string,
  confirmPassword: string
) => {
  return password === confirmPassword;
};
