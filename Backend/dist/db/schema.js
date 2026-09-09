"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apartments = exports.buildings = exports.users = exports.securityStatusEnum = exports.paymentStatusEnum = exports.maintenanceStatusEnum = exports.maintenancePriorityEnum = exports.apartmentStatusEnum = exports.userStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["TENANT", "MANAGER", "CONTRACTOR", "ADMIN"]);
exports.userStatusEnum = (0, pg_core_1.pgEnum)("user_status", ["ACTIVE", "DISABLED"]);
exports.apartmentStatusEnum = (0, pg_core_1.pgEnum)("apartment_status", ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]);
exports.maintenancePriorityEnum = (0, pg_core_1.pgEnum)("maintenance_priority", ["Low", "Medium", "High", "Emergency"]);
exports.maintenanceStatusEnum = (0, pg_core_1.pgEnum)("maintenance_status", ["Submitted", "Under Review", "Assigned", "In Progress", "Completed", "Cancelled"]);
exports.paymentStatusEnum = (0, pg_core_1.pgEnum)("payment_status", ["Pending", "Verified", "Rejected"]);
exports.securityStatusEnum = (0, pg_core_1.pgEnum)("security_status", ["Reported", "Under Review", "Investigating", "Resolved"]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    fullName: (0, pg_core_1.text)("full_name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    passwordHash: (0, pg_core_1.text)("password_hash").notNull(),
    role: (0, exports.roleEnum)("role").notNull().default("TENANT"),
    status: (0, exports.userStatusEnum)("status").notNull().default("ACTIVE"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
exports.buildings = (0, pg_core_1.pgTable)("buildings", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    address: (0, pg_core_1.text)("address").notNull(),
    description: (0, pg_core_1.text)("description"),
    managerId: (0, pg_core_1.uuid)("manager_id"),
    isActive: (0, pg_core_1.boolean)("is_active").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
exports.apartments = (0, pg_core_1.pgTable)("apartments", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    buildingId: (0, pg_core_1.uuid)("building_id").notNull(),
    apartmentNumber: (0, pg_core_1.text)("apartment_number").notNull(),
    floor: (0, pg_core_1.integer)("floor").notNull(),
    bedrooms: (0, pg_core_1.integer)("bedrooms").notNull(),
    monthlyRent: (0, pg_core_1.numeric)("monthly_rent", { precision: 12, scale: 2 }).notNull(),
    status: (0, exports.apartmentStatusEnum)("status").notNull().default("AVAILABLE"),
    tenantId: (0, pg_core_1.uuid)("tenant_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
