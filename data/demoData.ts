
import { Event, Inquiry, MediaItem, Subscriber, BlogPost, SocialPost, Abhang } from '../types';

// --- DEMO DATABASE MIRROR ---

// Helper to get dates relative to today
const today = new Date();
const getDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
};

export const DEMO_EVENTS: Event[] = [
  { 
    id: 'evt_1', 
    title: 'भव्य कीर्तन सोहळा - आषाढी एकादशी', 
    date: getDate(2), 
    location: 'पंढरपूर',
    taluka: 'पंढरपूर',
    district: 'सोलापूर',
    venue: 'श्री विठ्ठल रुक्मिणी मंदिर',
    latitude: 17.6774,
    longitude: 75.3320,
    type: 'कीर्तन', 
    status: 'Upcoming', 
    description: 'आषाढी एकादशी निमित्त विशेष कीर्तन सेवा. वारकरी संप्रदायाची महापरवानी. सकाळी ६ ते ९.',
    isPublished: true,
    organizer: 'वारकरी महामंडळ',
    altContact: '9922001122'
  },
  { 
    id: 'evt_2', 
    title: 'ज्ञानेश्वरी पारायण समाप्ती', 
    date: getDate(5), 
    location: 'आळंदी देवाची', 
    taluka: 'खेड',
    district: 'पुणे',
    venue: 'संत ज्ञानेश्वर महाराज समाधी मंदिर',
    latitude: 18.6769,
    longitude: 73.8967,
    type: 'प्रवचन', 
    status: 'Upcoming', 
    description: 'काल्याचे कीर्तन आणि महाप्रसाद. ज्ञानेश्वरी जयंती निमित्त.',
    isPublished: true,
    organizer: 'आळंदी देवस्थान'
  },
  { 
    id: 'evt_3', 
    title: 'महिला सत्संग मेळावा', 
    date: getDate(8), 
    location: 'पुणे', 
    taluka: 'हवेली',
    district: 'पुणे',
    venue: 'बालगंधर्व रंगमंदिर',
    latitude: 18.5204,
    longitude: 73.8567,
    type: 'इतर', 
    status: 'Upcoming', 
    description: 'महिलांसाठी विशेष अध्यात्मिक मार्गदर्शन आणि भजन संध्या.',
    isPublished: true,
    organizer: 'महिला मंडळ पुणे'
  },
  { 
    id: 'evt_4', 
    title: 'अखंड हरिनाम सप्ताह - प्रारंभ', 
    date: getDate(15), 
    location: 'कोरेगाव', 
    taluka: 'कोरेगाव',
    district: 'सातारा',
    venue: 'मारुती मंदिर',
    latitude: 17.6805,
    longitude: 74.0183,
    type: 'सप्ताह', 
    status: 'Upcoming', 
    description: 'काकडा आरती, गाथा भजन आणि कीर्तन.',
    isPublished: true,
    organizer: 'ग्रामस्थ मंडळ कोरेगाव'
  }
];

export const DEMO_INQUIRIES: Inquiry[] = [
  { 
    id: 'inq_1', 
    organizer: 'श्री गणेश तरुण मंडळ', 
    eventType: 'कीर्तन', 
    date: getDate(10), 
    location: 'दादर', 
    taluka: 'मुंबई शहर',
    district: 'मुंबई',
    venue: 'शिवाजी पार्क',
    latitude: 19.0269, 
    longitude: 72.8383,
    contact: '9876543210', 
    status: 'Pending', 
    expectedAudience: 500, 
    details: 'गणेशोत्सव निमित्त सेवा. रात्री ८ ते १०.' 
  },
  { 
    id: 'inq_2', 
    organizer: 'ग्रामस्थ मंडळ, सातारा', 
    eventType: 'सप्ताह', 
    date: getDate(20), 
    location: 'कोरेगाव', 
    taluka: 'कोरेगाव',
    district: 'सातारा',
    venue: 'हनुमान मंदिर',
    latitude: 17.6805, 
    longitude: 74.0183,
    contact: '9876543211', 
    status: 'Confirmed', 
    expectedAudience: 2000, 
    details: 'अखंड हरिनाम सप्ताह समाप्ती काल्याचे कीर्तन.', 
    altContact: '9988776655',
    committeeMembers: [{name: 'रामभाऊ पाटील', phone: '9922334455'}]
  },
  { 
    id: 'inq_3', 
    organizer: 'सरस्वती विद्यालय', 
    eventType: 'प्रवचन', 
    date: getDate(25), 
    location: 'कोल्हापूर', 
    taluka: 'करवीर',
    district: 'कोल्हापूर',
    venue: 'शाळा पटांगण',
    latitude: 16.7050, 
    longitude: 74.2433,
    contact: '9876543212', 
    status: 'Rejected', 
    expectedAudience: 1000, 
    details: 'बालदिन विशेष व्याख्यान.' 
  }
];

export const DEMO_MEDIA: MediaItem[] = [
  { id: 'm1', type: 'video', title: 'पंढरपूर वारी विशेष कीर्तन 2025', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: 'https://picsum.photos/400/225?random=1', category: 'कीर्तन', date: '2025-07-10' },
  { id: 'm2', type: 'image', title: 'गुरु पौर्णिमा उत्सव क्षणचित्रे', url: 'https://picsum.photos/400/300?random=2', category: 'उत्सव', date: '2026-04-15' },
  { id: 'm3', type: 'audio', title: 'संपूर्ण हरिपाठ - चाल क्रमांक १', url: '#', category: 'प्रवचन', date: '2026-03-20', thumbnail: 'https://picsum.photos/400/300?random=3' },
  { id: 'm4', type: 'image', title: 'काकडा आरती दर्शन', url: 'https://picsum.photos/401/300?random=4', category: 'नित्यनेम', date: '2026-02-10' },
  { id: 'm5', type: 'video', title: 'युवा कीर्तनकार मार्गदर्शन', url: 'https://www.youtube.com/embed/xyz', thumbnail: 'https://picsum.photos/400/225?random=5', category: 'प्रबोधन', date: '2026-01-26' },
];

export const DEMO_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'आषाढी वारीचे महत्त्व आणि परंपरा',
    excerpt: 'पंढरपूरची वारी ही केवळ यात्रा नसून तो एक संस्कार आहे. जाणून घेऊया या परंपरेमागचा इतिहास आणि विज्ञानाची सांगड.',
    content: 'विस्तृत लेख...',
    author: 'ह.भ.प. कांचनताई',
    date: '2026-06-01',
    image: 'https://picsum.photos/800/400?random=10',
    category: 'संस्कृती',
    status: 'Published'
  },
  {
    id: 'b2',
    title: 'दैनंदिन जीवनात नामस्मरण',
    excerpt: 'धकाधकीच्या जीवनात मानसिक शांतीसाठी नामस्मरणाचे महत्त्व. विठ्ठल नामाचा महिमा.',
    content: '...',
    author: 'ह.भ.प. कांचनताई',
    date: '2026-06-10',
    image: 'https://picsum.photos/800/401?random=11',
    category: 'अध्यात्म',
    status: 'Published'
  }
];

export const DEMO_SUBSCRIBERS: Subscriber[] = [
  { id: 's1', name: 'माऊली भजनी मंडळ', contact: '9876500001', district: 'पुणे', joinedDate: '2026-01-10' },
  { id: 's2', name: 'वारकरी संप्रदाय, सातारा', contact: '9876500002', district: 'सातारा', joinedDate: '2026-02-15' },
  { id: 's3', name: 'ज्ञानेश्वर शिंदे', contact: '9876500003', district: 'सोलापूर', joinedDate: '2026-03-05' },
];

export const DEMO_SOCIAL_POSTS: SocialPost[] = [
    {
        id: 'sp1', platform: 'YouTube', type: 'video', 
        url: 'https://youtube.com/watch?v=1', thumbnail: 'https://picsum.photos/800/450?random=20',
        caption: 'Ashadhi Ekadashi Special Kirtan Live from Pandharpur | आषाढी विशेष',
        likes: 1200, comments: 45, views: 5000, date: '2 hrs ago', isFeatured: true
    },
    {
        id: 'sp2', platform: 'Instagram', type: 'reel', 
        url: 'https://instagram.com/reel/1', thumbnail: 'https://picsum.photos/400/700?random=21',
        caption: 'Chanting Vitthal Nam ✨ #Bhakti #KanchanShelke #Varkari',
        likes: 850, comments: 20, views: 3200, date: '5 hrs ago', isFeatured: true
    }
];

export const DEMO_ABHANG: Abhang = {
  id: 'daily_1',
  sant: "जगद्गुरु संत तुकाराम महाराज",
  text: `वृक्ष वल्ली आम्हां सोयरीं वनचरें ।
पक्षी ही सुस्वरें आळविती ॥
येणे सुखें रुचे एकांताचा वास ।
नाही गुण दोष अंगा येत ॥`,
  meaning: "निसर्गाच्या सानिध्यात, वृक्ष-वेली आणि पशू-पक्षी हेच आमचे सगेसोयरे आहेत. या एकांतात जे सुख मिळते, तिथे कोणत्याही प्रकारचे गुण-दोष अंगाला लागत नाहीत. मन निर्मळ राहते.",
  date: new Date().toISOString().split('T')[0]
};
