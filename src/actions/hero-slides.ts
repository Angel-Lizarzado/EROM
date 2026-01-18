'use server';

import { prisma } from '@/lib/prisma';
import { HeroSlide } from '@prisma/client';
import { demoSlides } from '@/lib/demo-data';

export async function getHeroSlides(): Promise<HeroSlide[]> {
    try {
        return await prisma.heroSlide.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    } catch (error) {
        console.log('Using demo slides (database unavailable)');
        return demoSlides.filter(s => s.isActive) as HeroSlide[];
    }
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
    try {
        return await prisma.heroSlide.findMany({
            orderBy: { order: 'asc' },
        });
    } catch (error) {
        console.log('Using demo slides (database unavailable)');
        return demoSlides as HeroSlide[];
    }
}

export async function createHeroSlide(data: {
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    image: string;
    badge?: string;
    isActive?: boolean;
    order?: number;
}): Promise<HeroSlide> {
    return prisma.heroSlide.create({
        data: {
            ...data,
            isActive: data.isActive ?? true,
            order: data.order ?? 0,
        },
    });
}

export async function updateHeroSlide(
    id: number,
    data: {
        title?: string;
        subtitle?: string;
        buttonText?: string;
        buttonLink?: string;
        image?: string;
        badge?: string;
        isActive?: boolean;
        order?: number;
    }
): Promise<HeroSlide> {
    return prisma.heroSlide.update({
        where: { id },
        data,
    });
}

export async function deleteHeroSlide(id: number): Promise<void> {
    await prisma.heroSlide.delete({
        where: { id },
    });
}
