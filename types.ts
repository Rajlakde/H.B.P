
export interface Event {
  id: string;
  title: string;
  date: string;
  location: string; // Village
  taluka?: string; // New
  district?: string; // New
  venue?: string; // Specific Place/Sthal
  latitude?: number;
  longitude?: number;
  type: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  description?: string;
  duration?: string; // e.g. "2 तास", "7 दिवस"
  isPublished?: boolean; 
  organizer?: string;
  contact?: string; // Private primary contact
  altContact?: string; // Public secondary contact
  committeeMembers?: { name: string; phone: string }[];
}

export interface Inquiry {
  id: string;
  organizer: string;
  eventType: string;
  date: string;
  location: string; // Village
  taluka?: string; // New
  district?: string; // New
  venue?: string; // Specific Place/Sthal
  latitude?: number;
  longitude?: number;
  contact: string;
  altContact?: string;
  committeeMembers?: { name: string; phone: string }[];
  status: 'Pending' | 'Confirmed' | 'Rejected';
  expectedAudience: number;
  details?: string;
  submissionDate?: string;
}

export interface MediaItem {
  id: string;
  type: 'video' | 'audio' | 'image';
  title: string;
  url: string;
  thumbnail?: string;
  category?: string;
  date?: string;
}

export interface StatData {
  name: string;
  value: number;
  change?: string;
}

export interface Subscriber {
  id: string;
  name: string;
  contact: string;
  district: string;
  joinedDate: string;
}

export interface Abhang {
  id: string;
  sant: string;
  text: string;
  meaning: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
  status: 'Published' | 'Draft';
}

export interface SocialLink {
  platform: 'Instagram' | 'Facebook' | 'YouTube' | 'WhatsApp' | 'Twitter';
  handle: string;
  url: string;
  followers: string;
  isConnected: boolean;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  status: 'Connected' | 'Disconnected' | 'Error';
  apiKey?: string;
  lastSync?: string;
}

export interface SocialPost {
  id: string;
  platform: 'Instagram' | 'Facebook' | 'YouTube';
  type: 'video' | 'image' | 'reel';
  url: string;
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  views?: number;
  date: string;
  isFeatured: boolean; 
}

export interface PlatformStats {
  platform: 'Instagram' | 'Facebook' | 'YouTube';
  followers: number;
  reach: number;
  engagement: string;
  lastSync: string;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}
