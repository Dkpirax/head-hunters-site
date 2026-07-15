"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPermissionRelations = exports.permissionRelations = exports.adminUserRelations = exports.messageRelations = exports.conversationRelations = exports.passwordResetToken = exports.userPermission = exports.permission = exports.employer = exports.candidate = exports.adminUser = exports.message = exports.conversation = exports.article = exports.content = exports.enquiry = exports.job = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const cuid2_1 = require("@paralleldrive/cuid2");
exports.job = (0, pg_core_1.pgTable)('Job', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    title: (0, pg_core_1.varchar)('title', { length: 191 }).notNull(),
    location: (0, pg_core_1.varchar)('location', { length: 191 }).notNull(),
    type: (0, pg_core_1.varchar)('type', { length: 191 }).notNull(), // CASUAL, PERMANENT, REMOTE, EXECUTIVE
    description: (0, pg_core_1.text)('description').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 191 }).notNull().default('ACTIVE'), // ACTIVE, CLOSED, DRAFT
    isHot: (0, pg_core_1.boolean)('isHot').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        statusIdx: (0, pg_core_1.index)('job_status_idx').on(table.status),
        createdAtIdx: (0, pg_core_1.index)('job_created_at_idx').on(table.createdAt),
    };
});
exports.enquiry = (0, pg_core_1.pgTable)('Enquiry', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.varchar)('name', { length: 191 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 191 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 191 }),
    type: (0, pg_core_1.varchar)('type', { length: 191 }).notNull(), // HIRING, CANDIDATE, GENERAL
    message: (0, pg_core_1.text)('message').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 191 }).notNull().default('NEW'), // NEW, READ, ASSIGNED, ARCHIVED
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        statusIdx: (0, pg_core_1.index)('enquiry_status_idx').on(table.status),
        emailIdx: (0, pg_core_1.index)('enquiry_email_idx').on(table.email),
    };
});
exports.content = (0, pg_core_1.pgTable)('Content', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    key: (0, pg_core_1.varchar)('key', { length: 191 }).notNull().unique(),
    value: (0, pg_core_1.text)('value').notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.article = (0, pg_core_1.pgTable)('Article', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    title: (0, pg_core_1.varchar)('title', { length: 191 }).notNull(),
    slug: (0, pg_core_1.varchar)('slug', { length: 191 }).notNull().unique(),
    category: (0, pg_core_1.varchar)('category', { length: 191 }).notNull(),
    excerpt: (0, pg_core_1.text)('excerpt').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    isPublished: (0, pg_core_1.boolean)('isPublished').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});
exports.conversation = (0, pg_core_1.pgTable)('Conversation', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    userId: (0, pg_core_1.varchar)('userId', { length: 191 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 191 }).notNull(), // BOT_ACTIVE, HUMAN_ACTIVE, CLOSED
    takenBy: (0, pg_core_1.varchar)('takenBy', { length: 191 }),
    needsHuman: (0, pg_core_1.boolean)('needsHuman').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        statusIdx: (0, pg_core_1.index)('conversation_status_idx').on(table.status),
        userIdIdx: (0, pg_core_1.index)('conversation_user_id_idx').on(table.userId),
    };
});
exports.message = (0, pg_core_1.pgTable)('Message', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    conversationId: (0, pg_core_1.varchar)('conversationId', { length: 191 }).notNull(),
    senderType: (0, pg_core_1.varchar)('senderType', { length: 191 }).notNull(), // USER, ADMIN, BOT
    content: (0, pg_core_1.text)('content').notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    isReadByAdmin: (0, pg_core_1.boolean)('isReadByAdmin').notNull().default(false),
}, (table) => {
    return {
        conversationIdIdx: (0, pg_core_1.index)('message_conversation_id_idx').on(table.conversationId),
    };
});
exports.adminUser = (0, pg_core_1.pgTable)('AdminUser', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, pg_core_1.varchar)('email', { length: 191 }).notNull().unique(),
    passwordHash: (0, pg_core_1.varchar)('passwordHash', { length: 191 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 191 }),
    role: (0, pg_core_1.varchar)('role', { length: 191 }).notNull().default('ADMIN'), // SUPER_ADMIN, ADMIN, USER
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        emailIdx: (0, pg_core_1.index)('admin_user_email_idx').on(table.email),
    };
});
exports.candidate = (0, pg_core_1.pgTable)('Candidate', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, pg_core_1.varchar)('email', { length: 191 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 191 }),
    dateOfBirth: (0, pg_core_1.timestamp)('dateOfBirth', { mode: 'date' }).notNull(),
    parentalConsent: (0, pg_core_1.boolean)('parentalConsent').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        emailIdx: (0, pg_core_1.index)('candidate_email_idx').on(table.email),
    };
});
exports.employer = (0, pg_core_1.pgTable)('Employer', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    email: (0, pg_core_1.varchar)('email', { length: 191 }).notNull().unique(),
    name: (0, pg_core_1.varchar)('name', { length: 191 }),
    dateOfBirth: (0, pg_core_1.timestamp)('dateOfBirth', { mode: 'date' }).notNull(),
    parentalConsent: (0, pg_core_1.boolean)('parentalConsent').notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => {
    return {
        emailIdx: (0, pg_core_1.index)('employer_email_idx').on(table.email),
    };
});
exports.permission = (0, pg_core_1.pgTable)('Permission', {
    id: (0, pg_core_1.varchar)('id', { length: 191 }).primaryKey().$defaultFn(() => (0, cuid2_1.createId)()),
    name: (0, pg_core_1.varchar)('name', { length: 191 }).notNull().unique(),
    description: (0, pg_core_1.varchar)('description', { length: 191 }),
});
exports.userPermission = (0, pg_core_1.pgTable)('UserPermission', {
    userId: (0, pg_core_1.varchar)('userId', { length: 191 }).notNull(),
    permissionId: (0, pg_core_1.varchar)('permissionId', { length: 191 }).notNull(),
}, (table) => {
    return {
        pk: (0, pg_core_1.primaryKey)({ columns: [table.userId, table.permissionId] }),
        userIdIdx: (0, pg_core_1.index)('user_permission_user_id_idx').on(table.userId),
    };
});
exports.passwordResetToken = (0, pg_core_1.pgTable)('PasswordResetToken', {
    token: (0, pg_core_1.varchar)('token', { length: 191 }).primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 191 }).notNull(),
    expires: (0, pg_core_1.timestamp)('expires', { mode: 'date' }).notNull(),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { mode: 'date' }).notNull().defaultNow(),
});
// Relations
exports.conversationRelations = (0, drizzle_orm_1.relations)(exports.conversation, ({ many }) => ({
    messages: many(exports.message),
}));
exports.messageRelations = (0, drizzle_orm_1.relations)(exports.message, ({ one }) => ({
    conversation: one(exports.conversation, {
        fields: [exports.message.conversationId],
        references: [exports.conversation.id],
    }),
}));
exports.adminUserRelations = (0, drizzle_orm_1.relations)(exports.adminUser, ({ many }) => ({
    permissions: many(exports.userPermission),
}));
exports.permissionRelations = (0, drizzle_orm_1.relations)(exports.permission, ({ many }) => ({
    userPermissions: many(exports.userPermission),
}));
exports.userPermissionRelations = (0, drizzle_orm_1.relations)(exports.userPermission, ({ one }) => ({
    user: one(exports.adminUser, {
        fields: [exports.userPermission.userId],
        references: [exports.adminUser.id],
    }),
    permission: one(exports.permission, {
        fields: [exports.userPermission.permissionId],
        references: [exports.permission.id],
    }),
}));
