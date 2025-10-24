import { Injectable } from '@nestjs/common';

@Injectable()
export class QualityService {
  private metrics: any[] = [];
  private incidents: any[] = [];

  async createMetric(createDto: any, tenantId: string) {
    const metric = {
      id: Date.now().toString(),
      ...createDto,
      tenantId,
      createdAt: new Date(),
    };
    this.metrics.push(metric);
    return {
      success: true,
      message: 'Quality metric created (in-memory)',
      data: metric,
    };
  }

  async getMetrics(tenantId: string) {
    const data = this.metrics.filter((m) => m.tenantId === tenantId);
    return { success: true, data };
  }

  async reportIncident(createDto: any, tenantId: string) {
    const incident = {
      id: Date.now().toString(),
      ...createDto,
      tenantId,
      status: 'OPEN',
      createdAt: new Date(),
    };
    this.incidents.push(incident);
    return {
      success: true,
      message: 'Incident reported (in-memory)',
      data: incident,
    };
  }

  async getIncidents(tenantId: string) {
    const data = this.incidents.filter((i) => i.tenantId === tenantId);
    return { success: true, data };
  }

  async getStats(tenantId: string) {
    const totalMetrics = this.metrics.filter(
      (m) => m.tenantId === tenantId,
    ).length;
    const totalIncidents = this.incidents.filter(
      (i) => i.tenantId === tenantId,
    ).length;
    return { success: true, data: { totalMetrics, totalIncidents } };
  }
}
