import { query, pool } from "./client";

const statements = [
  `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
  `DO $$ BEGIN
    CREATE TYPE role AS ENUM ('TENANT','MANAGER','CONTRACTOR','ADMIN');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('ACTIVE','DISABLED');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE apartment_status AS ENUM ('AVAILABLE','OCCUPIED','MAINTENANCE');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE maintenance_priority AS ENUM ('Low','Medium','High','Emergency');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE maintenance_status AS ENUM ('Submitted','Under Review','Assigned','In Progress','Completed','Cancelled');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('Pending','Verified','Rejected');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN
    CREATE TYPE security_status AS ENUM ('Reported','Under Review','Investigating','Resolved');
  EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role role NOT NULL DEFAULT 'TENANT',
    status user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS apartments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id),
    apartment_number TEXT NOT NULL,
    floor INT NOT NULL,
    bedrooms INT NOT NULL,
    monthly_rent NUMERIC(12,2) NOT NULL,
    status apartment_status NOT NULL DEFAULT 'AVAILABLE',
    tenant_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(building_id, apartment_number)
  );`,
  `CREATE TABLE IF NOT EXISTS contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    company_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    specialization TEXT NOT NULL,
    status user_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    building_id UUID NOT NULL REFERENCES buildings(id),
    apartment_id UUID NOT NULL REFERENCES apartments(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority maintenance_priority NOT NULL,
    status maintenance_status NOT NULL DEFAULT 'Submitted',
    assigned_contractor_id UUID REFERENCES contractors(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
  );`,
  `CREATE TABLE IF NOT EXISTS maintenance_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    status maintenance_status,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    apartment_id UUID NOT NULL REFERENCES apartments(id),
    amount NUMERIC(12,2) NOT NULL,
    month_label TEXT NOT NULL,
    status payment_status NOT NULL DEFAULT 'Pending',
    proof_file_path TEXT,
    proof_file_name TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    document_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Uploaded',
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS security_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES users(id),
    building_id UUID NOT NULL REFERENCES buildings(id),
    apartment_id UUID REFERENCES apartments(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    priority maintenance_priority NOT NULL,
    status security_status NOT NULL DEFAULT 'Reported',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    audience_type TEXT NOT NULL,
    audience_building_id UUID REFERENCES buildings(id),
    audience_tenant_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`,
  `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`,
  `CREATE INDEX IF NOT EXISTS idx_apartments_tenant_id ON apartments(tenant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_maintenance_tenant_id ON maintenance_requests(tenant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_requests(status);`,
  `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);`,
  `CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);`,
  `CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);`
];

async function migrate() {
  for (const statement of statements) {
    await query(statement);
  }
  console.log("Migration complete.");
}

migrate()
  .catch((error) => {
    console.error("Migration failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
