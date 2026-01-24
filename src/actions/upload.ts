'use server';

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function uploadImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: 'No se recibió ningún archivo' };
        }

        // Validate file type
        const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const videoTypes = ['video/mp4', 'video/webm'];
        const validTypes = [...imageTypes, ...videoTypes];

        if (!validTypes.includes(file.type)) {
            return { success: false, error: 'Tipo de archivo no válido. Use JPG, PNG, WebP, GIF, MP4 o WebM' };
        }

        // Validate file size
        // Images: 5MB, Videos: 50MB
        const isVideo = videoTypes.includes(file.type);
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;

        if (file.size > maxSize) {
            return { success: false, error: `El archivo es muy grande. Máximo ${isVideo ? '50MB' : '5MB'}` };
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
        const filepath = path.join(uploadsDir, filename);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the public URL
        const url = `/uploads/${filename}`;
        return { success: true, url };
    } catch (error) {
        console.error('Error uploading file:', error);
        return { success: false, error: 'Error al subir el archivo' };
    }
}
