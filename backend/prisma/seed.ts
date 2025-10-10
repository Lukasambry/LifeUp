/**
 * Database Seeder
 * Populates the database with initial roles, permissions, and super admin
 */

import { PrismaClient } from '../generated/prisma';
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Create Roles
  console.log('Creating roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { type: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'Super Administrator',
      type: 'SUPER_ADMIN',
      description:
        'Full system access with all permissions. Can manage admins and system configuration.',
    },
  });

  const adminLifeUpRole = await prisma.role.upsert({
    where: { type: 'ADMIN_LIFEUP' },
    update: {},
    create: {
      name: 'LifeUp Administrator',
      type: 'ADMIN_LIFEUP',
      description:
        'Can create and manage tasks, quests, rewards, and moderate content.',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { type: 'CLIENT' },
    update: {},
    create: {
      name: 'Client',
      type: 'CLIENT',
      description: 'Standard user with access to gamification features.',
    },
  });

  console.log('✓ Roles created\n');

  // Create Permissions
  console.log('Creating permissions...');
  const permissions = [
    // User permissions
    {
      resource: 'USERS',
      action: 'CREATE',
      description: 'Create new users',
    },
    { resource: 'USERS', action: 'READ', description: 'View users' },
    {
      resource: 'USERS',
      action: 'UPDATE',
      description: 'Update user information',
    },
    { resource: 'USERS', action: 'DELETE', description: 'Delete users' },
    {
      resource: 'USERS',
      action: 'MANAGE',
      description: 'Full user management',
    },

    // Role permissions
    { resource: 'ROLES', action: 'CREATE', description: 'Create new roles' },
    { resource: 'ROLES', action: 'READ', description: 'View roles' },
    {
      resource: 'ROLES',
      action: 'UPDATE',
      description: 'Update role information',
    },
    { resource: 'ROLES', action: 'DELETE', description: 'Delete roles' },
    {
      resource: 'ROLES',
      action: 'MANAGE',
      description: 'Full role management',
    },

    // Task permissions
    { resource: 'TASKS', action: 'CREATE', description: 'Create new tasks' },
    { resource: 'TASKS', action: 'READ', description: 'View tasks' },
    {
      resource: 'TASKS',
      action: 'UPDATE',
      description: 'Update task information',
    },
    { resource: 'TASKS', action: 'DELETE', description: 'Delete tasks' },

    // Quest permissions
    { resource: 'QUESTS', action: 'CREATE', description: 'Create new quests' },
    { resource: 'QUESTS', action: 'READ', description: 'View quests' },
    {
      resource: 'QUESTS',
      action: 'UPDATE',
      description: 'Update quest information',
    },
    { resource: 'QUESTS', action: 'DELETE', description: 'Delete quests' },

    // Reward permissions
    {
      resource: 'REWARDS',
      action: 'CREATE',
      description: 'Create new rewards',
    },
    { resource: 'REWARDS', action: 'READ', description: 'View rewards' },
    {
      resource: 'REWARDS',
      action: 'UPDATE',
      description: 'Update reward information',
    },
    { resource: 'REWARDS', action: 'DELETE', description: 'Delete rewards' },

    // Challenge permissions
    {
      resource: 'CHALLENGES',
      action: 'CREATE',
      description: 'Create new challenges',
    },
    { resource: 'CHALLENGES', action: 'READ', description: 'View challenges' },
    {
      resource: 'CHALLENGES',
      action: 'UPDATE',
      description: 'Update challenge information',
    },
    {
      resource: 'CHALLENGES',
      action: 'DELETE',
      description: 'Delete challenges',
    },

    // Module permissions
    {
      resource: 'MODULES',
      action: 'CREATE',
      description: 'Create new modules',
    },
    { resource: 'MODULES', action: 'READ', description: 'View modules' },
    {
      resource: 'MODULES',
      action: 'UPDATE',
      description: 'Update module information',
    },
    { resource: 'MODULES', action: 'DELETE', description: 'Delete modules' },

    // Settings permissions
    { resource: 'SETTINGS', action: 'READ', description: 'View settings' },
    {
      resource: 'SETTINGS',
      action: 'MANAGE',
      description: 'Manage system settings',
    },

    // Analytics permissions
    {
      resource: 'ANALYTICS',
      action: 'READ',
      description: 'View analytics data',
    },
    {
      resource: 'ANALYTICS',
      action: 'MANAGE',
      description: 'Manage analytics settings',
    },

    // Logs permissions
    { resource: 'LOGS', action: 'READ', description: 'View activity logs' },
    {
      resource: 'LOGS',
      action: 'MANAGE',
      description: 'Manage activity logs',
    },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource as any,
          action: perm.action as any,
        },
      },
      update: {},
      create: perm as any,
    });
    createdPermissions.push(permission);
  }

  console.log(`✓ ${createdPermissions.length} permissions created\n`);

  // Assign permissions to roles
  console.log('Assigning permissions to roles...');

  // Super Admin gets ALL permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin LifeUp gets specific permissions
  const adminPermissions = createdPermissions.filter((p) =>
    [
      'TASKS:CREATE',
      'TASKS:READ',
      'TASKS:UPDATE',
      'TASKS:DELETE',
      'QUESTS:CREATE',
      'QUESTS:READ',
      'QUESTS:UPDATE',
      'QUESTS:DELETE',
      'REWARDS:CREATE',
      'REWARDS:READ',
      'REWARDS:UPDATE',
      'REWARDS:DELETE',
      'CHALLENGES:CREATE',
      'CHALLENGES:READ',
      'CHALLENGES:UPDATE',
      'CHALLENGES:DELETE',
      'MODULES:READ',
      'ANALYTICS:READ',
      'LOGS:READ',
    ].includes(`${p.resource}:${p.action}`),
  );

  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminLifeUpRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminLifeUpRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Client gets read-only permissions for their resources
  const clientPermissions = createdPermissions.filter((p) =>
    [
      'TASKS:READ',
      'QUESTS:READ',
      'REWARDS:READ',
      'CHALLENGES:READ',
      'MODULES:READ',
    ].includes(`${p.resource}:${p.action}`),
  );

  for (const permission of clientPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: clientRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: clientRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✓ Permissions assigned to roles\n');

  // Create Super Admin User
  console.log('Creating super admin user...');
  const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@lifeup.com' },
    update: {},
    create: {
      email: 'admin@lifeup.com',
      name: 'Super Administrator',
      password: hashedPassword,
      roleId: superAdminRole.id,
      isPremium: true,
      isActive: true,
    },
  });

  console.log('✓ Super admin created\n');

  // Summary
  console.log('📊 Seeding Summary:');
  console.log(`   - Roles: 3 (Super Admin, Admin LifeUp, Client)`);
  console.log(`   - Permissions: ${createdPermissions.length}`);
  console.log(`   - Users: 1 (Super Admin)`);
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📧 Super Admin Credentials:');
  console.log('   Email: admin@lifeup.com');
  console.log('   Password: SuperAdmin123!');
  console.log(
    '\n⚠️  IMPORTANT: Change the super admin password after first login!\n',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
