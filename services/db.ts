
import { storeMedia, getMedia, getAllMedia, deleteMedia } from './idb';
import { saveJsonToDrive, fetchJsonFromDrive } from './googleDrive';
import { fetchFromSupabase, saveToSupabase, initSupabase } from './supabase';
import { fetchFromGitHub, saveToGitHub, getGitHubConfig } from './github';
import { 
    DEMO_EVENTS, 
    DEMO_INQUIRIES, 
    DEMO_MEDIA, 
    DEMO_BLOGS, 
    DEMO_SUBSCRIBERS, 
    DEMO_ABHANG, 
    DEMO_SOCIAL_POSTS 
} from '../data/demoData';

// Define keys for data collections
export type Collection = 'events' | 'blogs' | 'inquiries' | 'subscribers' | 'settings' | 'media' | 'social_posts';

export type DbMode = 'local' | 'drive' | 'supabase' | 'github';

class DataManager {
    private mode: DbMode;
    // Simulate network delay for realistic skeletons (600ms) only in Demo/Local mode
    private LATENCY = 600; 

    constructor() {
        this.mode = (localStorage.getItem('db_mode') as DbMode) || 'local';
        
        // Initialize connections
        if (this.mode === 'supabase') initSupabase();
    }

    setMode(mode: DbMode) {
        localStorage.setItem('db_mode', mode);
        this.mode = mode;
        window.location.reload(); 
    }

    getMode(): DbMode {
        return this.mode;
    }

    isDriveConnected() {
        return !!localStorage.getItem('drive_config');
    }

    isSupabaseConnected() {
        return !!localStorage.getItem('sb_project_url') && !!localStorage.getItem('sb_anon_key');
    }

    isGitHubConnected() {
        const cfg = getGitHubConfig();
        return !!cfg.token && !!cfg.repo;
    }

    // Helper: Promisified Timeout
    private async delay() {
        return new Promise(resolve => setTimeout(resolve, this.LATENCY));
    }

    // --- JSON DATA OPERATIONS ---

    async getAll(collection: Collection) {
        // Only apply artificial delay in Local/Demo mode
        if (this.mode === 'local') {
            await this.delay();
        }

        let data = [];
        let source = 'empty';

        // 1. SUPABASE MODE
        if (this.mode === 'supabase' && this.isSupabaseConnected()) {
            try {
                const sbData = await fetchFromSupabase(collection);
                if (sbData) {
                    data = sbData;
                    source = 'supabase';
                    localStorage.setItem(`cache_${collection}`, JSON.stringify(data));
                }
            } catch (e) {
                console.warn(`Supabase fetch failed for ${collection}, using cache.`);
            }
        }

        // 2. GITHUB MODE
        else if (this.mode === 'github' && this.isGitHubConnected()) {
            try {
                const ghData = await fetchFromGitHub(collection);
                if (ghData) {
                    data = ghData;
                    source = 'github';
                    localStorage.setItem(`cache_${collection}`, JSON.stringify(data));
                }
            } catch (e) {
                console.warn(`GitHub fetch failed for ${collection}, using cache.`);
            }
        }

        // 3. DRIVE MODE
        else if (this.mode === 'drive' && this.isDriveConnected()) {
            try {
                const folderType = (collection === 'inquiries' || collection === 'subscribers') ? 'private' : 'public';
                const filename = `${collection}.json`;
                const driveData = await fetchJsonFromDrive(filename, folderType);
                if (driveData) {
                    data = driveData;
                    source = 'drive';
                    localStorage.setItem(`cache_${collection}`, JSON.stringify(data));
                }
            } catch (e) {
                console.warn(`Drive fetch failed for ${collection}, checking cache...`);
            }
        }

        // 4. LOCAL / CACHE / FALLBACK
        if (source === 'empty') {
            try {
                const local = localStorage.getItem(`santseva_${collection}`) || localStorage.getItem(`cache_${collection}`);
                if (local) {
                    const parsed = JSON.parse(local);
                    if (Array.isArray(parsed)) {
                        data = parsed;
                        source = 'local';
                    }
                }
            } catch (err) {
                console.error(`Error parsing local data for ${collection}`, err);
                data = []; 
            }
        }

        // 5. SEEDING
        if ((!data || data.length === 0) && source === 'empty') {
            console.log(`Seeding initial demo data for ${collection}...`);
            data = this.getMockData(collection);
            await this.save(collection, data, false);
        }

        return data || [];
    }

    private getMockData(collection: Collection): any[] {
        switch (collection) {
            case 'events': return DEMO_EVENTS;
            case 'inquiries': return DEMO_INQUIRIES;
            case 'media': return DEMO_MEDIA;
            case 'blogs': return DEMO_BLOGS;
            case 'subscribers': return DEMO_SUBSCRIBERS;
            case 'social_posts': return DEMO_SOCIAL_POSTS;
            case 'settings': return [{ id: 'daily_abhang', value: DEMO_ABHANG }];
            default: return [];
        }
    }

    async save(collection: Collection, data: any[], withDelay = true) {
        if (withDelay && this.mode === 'local') await this.delay();

        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(`santseva_${collection}`, jsonString);
            localStorage.setItem(`cache_${collection}`, jsonString);

            // Cloud Sync logic
            if (this.mode === 'supabase' && this.isSupabaseConnected()) {
                saveToSupabase(collection, data)
                    .then(() => console.log(`Synced ${collection} to Supabase`))
                    .catch((e) => console.error(`Failed to sync ${collection} to Supabase`, e));
            }
            else if (this.mode === 'github' && this.isGitHubConnected()) {
                saveToGitHub(collection, data)
                    .then(() => console.log(`Synced ${collection} to GitHub`))
                    .catch((e) => console.error(`Failed to sync ${collection} to GitHub`, e));
            }
            else if (this.mode === 'drive' && this.isDriveConnected()) {
                const folderType = (collection === 'inquiries' || collection === 'subscribers') ? 'private' : 'public';
                const filename = `${collection}.json`;
                saveJsonToDrive(filename, data, folderType)
                    .then(() => console.log(`Synced ${collection} to Google Drive`))
                    .catch((e) => console.error(`Failed to sync ${collection} to Drive`, e));
            }
        } catch (e) {
            console.error("Save failed", e);
            throw new Error("Data Save Failed");
        }
    }

    // --- MEDIA OPERATIONS ---

    async saveMedia(file: File) {
        const id = Date.now().toString();
        const reader = new FileReader();
        return new Promise<{id: string, url: string}>((resolve, reject) => {
            reader.onload = async () => {
                const result = reader.result as string;
                try {
                    await storeMedia(id, result, file.type);
                    resolve({ id, url: result });
                } catch (e) {
                    reject(e);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async deleteMediaFile(id: string) {
        await deleteMedia(id);
    }

    async getMediaList() {
        if (this.mode === 'local') await this.delay(); 
        return await getAllMedia();
    }
}

export const db = new DataManager();
