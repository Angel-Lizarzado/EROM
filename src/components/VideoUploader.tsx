'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Link as LinkIcon, Film } from 'lucide-react';
import { uploadImage } from '@/actions/upload'; // Reuse the generic upload action

interface VideoUploaderProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
}

export default function VideoUploader({ value, onChange, placeholder = 'URL de video o sube un archivo' }: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'url' | 'upload'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onChange(result.url);
                setMode('url'); // Switch to URL view to see preview
            } else {
                setError(result.error || 'Error al subir video');
            }
        } catch (err) {
            setError('Error al subir video');
        } finally {
            setUploading(false);
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
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
                    Subir MP4
                </button>
            </div>

            {/* URL Input */}
            {mode === 'url' && (
                <div className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={handleUrlChange}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-background border-transparent focus:border-primary focus:bg-white focus:ring-0 transition-colors text-sm pr-10"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-text-muted hover:text-red-500 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
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
                        accept="video/mp4,video/webm"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-sm text-text-muted">Subiendo video...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Film className="h-8 w-8 text-text-muted" />
                            <p className="text-sm text-text-muted">
                                Clic para seleccionar video
                            </p>
                            <p className="text-xs text-text-muted/60">
                                MP4 o WebM (máx. 50MB)
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="text-red-500 text-xs">{error}</p>
            )}

            {/* Preview (only for URL mode and if value exists) */}
            {value && mode === 'url' && (
                <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-border mt-2">
                    <video
                        src={value}
                        controls
                        className="w-full h-full object-contain"
                        // @ts-ignore
                        referrerPolicy="no-referrer"
                    />
                </div>
            )}
        </div>
    );
}
