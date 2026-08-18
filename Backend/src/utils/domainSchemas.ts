import { z } from "zod";

export const createStaffSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(8),
  role: z.enum(["MANAGER", "CONTRACTOR", "ADMIN"]),
});

export const userStatusSchema = z.object({
  status: z.enum(["ACTIVE", "DISABLED"]),
});

export const buildingSchema = z.object({
  name: z.string().min(2),
  address: z.string().min(5),
  description: z.string().optional(),
  managerId: z.string().uuid().optional(),
});

export const apartmentSchema = z.object({
  buildingId: z.string().uuid().optional(),
  apartmentNumber: z.string().min(1),
  floor: z.number().int().min(0),
  bedrooms: z.number().int().min(0),
  monthlyRent: z.number().positive(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
  tenantId: z.string().uuid().optional(),
});

export const maintenanceCreateSchema = z.object({
  apartmentId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(["Plumbing", "Electrical", "HVAC", "Appliance", "Structural", "Cleaning", "Other"]),
  priority: z.enum(["Low", "Medium", "High", "Emergency"]),
});

export const maintenanceAssignSchema = z.object({
  contractorId: z.string().uuid(),
});

export const maintenanceUpdateSchema = z.object({
  message: z.string().min(2),
  status: z.enum(["Submitted", "Under Review", "Assigned", "In Progress", "Completed", "Cancelled"]).optional(),
});

export const paymentVerifySchema = z.object({
  status: z.enum(["Verified", "Rejected"]),
});

export const securityReportCreateSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  location: z.string().min(2),
  priority: z.enum(["Low", "Medium", "High", "Emergency"]),
});

export const securityReportStatusSchema = z.object({
  status: z.enum(["Reported", "Under Review", "Investigating", "Resolved"]),
});

export const announcementSchema = z.object({
  title: z.string().min(2),
  message: z.string().min(5),
  audienceType: z.enum(["All Tenants", "Specific Building", "Specific Tenant"]),
  audienceBuildingId: z.string().uuid().optional(),
  audienceTenantId: z.string().uuid().optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
});
