import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ResearchService {
  private projects: any[] = [];

  async create(createDto: any, tenantId: string) {
    const project = {
      id: Date.now().toString(),
      ...createDto,
      tenantId,
      status: 'ACTIVE',
      createdAt: new Date(),
    };
    this.projects.push(project);
    return {
      success: true,
      message: 'Research project created (in-memory)',
      data: project,
    };
  }

  async findAll(tenantId: string) {
    const data = this.projects.filter((p) => p.tenantId === tenantId);
    return { success: true, data };
  }

  async findOne(id: string, tenantId: string) {
    const project = this.projects.find(
      (p) => p.id === id && p.tenantId === tenantId,
    );
    if (!project) throw new NotFoundException('Project not found');
    return { success: true, data: project };
  }

  async update(id: string, updateDto: any, tenantId: string) {
    const index = this.projects.findIndex(
      (p) => p.id === id && p.tenantId === tenantId,
    );
    if (index === -1) throw new NotFoundException('Project not found');
    this.projects[index] = {
      ...this.projects[index],
      ...updateDto,
      updatedAt: new Date(),
    };
    return {
      success: true,
      message: 'Project updated',
      data: this.projects[index],
    };
  }

  async getStats(tenantId: string) {
    const total = this.projects.filter((p) => p.tenantId === tenantId).length;
    const active = this.projects.filter(
      (p) => p.tenantId === tenantId && p.status === 'ACTIVE',
    ).length;
    return { success: true, data: { total, active } };
  }
}
