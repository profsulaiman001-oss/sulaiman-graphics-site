import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb', // Adjusts Vercel's parsing ceiling for high-res mockups
    },
  },
};

export default async function handler(req: any, res: any) {
  // Only allow POST requests for file uploads
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fileName, fileType, fileData, folder = 'general' } = req.body;

    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'Missing required file data fields.' });
    }

    const token = process.env.GITHUB_STORAGE_TOKEN;
    const repo = process.env.GITHUB_STORAGE_REPO;
    const owner = process.env.GITHUB_STORAGE_OWNER;

    if (!token || !repo || !owner) {
      return res.status(500).json({ error: 'Storage environment variables are not configured on Vercel.' });
    }

    // Sanitize filename to avoid route breaks and append a unique timestamp to prevent accidental overwrites
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `uploads/${folder}/${uniqueFileName}`;

    // Extract raw base64 content clean of data URL headers
    const base64Content = fileData.split(',')[1] || fileData;

    // Execute direct repository commit via GitHub REST API v3
    const githubUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    
    const githubResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `system: uploaded asset ${uniqueFileName} from client portal`,
        content: base64Content,
      }),
    });

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      return res.status(githubResponse.status).json({ 
        error: 'Failed uploading file stream to storage vault.', 
        details: errorText 
      });
    }

    // Construct highly optimized CDN links using JSDelivr proxy for fast global load speeds on client dashboards
    const cdnUrl = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${filePath}`;
    const fallbackUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filePath}`;

    return res.status(200).json({
      success: true,
      url: cdnUrl,
      fallbackUrl: fallbackUrl,
      path: filePath
    });

  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Upload Exception', details: error.message });
  }
}
