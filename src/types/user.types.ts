// User response
export interface UserResponse {
    _id: string;
    name: string;
    email: string;
  }
  
  // Online status response
  export interface OnlineStatusResponse {
    [userId: string]: boolean;
  }
  
  // User online/offline event
  export interface UserStatusEvent {
    userId: string;
  }
  
  // Socket join/leave chat event
  export interface ChatRoomEvent {
    userId: string;
  }
  
  // Socket get online status event
  export interface GetOnlineStatusEvent {
    userIds: string[];
  }