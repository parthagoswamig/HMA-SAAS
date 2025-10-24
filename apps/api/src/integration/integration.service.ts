import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class IntegrationService {
  private integrations: any[] = [];

  async create(createDto: any, tenantId: string) {
    const integration = {
      id: Date.now().toString(),
      ...createDto,
      tenantId,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.integrations.push(integration);
    return {
      success: true,
      message: 'Integration config created (in-memory)',
      data: integration,
    };
  }

  async findAll(tenantId: string) {
    const data = this.integrations.filter((i) => i.tenantId === tenantId);
    return { success: true, data };
  }

  async findOne(id: string, tenantId: string) {
    const integration = this.integrations.find(
      (i) => i.id === id && i.tenantId === tenantId,
    );
    if (!integration) throw new NotFoundException('Integration not found');
    return { success: true, data: integration };
  }

  async update(id: string, updateDto: any, tenantId: string) {
    const index = this.integrations.findIndex(
      (i) => i.id === id && i.tenantId === tenantId,
    );
    if (index === -1) throw new NotFoundException('Integration not found');
    this.integrations[index] = {
      ...this.integrations[index],
      ...updateDto,
      updatedAt: new Date(),
    };
    return {
      success: true,
      message: 'Integration updated',
      data: this.integrations[index],
    };
  }

  async testConnection(id: string, tenantId: string) {
    const integration = this.integrations.find(
      (i) => i.id === id && i.tenantId === tenantId,
    );
    if (!integration) throw new NotFoundException('Integration not found');
    return {
      success: true,
      message: 'Connection test successful (placeholder)',
      data: { status: 'CONNECTED', latency: 45 },
    };
  }

  async getStats(tenantId: string) {
    const total = this.integrations.filter(
      (i) => i.tenantId === tenantId,
    ).length;
    const active = this.integrations.filter(
      (i) => i.tenantId === tenantId && i.status === 'ACTIVE',
    ).length;
    return { success: true, data: { total, active } };
  }
}
