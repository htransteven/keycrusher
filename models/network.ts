export interface APIResponse_User_Network {
  followers: string[];
  following: string[];
}

export interface UserNetwork {
  followers: { [userId: string]: boolean };
  following: { [userId: string]: boolean };
}
