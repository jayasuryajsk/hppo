import { put } from '@vercel/blob';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file || file.type !== 'application/pdf') {
      return new Response('Invalid file type. Only PDFs are supported.', { 
        status: 400 
      });
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return Response.json({
      url: blob.url,
      success: true
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new Response('Error uploading file', { status: 500 });
  }
} 