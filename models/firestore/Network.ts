export interface UserNetwork {
  followers: { [userId: string]: boolean };
  following: { [userId: string]: boolean };
}
