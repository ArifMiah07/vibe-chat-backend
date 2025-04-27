// Socket events
export enum SocketEvents {
    // Connection events
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    
    // User status events
    USER_ONLINE = 'userOnline',
    USER_OFFLINE = 'userOffline',
    ONLINE_USERS = 'onlineUsers',
    GET_ONLINE_STATUS = 'getOnlineStatus',
    
    // Chat room events
    JOIN_CHAT = 'joinChat',
    LEAVE_CHAT = 'leaveChat',
    
    // Message events
    SEND_MESSAGE = 'sendMessage',
    NEW_MESSAGE = 'newMessage',
    
    // Typing events
    TYPING = 'typing',
    USER_TYPING = 'userTyping',
    STOP_TYPING = 'stopTyping',
    USER_STOP_TYPING = 'userStopTyping',
    
    // Read receipt events
    MARK_AS_READ = 'markAsRead',
    MESSAGES_READ = 'messagesRead'
  }
  
  // Error messages
  export enum ErrorMessages {
    UNAUTHORIZED = 'Not authorized to access this route',
    USER_EXISTS = 'User with this email already exists',
    INVALID_CREDENTIALS = 'Invalid credentials',
    USER_NOT_FOUND = 'User not found',
    RECEIVER_NOT_FOUND = 'Receiver not found',
    INVALID_USER_ID = 'Invalid user ID',
    SERVER_ERROR = 'Server error'
  }
  
  // Success messages
  export enum SuccessMessages {
    LOGOUT = 'Logged out successfully'
  }