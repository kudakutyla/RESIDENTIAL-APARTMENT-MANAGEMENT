"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("./client");
const DEV_PASSWORD = "HomeNest@123";
function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
async function seed() {
    await (0, client_1.query)("TRUNCATE audit_logs, notifications, announcements, security_reports, documents, payments, maintenance_updates, maintenance_requests, contractors, apartments, buildings, users RESTART IDENTITY CASCADE");
    const passwordHash = await bcryptjs_1.default.hash(DEV_PASSWORD, 12);
    const admin = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'ADMIN') RETURNING id`, ["Admin One", "admin@homenest.demo", "+1-555-1001", passwordHash]);
    const manager = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'MANAGER') RETURNING id`, ["Maya Manager", "manager@homenest.demo", "+1-555-1002", passwordHash]);
    const contractorUser = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'CONTRACTOR') RETURNING id`, ["Carlos Contractor", "contractor@homenest.demo", "+1-555-1003", passwordHash]);
    const tenantDemo = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'TENANT') RETURNING id`, ["Tina Tenant", "tenant@homenest.demo", "+1-555-1004", passwordHash]);
    const tenantIds = [tenantDemo.rows[0].id];
    for (let i = 0; i < 80; i++) {
        const tenant = await (0, client_1.query)(`INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,'TENANT') RETURNING id`, [`Tenant ${i + 1}`, `tenant${i + 1}@homenest.demo`, `+1-555-2${String(i).padStart(3, "0")}`, passwordHash]);
        tenantIds.push(tenant.rows[0].id);
    }
    const contractor = await (0, client_1.query)(`INSERT INTO contractors (user_id, company_name, phone, specialization) VALUES ($1,$2,$3,$4) RETURNING id`, [contractorUser.rows[0].id, "SafeFix Services", "+1-555-9900", "Plumbing & Electrical"]);
    const buildingIds = [];
    for (let i = 1; i <= 15; i++) {
        const b = await (0, client_1.query)(`INSERT INTO buildings (name, address, description, manager_id) VALUES ($1,$2,$3,$4) RETURNING id`, [`HomeNest Residence ${i}`, `${100 + i} Cedar Lane`, `Residential tower ${i}`, manager.rows[0].id]);
        buildingIds.push(b.rows[0].id);
    }
    const apartmentIds = [];
    let tenantIndex = 0;
    for (const buildingId of buildingIds) {
        for (let i = 1; i <= 12; i++) {
            const tenantId = tenantIds[tenantIndex % tenantIds.length];
            tenantIndex += 1;
            const ap = await (0, client_1.query)(`INSERT INTO apartments (building_id, apartment_number, floor, bedrooms, monthly_rent, status, tenant_id)
         VALUES ($1,$2,$3,$4,$5,'OCCUPIED',$6) RETURNING id`, [buildingId, `A-${i}`, Math.ceil(i / 4), randomFrom([1, 2, 3]), randomFrom([850, 950, 1100, 1300]), tenantId]);
            apartmentIds.push(ap.rows[0].id);
        }
    }
    const categories = ["Plumbing", "Electrical", "HVAC", "Appliance", "Structural", "Cleaning", "Other"];
    const priorities = ["Low", "Medium", "High", "Emergency"];
    const statuses = ["Submitted", "Under Review", "Assigned", "In Progress", "Completed"];
    for (let i = 0; i < 80; i++) {
        const apartmentId = apartmentIds[i % apartmentIds.length];
        const apartment = await (0, client_1.query)(`SELECT building_id, tenant_id FROM apartments WHERE id = $1`, [apartmentId]);
        const status = randomFrom(statuses);
        const req = await (0, client_1.query)(`INSERT INTO maintenance_requests
       (tenant_id, building_id, apartment_id, title, description, category, priority, status, assigned_contractor_id, resolved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`, [
            apartment.rows[0].tenant_id,
            apartment.rows[0].building_id,
            apartmentId,
            `Issue #${i + 1}`,
            `Maintenance details for request #${i + 1}`,
            randomFrom(categories),
            randomFrom(priorities),
            status,
            status === "Assigned" || status === "In Progress" || status === "Completed" ? contractor.rows[0].id : null,
            status === "Completed" ? new Date() : null,
        ]);
        await (0, client_1.query)(`INSERT INTO maintenance_updates (maintenance_request_id, user_id, message, status) VALUES ($1,$2,$3,$4)`, [req.rows[0].id, manager.rows[0].id, "Request reviewed by management", "Under Review"]);
    }
    const paymentStatuses = ["Pending", "Verified", "Rejected"];
    for (let i = 0; i < 120; i++) {
        const apartmentId = apartmentIds[i % apartmentIds.length];
        const apartment = await (0, client_1.query)(`SELECT tenant_id FROM apartments WHERE id = $1`, [apartmentId]);
        await (0, client_1.query)(`INSERT INTO payments (tenant_id, apartment_id, amount, month_label, status, verified_by, verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
            apartment.rows[0].tenant_id,
            apartmentId,
            randomFrom([850, 950, 1100, 1300]),
            `2026-${String((i % 12) + 1).padStart(2, "0")}`,
            randomFrom(paymentStatuses),
            admin.rows[0].id,
            new Date(),
        ]);
    }
    for (let i = 0; i < 40; i++) {
        const apartmentId = apartmentIds[i % apartmentIds.length];
        const apartment = await (0, client_1.query)(`SELECT tenant_id, building_id FROM apartments WHERE id = $1`, [apartmentId]);
        await (0, client_1.query)(`INSERT INTO security_reports (tenant_id, building_id, apartment_id, title, description, location, priority, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [
            apartment.rows[0].tenant_id,
            apartment.rows[0].building_id,
            apartmentId,
            `Security concern #${i + 1}`,
            "Suspicious activity in common area",
            "Lobby entrance",
            randomFrom(priorities),
            randomFrom(["Reported", "Under Review", "Investigating", "Resolved"]),
        ]);
    }
    for (let i = 0; i < 12; i++) {
        await (0, client_1.query)(`INSERT INTO announcements (title, message, audience_type, audience_building_id, created_by)
       VALUES ($1,$2,'Specific Building',$3,$4)`, [
            `Building Update ${i + 1}`,
            "Routine maintenance window this weekend.",
            buildingIds[i % buildingIds.length],
            manager.rows[0].id,
        ]);
    }
    for (const tenantId of tenantIds.slice(0, 40)) {
        await (0, client_1.query)(`INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)`, [tenantId, "Welcome to HomeNest", "Your tenant portal is active.", "SYSTEM"]);
    }
    await (0, client_1.query)(`INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details)
     VALUES ($1,$2,$3,$4,$5)`, [admin.rows[0].id, "SEED_COMPLETED", "SYSTEM", "seed", JSON.stringify({ buildings: 15 })]);
    console.log("Seed complete.");
    console.log("Demo password:", DEV_PASSWORD);
}
seed()
    .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
})
    .finally(async () => {
    await client_1.pool.end();
});
