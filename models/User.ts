export interface User {
  username: string;
  email: string;
  lastLoggedIn: number;
  created: number;
  oauth?: {
    providerId: string;
    idToken?: string;
    accessToken?: string;
  };
}
