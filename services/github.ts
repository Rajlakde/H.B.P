
// Handles GitHub API interactions for CMS functionality

interface GitHubFileResponse {
  sha: string;
  content: string;
  encoding: string;
}

export const getGitHubConfig = () => {
  return {
    token: localStorage.getItem('gh_token') || '',
    owner: localStorage.getItem('gh_owner') || '',
    repo: localStorage.getItem('gh_repo') || '',
    branch: localStorage.getItem('gh_branch') || 'main'
  };
};

// Helper to handle UTF-8 strings in Base64 (needed for Marathi text)
const toBase64 = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)));
};

const fromBase64 = (str: string) => {
    return decodeURIComponent(escape(atob(str)));
};

export const validateGitHubConnection = async (token: string, owner: string, repo: string) => {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.ok;
    } catch (e) {
        return false;
    }
};

export const fetchFromGitHub = async (collection: string) => {
    const { token, owner, repo, branch } = getGitHubConfig();
    if (!token || !owner || !repo) throw new Error("GitHub credentials missing");

    const path = `data/${collection}.json`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) {
            return []; // File doesn't exist yet, return empty array
        }

        if (!response.ok) throw new Error("Failed to fetch from GitHub");

        const data: GitHubFileResponse = await response.json();
        const jsonContent = fromBase64(data.content);
        return JSON.parse(jsonContent);
    } catch (error) {
        console.error(`GitHub Fetch Error (${collection}):`, error);
        return null;
    }
};

export const saveToGitHub = async (collection: string, data: any[]) => {
    const { token, owner, repo, branch } = getGitHubConfig();
    if (!token || !owner || !repo) throw new Error("GitHub credentials missing");

    const path = `data/${collection}.json`;
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const content = toBase64(JSON.stringify(data, null, 2));
    const message = `Update ${collection} via Admin Dashboard`;

    // 1. Get current SHA if file exists (needed for update)
    let sha = '';
    try {
        const getRes = await fetch(`${url}?ref=${branch}`, {
            headers: { 'Authorization': `token ${token}` }
        });
        if (getRes.ok) {
            const fileData = await getRes.json();
            sha = fileData.sha;
        }
    } catch (e) {
        // Ignore error, file might not exist
    }

    // 2. PUT request to create or update
    const body: any = {
        message,
        content,
        branch
    };
    if (sha) body.sha = sha;

    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to save to GitHub");
    }

    return true;
};
