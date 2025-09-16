import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Get the image path from the URL
    const resolvedParams = await params;
    const imagePath = resolvedParams.path.join('/');
    
    // Construct the full path to the image file
    // The images are stored in the Biomni directory
    const fullPath = join(process.cwd(), '..', 'Biomni', 'saved_pictures', imagePath);
    
    // Check if the file exists
    if (!existsSync(fullPath)) {
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Read the image file
    const imageBuffer = await readFile(fullPath);
    
    // Determine the content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'image/png'; // default
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
    }
    
    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
