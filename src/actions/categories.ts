'use server';

import { prisma } from '@/lib/prisma';
import { Category } from '@prisma/client';

export type CategoryWithCount = Category & {
    _count: { products: number };
};

export async function getCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' },
    });
}

export async function getCategoriesWithCount(): Promise<CategoryWithCount[]> {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });
}

export async function createCategory(name: string): Promise<Category> {
    return prisma.category.create({
        data: { name },
    });
}

export async function updateCategory(id: number, name: string): Promise<Category> {
    return prisma.category.update({
        where: { id },
        data: { name },
    });
}

export async function deleteCategory(id: number): Promise<void> {
    // Verificar si tiene productos
    const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
    });

    if (category && category._count.products > 0) {
        throw new Error('No se puede eliminar una categoría con productos asociados');
    }

    await prisma.category.delete({
        where: { id },
    });
}
