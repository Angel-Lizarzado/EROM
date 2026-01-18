'use server';

import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';
import { demoCategories } from '@/lib/demo-data';

export async function getCategories(): Promise<Category[]> {
    try {
        return await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
    } catch (error) {
        console.log('Using demo categories (database unavailable)');
        return demoCategories as Category[];
    }
}

export async function createCategory(name: string): Promise<Category> {
    return prisma.category.create({
        data: { name },
    });
}

export async function deleteCategory(id: number): Promise<void> {
    await prisma.category.delete({
        where: { id },
    });
}
