'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Link as LinkIcon, Image, Video } from 'lucide-react';
import { uploadImage } from '@/actions/upload';

interface MediaUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    accept?: 'image' | 'video' | 'both';
}

export default function MediaUploader({
    value,
    onChange,
    placeholder = 'URL o archivo de imagen/video',
    accept = 'both'
}: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'url' | 'upload'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Determinar tipos de archivo aceptados
    const getAcceptedTypes = () => {
        if (accept === 'image') return 'image/jpeg,image/png,image/webp,image/gif';
        if (accept === 'video') return 'video/mp4,video/webm';
        return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // uploadImage handles both images and videos automatically
            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onChange(result.url);
            } else {
                setError(result.error || 'Error al subir archivo');
            }
        } catch (err) {
            setError('Error al subir archivo');
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    // Detectar si el valor actual es video
    const isVideoUrl = (url: string) => {
        return url.toLowerCase().match(/\.(mp4|webm)$/) || url.includes('resource_type=video');
    };

    return (
        <div className="space-y-3">
            {/* Mode Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'url'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-muted hover:bg-gray-100'
                        }`}
                >
                    <LinkIcon className="h-4 w-4" />
                    URL
                </button>
                <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${mode === 'upload'
                        ? 'bg-primary text-white'
                        : 'bg-background text-text-muted hover:bg-gray-100'
                        }`}
                >
                    <Upload className="h-4 w-4" />
                    Subir
                </button>
            </div>

            {/* URL Input */}
            {mode === 'url' && (
                <input
                    type="text"
                    value={value}
                    onChange={handleUrlChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm"
                />
            )}

            {/* File Upload */}
            {mode === 'upload' && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploading
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary hover:bg-primary/5'
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={getAcceptedTypes()}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-text-muted">Subiendo...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-2">
                                {(accept === 'both' || accept === 'image') && (
                                    <Image className="h-8 w-8 text-text-muted" />
                                )}
                                {(accept === 'both' || accept === 'video') && (
                                    <Video className="h-8 w-8 text-text-muted" />
                                )}
                            </div>
                            <p className="text-sm text-text-muted">
                                Clic para seleccionar {
                                    accept === 'image' ? 'imagen' :
                                        accept === 'video' ? 'video' :
                                            'imagen o video'
                                }
                            </p>
                            <p className="text-xs text-text-muted/60">
                                {accept === 'image' && 'JPG, PNG, WebP o GIF (máx. 5MB)'}
                                {accept === 'video' && 'MP4 o WebM (máx. 50MB)'}
                                {accept === 'both' && 'Imágenes (JPG, PNG, WebP, GIF) o Videos (MP4, WebM)'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Preview */}
            {value && (
                <div className="relative">
                    {isVideoUrl(value) ? (
                        <div className="relative h-32 w-full rounded-xl bg-black border border-border overflow-hidden">
                            <video
                                src={value}
                                className="w-full h-full object-cover"
                                controls
                            />
                        </div>
                    ) : (
                        <div
                            className="h-32 w-full rounded-xl bg-cover bg-center border border-border"
                            style={{ backgroundImage: `url('${value}')` }}
                        />
                    )}
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-4 w-4 text-text-muted" />
                    </button>
                </div>
            )}
        </div>
    );
}
