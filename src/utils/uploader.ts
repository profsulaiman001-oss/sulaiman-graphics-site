/**
 * Utility to handle streaming file uploads directly to your GitHub repository storage branch
 * Powered by Vite Environment Variables
 */

export async function uploadToGitHubStorage(file: File | Blob, customFileName?: string): Promise<string | null> {
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
    // Determine the original filename securely
    let originalName = "";
    if (file instanceof File) {
      originalName = file.name;
    } else {
      originalName = customFileName || `voicenote_${Date.now()}.webm`;
    }

    // Sanitize file name to prevent invalid URL breaking paths
    const cleanFileName = originalName.replace(/[^a-zA-Z0-9.]/g, "_");
    
    // Ensure accurate extension handling for audio blobs
    let uniquePath = `chat-attachments/${Date.now()}_${cleanFileName}`;
    if (!(file instanceof File) && !uniquePath.toLowerCase().endsWith(".webm")) {
      uniquePath += ".webm";
    }

    // Convert file buffer to base64 stream string for the GitHub API delivery
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const resultString = reader.result as string;
        const base64String = resultString.split(",")[1];
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
        message: `Upload chat attachment: ${originalName}`,
        content: contentBase64,
        branch: "main"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to commit chunk stream to GitHub.");
    }

    // Return clean URL path structure using precise URL coding to avoid 404s
    return `https://raw.githubusercontent.com/${owner}/${repo}/main/${uniquePath}`;

  } catch (error) {
    console.error("Error inside uploadToGitHubStorage utility:", error);
    return null;
  }
}
