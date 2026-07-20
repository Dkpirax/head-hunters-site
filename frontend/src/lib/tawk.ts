export interface TawkAPI {
  onLoad?: () => void;
  onStatusChange?: (status: 'online' | 'away' | 'offline') => void;
  onChatStarted?: () => void;
  onAgentJoinChat?: (data: any) => void;
  onAgentLeaveChat?: (data: any) => void;
  onChatEnded?: () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
  onChatMessageAgent?: (message: any) => void;

  hideWidget: () => void;
  showWidget: () => void;
  maximize: () => void;
  minimize: () => void;
  toggle: () => void;
  popup: () => void;
  
  getStatus: () => 'online' | 'away' | 'offline';
  isChatMaximized: () => boolean;
  isChatMinimized: () => boolean;
  isChatHidden: () => boolean;
  isVisitorEngaged: () => boolean;
  
  addEvent: (eventName: string, attributes?: Record<string, any>, callback?: (error?: any) => void) => void;
  addTags: (tags: string[], callback?: (error?: any) => void) => void;
  removeTags: (tags: string[], callback?: (error?: any) => void) => void;
  setAttributes: (attributes: Record<string, any>, callback?: (error?: any) => void) => void;
  visitor?: {
    name?: string;
    email?: string;
  };
  secureMode?: (hash: string) => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    Tawk_LoadStart?: Date;
  }
}
