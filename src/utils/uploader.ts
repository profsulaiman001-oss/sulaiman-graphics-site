interface UploadResponse {
  success: boolean;
  url: string;
  fallbackUrl: string;
  path: string;
}

/**
 * Utility to upload files securely to your massive GitHub Storage Drive via Vercel Serverless layers.
 * @param file Raw File object from browser input primitives
 * @param folder Target folder categorization bucket ('chat', 'products', 'deliverables')
 */
export const uploadToGitHubStorage = async (file: File, folder: 'chat' | 'products' | 'deliverables' | 'general' = 'general'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data,
            folder: folder,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Server rejected file upload stream.');
        }

        // Return the clean CDN image/file URL to be saved directly into Supabase database tables
        resolve(result.url);
      } catch (err: any) {
        reject(err.message || err);
      }
    };

    reader.onerror = (error) => reject(error);
  });
};
