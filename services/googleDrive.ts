
// Handles Google Drive API interactions
// Requires <script src="https://apis.google.com/js/api.js"></script> in index.html

const CLIENT_ID = localStorage.getItem('g_client_id') || ''; 
const API_KEY = localStorage.getItem('g_api_key') || ''; 
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Names for our Folder Structure
const ROOT_FOLDER_NAME = 'HBP_Kanchan_Shelke_Portfolio_Data';
const INNER_DB_FOLDER = 'Inner_Database'; // Public Read
const MEDIA_FOLDER = 'Media_Storage';     // Public Read
const PRIVATE_FOLDER = 'Secure_Data';     // Private (Inquiries, etc)

export const initGapi = () => {
    return new Promise<void>((resolve, reject) => {
        const gapi = (window as any).gapi;
        if (!gapi) {
            reject('Google API script not loaded');
            return;
        }
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
                });
                gapiInited = true;
                if (gisInited) resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

export const initGis = (onTokenReceived: (token: any) => void) => {
    return new Promise<void>((resolve, reject) => {
        const google = (window as any).google;
        if (!google) {
            reject('Google Identity script not loaded');
            return;
        }
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    localStorage.setItem('g_access_token', tokenResponse.access_token);
                    onTokenReceived(tokenResponse);
                }
            },
        });
        gisInited = true;
        if (gapiInited) resolve();
        else resolve(); // Resolve anyway, wait for gapi
    });
};

export const signInGoogle = () => {
    if (tokenClient) {
        tokenClient.requestAccessToken();
    } else {
        console.error("Token Client not initialized");
    }
};

export const signOutGoogle = () => {
    const google = (window as any).google;
    const token = localStorage.getItem('g_access_token');
    if (token && google) {
        google.accounts.oauth2.revoke(token, () => {
            localStorage.removeItem('g_access_token');
            window.location.reload();
        });
    }
};

// --- Drive Operations ---

// Helper: Find file by name in a parent
const findFile = async (name: string, parentId?: string, mimeType?: string) => {
    let query = `name = '${name}' and trashed = false`;
    if (parentId) query += ` and '${parentId}' in parents`;
    if (mimeType) query += ` and mimeType = '${mimeType}'`;

    const response = await (window as any).gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    return response.result.files[0]; // Return first match
};

// Helper: Create Folder
const createFolder = async (name: string, parentId?: string) => {
    const fileMetadata: any = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) fileMetadata.parents = [parentId];

    const response = await (window as any).gapi.client.drive.files.create({
        resource: fileMetadata,
        fields: 'id',
    });
    return response.result;
};

// Helper: Set Permission (Make Public)
const setPublicPermission = async (fileId: string) => {
    await (window as any).gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
            role: 'reader',
            type: 'anyone',
        },
    });
};

// **CORE: Initialize/Verify Folder Structure**
export const initializeDriveStructure = async () => {
    try {
        const config: any = {};

        // 1. Root
        let root = await findFile(ROOT_FOLDER_NAME, undefined, 'application/vnd.google-apps.folder');
        if (!root) {
            root = await createFolder(ROOT_FOLDER_NAME);
        }
        config.rootId = root.id;

        // 2. Inner Database (JSONs)
        let innerDb = await findFile(INNER_DB_FOLDER, root.id, 'application/vnd.google-apps.folder');
        if (!innerDb) {
            innerDb = await createFolder(INNER_DB_FOLDER, root.id);
            await setPublicPermission(innerDb.id); // Make Public
        }
        config.innerDbId = innerDb.id;

        // 3. Media Storage
        let mediaFolder = await findFile(MEDIA_FOLDER, root.id, 'application/vnd.google-apps.folder');
        if (!mediaFolder) {
            mediaFolder = await createFolder(MEDIA_FOLDER, root.id);
            await setPublicPermission(mediaFolder.id); // Make Public
        }
        config.mediaFolderId = mediaFolder.id;

        // 4. Secure Data (Private)
        let secureFolder = await findFile(PRIVATE_FOLDER, root.id, 'application/vnd.google-apps.folder');
        if (!secureFolder) {
            secureFolder = await createFolder(PRIVATE_FOLDER, root.id);
            // Do NOT set public permission
        }
        config.secureFolderId = secureFolder.id;

        localStorage.setItem('drive_config', JSON.stringify(config));
        return config;

    } catch (error) {
        console.error("Drive Structure Error:", error);
        throw error;
    }
};

// **CRUD: JSON Data**
export const saveJsonToDrive = async (filename: string, data: any, folderType: 'public' | 'private') => {
    const config = JSON.parse(localStorage.getItem('drive_config') || '{}');
    const folderId = folderType === 'public' ? config.innerDbId : config.secureFolderId;
    
    if (!folderId) throw new Error("Drive structure not initialized");

    // Check if file exists to update or create
    const existingFile = await findFile(filename, folderId, 'application/json');
    const fileContent = JSON.stringify(data);
    const fileMetadata = {
        name: filename,
        mimeType: 'application/json',
        parents: !existingFile ? [folderId] : undefined
    };

    const multipartRequestBody =
        `\r\n--foo_bar_baz\r\nContent-Type: application/json\r\n\r\n` +
        JSON.stringify(fileMetadata) +
        `\r\n--foo_bar_baz\r\nContent-Type: application/json\r\n\r\n` +
        fileContent +
        `\r\n--foo_bar_baz--`;

    const method = existingFile ? 'PATCH' : 'POST';
    const path = existingFile ? `/upload/drive/v3/files/${existingFile.id}` : '/upload/drive/v3/files';

    await (window as any).gapi.client.request({
        path: path,
        method: method,
        params: { uploadType: 'multipart' },
        headers: { 'Content-Type': 'multipart/related; boundary=foo_bar_baz' },
        body: multipartRequestBody
    });
};

export const fetchJsonFromDrive = async (filename: string, folderType: 'public' | 'private') => {
    const config = JSON.parse(localStorage.getItem('drive_config') || '{}');
    const folderId = folderType === 'public' ? config.innerDbId : config.secureFolderId;
    
    if (!folderId) return null;

    const file = await findFile(filename, folderId, 'application/json');
    if (!file) return null;

    const response = await (window as any).gapi.client.drive.files.get({
        fileId: file.id,
        alt: 'media'
    });
    
    return response.result;
};
