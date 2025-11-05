import { Prisma } from '@prisma/client';
import { getRequestContext } from '../common/als/async-context';

// This list is generated heuristically: models expected to have tenantId
const TENANTED_MODELS = new Set<string>([
  'Department','Staff','Patient','Appointment','Invoice','InventoryItem','MedicalRecord',
  'LabOrder','LabOrderTest','LabTest','Medication','AuditLog','Notification','Bed','Ward',
  'Room','Surgery','InsuranceClaim','EmergencyCase','Report','FinanceTransaction',
  'Subscription','SubscriptionPlan','Tenant','User','Role','Permission','InvoiceItem'
]);

function ensureWhere(where: any) { return where || {}; }

export function tenantFilterMiddleware() {
  return async (params: any, next: any) => {
    const ctx = getRequestContext();
    const t = ctx.tenantId;
    const m = params.model;

    // Only act if model is in our set and tenant is known
    if (t && m && TENANTED_MODELS.has(m)) {
      // Read operations: enforce tenantId filter
      const readOps = ['findMany','findFirst','findUnique','count','aggregate','groupBy'];
      if (readOps.includes(params.action)) {
        params.args = params.args || {};
        if (params.action === 'findUnique') {
          // Unique queries usually use unique fields; we cannot inject tenantId safely
          // If your unique indexes include tenantId, prefer findFirst with where+tenantId
        } else {
          params.args.where = ensureWhere(params.args.where);
          // Merge existing where with tenantId (AND)
          params.args.where = { AND: [ params.args.where, { tenantId: t } ] };
        }
      }

      // Write operations: enforce tenantId on create/update
      const writeOps = ['create','createMany','update','updateMany','upsert'];
      if (writeOps.includes(params.action)) {
        params.args = params.args || {};
        if (params.action === 'create' || params.action === 'upsert') {
          params.args.data = params.args.data || {};
          if (!('tenantId' in params.args.data)) {
            params.args.data.tenantId = t;
          }
        }
        if (params.action === 'update' || params.action === 'updateMany') {
          params.args.where = ensureWhere(params.args.where);
          params.args.where = { AND: [ params.args.where, { tenantId: t } ] };
        }
      }

      // Delete operations: scope by tenant
      const delOps = ['delete','deleteMany'];
      if (delOps.includes(params.action)) {
        params.args = params.args || {};
        params.args.where = ensureWhere(params.args.where);
        params.args.where = { AND: [ params.args.where, { tenantId: t } ] };
      }
    }

    return next(params);
  };
}
