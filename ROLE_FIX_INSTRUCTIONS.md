# 🔧 Role Assignment Fix - Step by Step

## ❌ সমস্যা:
```
Error: User has no role assigned
Status: 403 Forbidden
```

## ✅ সমাধান (3টি উপায়):

---

## **Option 1: Quick Fix - Disable Permission Check (Temporary)**

এটা শুধু testing এর জন্য। Production এ ব্যবহার করবেন না!

### File: `apps/api/src/patients/patients.controller.ts`

সব `@RequirePermissions` decorator comment out করুন:

```typescript
// @RequirePermissions('patient.view', 'PATIENT_READ', 'VIEW_PATIENTS')
@Get()
async findAll() {
  // ...
}
```

অথবা guard globally disable করুন:

### File: `apps/api/src/app.module.ts`

```typescript
// Comment out PermissionsGuard
providers: [
  // {
  //   provide: APP_GUARD,
  //   useClass: PermissionsGuard,
  // },
],
```

---

## **Option 2: Create Roles via Prisma Studio (Recommended)**

### Step 1: Open Prisma Studio
```bash
cd apps/api
npx prisma studio
```

### Step 2: Create Permissions
Go to `permissions` table and create these:

| name | description | category | isActive |
|------|-------------|----------|----------|
| patient.view | View patients | patient | true |
| patient.create | Create patients | patient | true |
| patient.update | Update patients | patient | true |
| patient.delete | Delete patients | patient | true |
| PATIENT_READ | Read patient data | patient | true |
| PATIENT_CREATE | Create patient records | patient | true |
| PATIENT_UPDATE | Update patient records | patient | true |
| VIEW_PATIENTS | View patient list | patient | true |
| UPDATE_PATIENTS | Update patient information | patient | true |

### Step 3: Create Tenant Role
Go to `tenant_roles` table:

1. Find your tenant ID from `tenants` table
2. Create a new role:
   - name: `ADMIN`
   - description: `Administrator with full access`
   - tenantId: `<your-tenant-id>`
   - isActive: `true`

### Step 4: Assign Permissions to Role
Go to `role_permissions` table:

For each permission created above, create a record:
- roleId: `<admin-role-id>`
- permissionId: `<permission-id>`

### Step 5: Assign Role to User
Go to `users` table:

Find your user and update:
- roleId: `<admin-role-id>`

---

## **Option 3: SQL Script (Fastest)**

### Run this SQL in your database:

```sql
-- 1. Get your tenant ID and user email
SELECT id, name FROM tenants WHERE name LIKE '%your-hospital-name%';
SELECT id, email, "tenantId" FROM users WHERE email = 'your@email.com';

-- 2. Create ADMIN role (replace <tenant-id> with actual ID)
INSERT INTO tenant_roles (id, name, description, "tenantId", "is_active", created_at, updated_at)
VALUES (
  'role_' || gen_random_uuid()::text,
  'ADMIN',
  'Administrator with full access',
  '<tenant-id>',  -- Replace this
  true,
  NOW(),
  NOW()
)
RETURNING id;

-- 3. Get all permission IDs
SELECT id, name FROM permissions WHERE category = 'patient';

-- 4. Assign all permissions to ADMIN role (replace <role-id>)
INSERT INTO role_permissions (id, "roleId", "permissionId", created_at, updated_at)
SELECT 
  'rp_' || gen_random_uuid()::text,
  '<role-id>',  -- Replace this
  p.id,
  NOW(),
  NOW()
FROM permissions p
WHERE p."is_active" = true;

-- 5. Assign role to user (replace <user-id> and <role-id>)
UPDATE users 
SET "roleId" = '<role-id>'  -- Replace this
WHERE id = '<user-id>';  -- Replace this

-- 6. Verify
SELECT 
  u.email,
  u."roleId",
  tr.name as role_name,
  COUNT(rp.id) as permission_count
FROM users u
LEFT JOIN tenant_roles tr ON u."roleId" = tr.id
LEFT JOIN role_permissions rp ON tr.id = rp."roleId"
WHERE u.email = 'your@email.com'
GROUP BY u.email, u."roleId", tr.name;
```

---

## **Option 4: Use Seed Script**

### File: `apps/api/prisma/seed-simple.ts`

This file already has role creation logic. Run it:

```bash
cd apps/api
npm run prisma:seed
```

This will:
- Create test tenant
- Create ADMIN and DOCTOR roles
- Create all permissions
- Assign permissions to roles
- Create test users with roles

---

## 🧪 Test After Fix

1. **Logout and Login again**
   - Clear browser cache
   - Login with your email

2. **Check API Response**
   ```bash
   curl -H "Authorization: Bearer <your-token>" \
        https://hma-saas-1.onrender.com/patients
   ```

3. **Check Browser Console**
   - Should NOT see "User has no role assigned"
   - Should see patient data

---

## 📝 Permanent Solution

### Create a proper seeding/migration system:

1. **Create migration for default roles:**
   ```bash
   cd apps/api
   npx prisma migrate dev --name add_default_roles
   ```

2. **Add to migration file:**
   ```sql
   -- Create default permissions
   INSERT INTO permissions (id, name, description, category, is_active)
   VALUES 
     ('perm_patient_view', 'patient.view', 'View patients', 'patient', true),
     ('perm_patient_create', 'patient.create', 'Create patients', 'patient', true)
   ON CONFLICT (name) DO NOTHING;
   ```

3. **Update seed script** to create roles for ALL tenants

4. **Add role assignment** to user registration flow

---

## 🚨 Production Deployment Checklist

Before deploying to production:

- [ ] All permissions created
- [ ] Default roles (ADMIN, DOCTOR, RECEPTIONIST) created for each tenant
- [ ] All existing users have roles assigned
- [ ] New user registration includes role assignment
- [ ] Permission guards are enabled
- [ ] Test with different roles

---

## 💡 Quick Commands

```bash
# Check users without roles
npx prisma studio
# Go to users table, filter: roleId = null

# Run seed script
npm run prisma:seed

# Reset database (DANGER!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

---

## 📞 Need Help?

If none of these work, share:
1. Your tenant name
2. Your user email
3. Database type (PostgreSQL/MySQL)
4. Error logs from backend

আমি আপনাকে exact SQL commands দেব!
