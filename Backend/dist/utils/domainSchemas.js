"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdateSchema = exports.announcementSchema = exports.securityReportStatusSchema = exports.securityReportCreateSchema = exports.paymentVerifySchema = exports.maintenanceUpdateSchema = exports.maintenanceAssignSchema = exports.maintenanceCreateSchema = exports.apartmentSchema = exports.buildingSchema = exports.userStatusSchema = exports.createStaffSchema = void 0;
const zod_1 = require("zod");
exports.createStaffSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().min(6),
    password: zod_1.z.string().min(8),
    role: zod_1.z.enum(["MANAGER", "CONTRACTOR", "ADMIN"]),
});
exports.userStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["ACTIVE", "DISABLED"]),
});
exports.buildingSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    address: zod_1.z.string().min(5),
    description: zod_1.z.string().optional(),
    managerId: zod_1.z.string().uuid().optional(),
});
exports.apartmentSchema = zod_1.z.object({
    buildingId: zod_1.z.string().uuid().optional(),
    apartmentNumber: zod_1.z.string().min(1),
    floor: zod_1.z.number().int().min(0),
    bedrooms: zod_1.z.number().int().min(0),
    monthlyRent: zod_1.z.number().positive(),
    status: zod_1.z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]),
    tenantId: zod_1.z.string().uuid().optional(),
});
exports.maintenanceCreateSchema = zod_1.z.object({
    apartmentId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(5),
    category: zod_1.z.enum(["Plumbing", "Electrical", "HVAC", "Appliance", "Structural", "Cleaning", "Other"]),
    priority: zod_1.z.enum(["Low", "Medium", "High", "Emergency"]),
});
exports.maintenanceAssignSchema = zod_1.z.object({
    contractorId: zod_1.z.string().uuid(),
});
exports.maintenanceUpdateSchema = zod_1.z.object({
    message: zod_1.z.string().min(2),
    status: zod_1.z.enum(["Submitted", "Under Review", "Assigned", "In Progress", "Completed", "Cancelled"]).optional(),
});
exports.paymentVerifySchema = zod_1.z.object({
    status: zod_1.z.enum(["Verified", "Rejected"]),
});
exports.securityReportCreateSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(5),
    location: zod_1.z.string().min(2),
    priority: zod_1.z.enum(["Low", "Medium", "High", "Emergency"]),
});
exports.securityReportStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["Reported", "Under Review", "Investigating", "Resolved"]),
});
exports.announcementSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    message: zod_1.z.string().min(5),
    audienceType: zod_1.z.enum(["All Tenants", "Specific Building", "Specific Tenant"]),
    audienceBuildingId: zod_1.z.string().uuid().optional(),
    audienceTenantId: zod_1.z.string().uuid().optional(),
});
exports.profileUpdateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(6),
});
