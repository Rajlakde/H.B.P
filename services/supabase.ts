
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const initSupabase = () => {
    const projectUrl = localStorage.getItem('sb_project_url');
    const anonKey = localStorage.getItem('sb_anon_key');

    if (projectUrl && anonKey) {
        try {
            supabase = createClient(projectUrl, anonKey);
            return true;
        } catch (e) {
            console.error("Supabase init failed", e);
            return false;
        }
    }
    return false;
};

export const checkSupabaseConnection = async (url: string, key: string) => {
    try {
        const tempClient = createClient(url, key);
        // Try to fetch a non-existent row just to test connection
        const { error } = await tempClient.from('app_data').select('collection_name').limit(1);
        
        // If error is related to connection/auth, it will fail. 
        // If error is "relation does not exist" (404), connected but table missing.
        // If success (empty array), connected fully.
        if (error && error.code !== 'PGRST116' && error.message !== 'JSON object requested, multiple (or no) rows returned') {
             // Allow table missing error to pass as "connected" but warn
             if(error.code === '42P01') return { success: true, message: 'Connected, but table "app_data" is missing.' };
             throw error;
        }
        return { success: true, message: 'Connection Successful' };
    } catch (e: any) {
        return { success: false, message: e.message || 'Connection failed' };
    }
};

export const fetchFromSupabase = async (collection: string) => {
    if (!supabase) initSupabase();
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('app_data')
            .select('data')
            .eq('collection_name', collection)
            .single();

        if (error) {
            console.warn(`Supabase fetch error for ${collection}:`, error.message);
            return null;
        }
        
        return data?.data || [];
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const saveToSupabase = async (collection: string, data: any) => {
    if (!supabase) initSupabase();
    if (!supabase) throw new Error("Supabase not initialized");

    try {
        const { error } = await supabase
            .from('app_data')
            .upsert(
                { 
                    collection_name: collection, 
                    data: data,
                    updated_at: new Date().toISOString()
                }, 
                { onConflict: 'collection_name' }
            );

        if (error) throw error;
        return true;
    } catch (e) {
        console.error(`Supabase save error for ${collection}:`, e);
        throw e;
    }
};
