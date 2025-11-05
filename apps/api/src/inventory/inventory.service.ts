import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: any, tenantId: string) {
    const item = await this.prisma.inventoryItem.create({
      data: { ...createDto, tenantId },
    });
    return { success: true, message: 'Item created', data: item };
  }

  async findAll(tenantId: string, query: any) {
    const { page = 1, limit = 10, category } = query;
    const where: any = { tenantId, isActive: true };
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        skip: (page - 1) * limit,
        take: Number(limit),
        orderBy: { name: 'asc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);
    return {
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async getLowStock(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        isActive: true,
        quantity: { lte: this.prisma.inventoryItem.fields.minQuantity },
      },
      orderBy: { quantity: 'asc' },
    });
    return { success: true, data: items };
  }

  async findOne(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId, isActive: true },
    });
    if (!item) throw new NotFoundException('Item not found');
    return { success: true, data: item };
  }

  async update(id: string, updateDto: any, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Item not found');
    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: updateDto,
    });
    return { success: true, message: 'Item updated', data: updated };
  }

  async adjustStock(id: string, quantity: number, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Item not found');
    const updated = await this.prisma.inventoryItem.update({
      where: { id },
      data: { quantity: item.quantity + quantity },
    });
    return { success: true, message: 'Stock adjusted', data: updated };
  }

  async remove(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException('Item not found');
    await this.prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, message: 'Item deleted' };
  }

  async getStats(tenantId: string) {
    const [total, lowStock, totalValue] = await Promise.all([
      this.prisma.inventoryItem.count({ where: { tenantId, isActive: true } }),
      this.prisma.inventoryItem.count({
        where: {
          tenantId,
          isActive: true,
          quantity: { lte: this.prisma.inventoryItem.fields.minQuantity },
        },
      }),
      this.prisma.inventoryItem.aggregate({
        where: { tenantId, isActive: true },
        _sum: { quantity: true },
      }),
    ]);
    return {
      success: true,
      data: { total, lowStock, totalQuantity: totalValue._sum.quantity || 0 },
    };
  }
}
