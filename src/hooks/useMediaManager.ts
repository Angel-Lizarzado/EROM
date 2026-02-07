'use client';

import { useState, useCallback } from 'react';

export function useMediaManager(initialMedia: string[] = []) {
    const [media, setMedia] = useState<string[]>(initialMedia);

    const addMedia = useCallback((url: string) => {
        if (url && !media.includes(url)) {
            setMedia(prev => [...prev, url]);
        }
    }, [media]);

    const removeMedia = useCallback((index: number) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    }, []);

    const moveMedia = useCallback((index: number, direction: 'left' | 'right') => {
        setMedia(prev => {
            const newMedia = [...prev];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;

            if (targetIndex < 0 || targetIndex >= newMedia.length) {
                return prev;
            }

            [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
            return newMedia;
        });
    }, []);

    const resetMedia = useCallback((newMedia: string[]) => {
        setMedia(newMedia);
    }, []);

    return {
        media,
        addMedia,
        removeMedia,
        moveMedia,
        resetMedia,
    };
}
