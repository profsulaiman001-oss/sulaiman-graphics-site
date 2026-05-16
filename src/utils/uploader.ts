/**
 * Utility to handle streaming file uploads directly to your GitHub repository storage branch
 * Powered by Vite Environment Variables
 */

export async function uploadToGitHubStorage(file: File): Promise<string | null> {
  // Read the newly defined Vite environment variables securely
  const token = import.meta.env.VITE_GITHUB_STORAGE_TOKEN;
  const owner = import.meta.env.VITE_GITHUB_STORAGE_OWNER;
  const repo = import.meta.env.VITE_GITHUB_STORAGE_REPO;

  // Safety fallback check if environment variables didn't load during compilation
  if (!token || !owner || !repo) {
    console.error("Missing configuration variables for GitHub Storage.");
    return null;
  }

  try {
    // Generate a clean, unique file path using timestamping to prevent overrides
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniquePath = `chat-attachments/${Date.now()}_${cleanFileName}`;

    // Convert file buffer to base64 stream string for the GitHub API delivery
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
    
    reader.readAsDataURL(file);
    const contentBase64 = await base64Promise;

    // Fire request to the GitHub repository contents endpoint
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${uniquePath}`;
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Upload chat attachment: ${file.name}`,
        content: contentBase64,
        branch: "main" // Direct target branch
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to commit chunk stream to GitHub.");
    }

    const data = await response.json();

    // Route audio directly through raw.githubusercontent to allow timeline buffering
    // Route images/files through jsDelivr to avoid canvas/DOM image CORS errors
    if (file.type.startsWith("audio/") || file.name.includes("voicenote")) {
      return data.content.download_url; // Direct raw URL for pristine audio streaming
    } else {
      return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@main/${uniquePath}`; // High-perf CDN for images/files
    }

  } catch (error) {
    console.error("Error inside uploadToGitHubStorage utility:", error);
    return null;
  }
}
