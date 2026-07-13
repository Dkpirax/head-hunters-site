import { mysqlTable, varchar, text, boolean, timestamp, datetime, primaryKey } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const job = mysqlTable('Job', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 191 }).notNull(),
  location: varchar('location', { length: 191 }).notNull(),
  type: varchar('type', { length: 191 }).notNull(), // CASUAL, PERMANENT, REMOTE, EXECUTIVE
  description: text('description').notNull(),
  status: varchar('status', { length: 191 }).notNull().default('ACTIVE'), // ACTIVE, CLOSED, DRAFT
  isHot: boolean('isHot').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const enquiry = mysqlTable('Enquiry', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 191 }).notNull(),
  email: varchar('email', { length: 191 }).notNull(),
  phone: varchar('phone', { length: 191 }),
  type: varchar('type', { length: 191 }).notNull(), // HIRING, CANDIDATE, GENERAL
  message: text('message').notNull(),
  status: varchar('status', { length: 191 }).notNull().default('NEW'), // NEW, READ, ASSIGNED, ARCHIVED
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const content = mysqlTable('Content', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  key: varchar('key', { length: 191 }).notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const article = mysqlTable('Article', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 191 }).notNull(),
  slug: varchar('slug', { length: 191 }).notNull().unique(),
  category: varchar('category', { length: 191 }).notNull(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  isPublished: boolean('isPublished').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const conversation = mysqlTable('Conversation', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  userId: varchar('userId', { length: 191 }).notNull(),
  status: varchar('status', { length: 191 }).notNull(), // BOT_ACTIVE, HUMAN_ACTIVE, CLOSED
  takenBy: varchar('takenBy', { length: 191 }),
  needsHuman: boolean('needsHuman').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const message = mysqlTable('Message', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  conversationId: varchar('conversationId', { length: 191 }).notNull(),
  senderType: varchar('senderType', { length: 191 }).notNull(), // USER, ADMIN, BOT
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  isReadByAdmin: boolean('isReadByAdmin').notNull().default(false),
});

export const adminUser = mysqlTable('AdminUser', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  passwordHash: varchar('passwordHash', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }),
  role: varchar('role', { length: 191 }).notNull().default('ADMIN'), // SUPER_ADMIN, ADMIN, USER
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const candidate = mysqlTable('Candidate', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }),
  dateOfBirth: datetime('dateOfBirth').notNull(),
  parentalConsent: boolean('parentalConsent').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const employer = mysqlTable('Employer', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 191 }).notNull().unique(),
  name: varchar('name', { length: 191 }),
  dateOfBirth: datetime('dateOfBirth').notNull(),
  parentalConsent: boolean('parentalConsent').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow().onUpdateNow(),
});

export const permission = mysqlTable('Permission', {
  id: varchar('id', { length: 191 }).primaryKey().$defaultFn(() => createId()),
  name: varchar('name', { length: 191 }).notNull().unique(),
  description: varchar('description', { length: 191 }),
});

export const userPermission = mysqlTable('UserPermission', {
  userId: varchar('userId', { length: 191 }).notNull(),
  permissionId: varchar('permissionId', { length: 191 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.permissionId] })
  }
});

// Relations
export const conversationRelations = relations(conversation, ({ many }) => ({
  messages: many(message),
}));

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
}));

export const adminUserRelations = relations(adminUser, ({ many }) => ({
  permissions: many(userPermission),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  userPermissions: many(userPermission),
}));

export const userPermissionRelations = relations(userPermission, ({ one }) => ({
  user: one(adminUser, {
    fields: [userPermission.userId],
    references: [adminUser.id],
  }),
  permission: one(permission, {
    fields: [userPermission.permissionId],
    references: [permission.id],
  }),
}));
