import { AuditLog } from '../models/AuditLog.ts';

export const logAudit = async (userId: string | null, action: string, details: any = {}, req?: any) => {
  try {
    const log = new AuditLog({
      userId,
      action,
      ip: req?.ip || 'unknown',
      userAgent: req?.headers['user-agent'] || 'unknown',
      details,
      timestamp: new Date()
    });
    await log.save();
  } catch (error) {
    console.error('Audit log error:', error);
  }
};
