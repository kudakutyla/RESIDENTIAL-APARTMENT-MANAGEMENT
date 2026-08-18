import { pgEnum, pgTable, text, timestamp, uuid, boolean, integer, numeric } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["TENANT", "MANAGER", "CONTRACTOR", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "DISABLED"]);
export const apartmentStatusEnum = pgEnum("apartment_status", ["AVAILABLE", "OCCUPIED", "MAINTENANCE"]);
export const maintenancePriorityEnum = pgEnum("maintenance_priority", ["Low", "Medium", "High", "Emergency"]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", ["Submitted", "Under Review", "Assigned", "In Progress", "Completed", "Cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["Pending", "Verified", "Rejected"]);
export const securityStatusEnum = pgEnum("security_status", ["Reported", "Under Review", "Investigating", "Resolved"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("TENANT"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const buildings = pgTable("buildings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  managerId: uuid("manager_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const apartments = pgTable("apartments", {
  id: uuid("id").defaultRandom().primaryKey(),
  buildingId: uuid("building_id").notNull(),
  apartmentNumber: text("apartment_number").notNull(),
  floor: integer("floor").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  monthlyRent: numeric("monthly_rent", { precision: 12, scale: 2 }).notNull(),
  status: apartmentStatusEnum("status").notNull().default("AVAILABLE"),
  tenantId: uuid("tenant_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
