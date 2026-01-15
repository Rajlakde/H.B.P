
import { Event, Inquiry, MediaItem, StatData, Subscriber, Abhang, BlogPost, SocialLink, IntegrationConfig, SocialPost, PlatformStats } from './types';

export const NAV_LINKS = [
  { label: 'मुख्यपान', path: '/' },
  { label: 'कार्यक्रम', path: '/events' },
  { label: 'परिचय', path: '/about' },
  { label: 'सेवा', path: '/services' },
  { label: 'विचारधन', path: '/blog' },
  { label: 'भक्ती भांडार', path: '/media' },
  { label: 'आमंत्रण', path: '/booking' },
  { label: 'संपर्क', path: '/contact' },
];

export const DAILY_ABHANG: Abhang = {
  id: '1',
  sant: "जगद्गुरु संत तुकाराम महाराज",
  text: `वृक्ष वल्ली आम्हां सोयरीं वनचरें ।
पक्षी ही सुस्वरें आळविती ॥
येणे सुखें रुचे एकांताचा वास ।
नाही गुण दोष अंगा येत ॥`,
  meaning: "निसर्गाच्या सानिध्यात, वृक्ष-वेली आणि पशू-पक्षी हेच आमचे सगेसोयरे आहेत. या एकांतात जे सुख मिळते, तिथे कोणत्याही प्रकारचे गुण-दोष अंगाला लागत नाहीत. मन निर्मळ राहते.",
  date: new Date().toISOString().split('T')[0]
};

export const UPCOMING_EVENTS: Event[] = [
  { id: '1', title: 'भव्य कीर्तन सोहळा', date: '2024-06-15', location: 'पंढरपूर', venue: 'श्री विठ्ठल रुक्मिणी मंदिर', type: 'कीर्तन', status: 'Upcoming', description: 'आषाढी एकादशी निमित्त विशेष कीर्तन सेवा.' },
  { id: '2', title: 'ज्ञानेश्वरी पारायण समाप्ती', date: '2024-06-20', location: 'आळंदी देवाची', venue: 'ज्ञानेश्वर महाराज संस्थान', type: 'प्रवचन', status: 'Upcoming', description: 'काल्याचे कीर्तन आणि महाप्रसाद.' },
  { id: '3', title: 'महिला सत्संग मेळावा', date: '2024-06-25', location: 'पुणे', venue: 'बालगंधर्व रंगमंदिर', type: 'व्याख्यान', status: 'Upcoming', description: 'महिलांसाठी विशेष अध्यात्मिक मार्गदर्शन.' },
];

export const MOCK_INQUIRIES: Inquiry[] = [
  { id: '101', organizer: 'श्री गणेश तरुण मंडळ', eventType: 'कीर्तन', date: '2024-07-10', location: 'नाशिक', venue: 'गणेश चौक', contact: '9876543210', status: 'Pending', expectedAudience: 500 },
  { id: '102', organizer: 'ग्रामस्थ मंडळ, सातारा', eventType: 'अखंड हरिनाम सप्ताह', date: '2024-07-12', location: 'कोरेगाव, सातारा', venue: 'विठ्ठल मंदिर', contact: '9876543211', status: 'Confirmed', expectedAudience: 2000 },
  { id: '103', organizer: 'सरस्वती विद्यालय', eventType: 'विद्यार्थी प्रबोधन', date: '2024-07-15', location: 'कोल्हापूर', venue: 'शाळा पटांगण', contact: '9876543212', status: 'Rejected', expectedAudience: 1000 },
];

export const MOCK_MEDIA: MediaItem[] = [
  { id: 'm1', type: 'video', title: 'पंढरपूर वारी विशेष कीर्तन', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/400/225', category: 'कीर्तन', date: '2024-05-10' },
  { id: 'm2', type: 'image', title: 'गुरु पौर्णिमा उत्सव', url: 'https://picsum.photos/400/300', category: 'उत्सव', date: '2024-04-15' },
  { id: 'm3', type: 'audio', title: 'हरिपाठ - संपूर्ण', url: '#', category: 'प्रवचन', date: '2024-03-20' },
  { id: 'm4', type: 'image', title: 'काकडा आरती', url: 'https://picsum.photos/401/300', category: 'नित्यनेम', date: '2024-02-10' },
];

export const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', name: 'माऊली भजनी मंडळ', contact: '9876500001', district: 'पुणे', joinedDate: '2024-01-10' },
  { id: 's2', name: 'वारकरी संप्रदाय, सातारा', contact: '9876500002', district: 'सातारा', joinedDate: '2024-02-15' },
  { id: 's3', name: 'ज्ञानेश्वर शिंदे', contact: '9876500003', district: 'सोलापूर', joinedDate: '2024-03-05' },
];

export const DASHBOARD_STATS: StatData[] = [
  { name: 'नियोजित कार्यक्रम', value: 120, change: '+१२%' },
  { name: 'सेवा विनंत्या', value: 15, change: '+५' }, 
  { name: 'वेबसाईट भेटी', value: 3400, change: '+१८%' },
  { name: 'भक्ती परिवार', value: 85000, change: '+२.५%' }, 
];

export const MONTHLY_DATA = [
  { name: 'जाने', events: 4, inquiries: 10 },
  { name: 'फेब्रु', events: 3, inquiries: 12 },
  { name: 'मार्च', events: 6, inquiries: 8 },
  { name: 'एप्रिल', events: 8, inquiries: 15 },
  { name: 'मे', events: 5, inquiries: 20 },
  { name: 'जून', events: 7, inquiries: 18 },
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: '1',
    title: 'आषाढी वारीचे महत्त्व आणि परंपरा',
    excerpt: 'पंढरपूरची वारी ही केवळ यात्रा नसून तो एक संस्कार आहे. जाणून घेऊया या परंपरेमागचा इतिहास.',
    content: '...',
    author: 'कांचनताई',
    date: '2024-06-01',
    image: 'https://picsum.photos/800/400',
    category: 'संस्कृती',
    status: 'Published'
  },
  {
    id: '2',
    title: 'दैनंदिन जीवनात नामस्मरण',
    excerpt: 'धकाधकीच्या जीवनात मानसिक शांतीसाठी नामस्मरणाचे महत्त्व.',
    content: '...',
    author: 'कांचनताई',
    date: '2024-06-10',
    image: 'https://picsum.photos/800/401',
    category: 'अध्यात्म',
    status: 'Published'
  }
];

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'Instagram', handle: '@kanchanshelke_official', url: 'https://instagram.com', followers: '12.5K', isConnected: true },
  { platform: 'Facebook', handle: 'Kanchan Shelke', url: 'https://facebook.com', followers: '25K', isConnected: true },
  { platform: 'YouTube', handle: 'Kanchan Bhakti', url: 'https://youtube.com', followers: '50K', isConnected: true },
  { platform: 'WhatsApp', handle: '+91 98765 43210', url: 'https://wa.me/', followers: '5K', isConnected: true },
];

export const INTEGRATIONS: IntegrationConfig[] = [
  { id: '1', name: 'Google Drive', description: 'डेटाबेस आणि फाइल स्टोरेजसाठी', status: 'Connected', lastSync: '10 min ago' },
  { id: '2', name: 'YouTube API', description: 'व्हिडिओ गॅलरी सिंक करण्यासाठी', status: 'Connected', lastSync: '1 hour ago' },
  { id: '3', name: 'WhatsApp Business', description: 'बुकिंग अलर्ट पाठवण्यासाठी', status: 'Disconnected' },
  { id: '4', name: 'Google Analytics', description: 'वेबसाईट ट्रॅफिक पाहण्यासाठी', status: 'Connected', lastSync: 'Live' },
];

export const PLATFORM_STATS: PlatformStats[] = [
    { platform: 'Instagram', followers: 12500, reach: 45000, engagement: '4.5%', lastSync: 'Just Now' },
    { platform: 'Facebook', followers: 25000, reach: 82000, engagement: '3.2%', lastSync: '5 min ago' },
    { platform: 'YouTube', followers: 50000, reach: 120000, engagement: '8.1%', lastSync: '1 hour ago' }
];

export const MOCK_SOCIAL_POSTS: SocialPost[] = [
    {
        id: 'sp1', platform: 'YouTube', type: 'video', 
        url: 'https://youtube.com/watch?v=1', thumbnail: 'https://picsum.photos/800/450',
        caption: 'Ashadhi Ekadashi Special Kirtan Live from Pandharpur',
        likes: 1200, comments: 45, views: 5000, date: '2 hrs ago', isFeatured: true
    },
    {
        id: 'sp2', platform: 'Instagram', type: 'reel', 
        url: 'https://instagram.com/reel/1', thumbnail: 'https://picsum.photos/400/700',
        caption: 'Chanting Vitthal Nam ✨ #Bhakti #KanchanShelke',
        likes: 850, comments: 20, views: 3200, date: '5 hrs ago', isFeatured: true
    },
    {
        id: 'sp3', platform: 'Facebook', type: 'image', 
        url: 'https://facebook.com/post/1', thumbnail: 'https://picsum.photos/800/800',
        caption: 'Upcoming schedule for June 2024. Save the dates!',
        likes: 400, comments: 15, date: '1 day ago', isFeatured: true
    },
    {
        id: 'sp4', platform: 'Instagram', type: 'image', 
        url: 'https://instagram.com/p/2', thumbnail: 'https://picsum.photos/600/600',
        caption: 'Morning Darshan at Alandi.',
        likes: 1500, comments: 80, date: '2 days ago', isFeatured: false
    },
    {
        id: 'sp5', platform: 'YouTube', type: 'video', 
        url: 'https://youtube.com', thumbnail: 'https://picsum.photos/800/451',
        caption: 'Pravachan on Dnyaneshwari - Adhyay 12',
        likes: 2100, comments: 120, views: 8000, date: '3 days ago', isFeatured: true
    }
];