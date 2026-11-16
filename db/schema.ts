///Users/xeoren/Desktop/thetathyanews/db/schema.ts
import { pgTable, pgEnum, text, timestamp, boolean, integer, jsonb, uuid, varchar, decimal, index, uniqueIndex, bigint, inet, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'banned', 'pending_verification', 'deactivated']);
export const roleTypeEnum = pgEnum('role_type', ['system', 'custom']);
export const articleStatusEnum = pgEnum('article_status', ['draft', 'in_review', 'scheduled', 'published', 'archived', 'deleted']);
export const articleVisibilityEnum = pgEnum('article_visibility', ['public', 'premium', 'subscribers_only', 'members_only', 'unlisted']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'past_due', 'canceled', 'unpaid', 'paused', 'trialing']);
export const planIntervalEnum = pgEnum('plan_interval', ['day', 'week', 'month', 'year', 'lifetime']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'disputed']);
export const paymentMethodEnum = pgEnum('payment_method', ['card', 'bank_transfer', 'paypal', 'wallet', 'crypto']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'open', 'paid', 'void', 'uncollectible']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'audio', 'document', 'other']);
export const mediaMimeTypeEnum = pgEnum('media_mime_type', [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav',
  'application/pdf', 'application/zip'
]);
export const commentStatusEnum = pgEnum('comment_status', ['pending', 'approved', 'rejected', 'flagged', 'deleted']);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'love', 'laugh', 'insightful', 'thinking', 'angry']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'comment_reply', 'article_published', 'subscription_expiring', 'subscription_renewed',
  'payment_failed', 'new_follower', 'mention', 'system'
]);
export const eventTypeEnum = pgEnum('event_type', [
  'page_view', 'article_view', 'article_read', 'click', 'share', 'search',
  'signup', 'login', 'subscription_started', 'subscription_canceled', 'payment'
]);
export const auditActionEnum = pgEnum('audit_action', [
  'create', 'read', 'update', 'delete', 'login', 'logout', 'password_change',
  'role_assigned', 'permission_granted', 'permission_revoked', 'export', 'import'
]);
export const featureFlagStatusEnum = pgEnum('feature_flag_status', ['enabled', 'disabled', 'percentage_rollout', 'user_rollout']);
export const webhookEventEnum = pgEnum('webhook_event', [
  'article.published', 'article.updated', 'user.subscribed', 'user.unsubscribed',
  'payment.succeeded', 'payment.failed', 'comment.created'
]);
export const webhookStatusEnum = pgEnum('webhook_status', ['active', 'inactive', 'failed']);
export const experimentStatusEnum = pgEnum('experiment_status', ['draft', 'running', 'paused', 'completed']);
export const emailTemplateTypeEnum = pgEnum('email_template_type', [
  'welcome', 'verification', 'password_reset', 'subscription_confirmation',
  'payment_receipt', 'subscription_expiring', 'newsletter', 'digest'
]);
export const pageTypeEnum = pgEnum('page_type', ['static', 'legal', 'cms', 'landing']);
export const seoIndexStatusEnum = pgEnum('seo_index_status', ['index', 'noindex', 'nofollow', 'noindex_nofollow']);

// ==================== IDENTITY & ACCESS CONTROL ====================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  passwordHash: text('password_hash'),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  displayName: varchar('display_name', { length: 200 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  status: userStatusEnum('status').default('pending_verification').notNull(),
  locale: varchar('locale', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  metadata: jsonb('metadata'), // Extensible user data
  preferences: jsonb('preferences'), // UI preferences, notifications settings
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastLoginIp: inet('last_login_ip'),
  loginCount: integer('login_count').default(0),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  emailVerificationToken: varchar('email_verification_token', { length: 255 }),
  emailVerificationExpiry: timestamp('email_verification_expiry', { withTimezone: true }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpiry: timestamp('password_reset_expiry', { withTimezone: true }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  twoFactorSecret: text('two_factor_secret'),
  backupCodes: jsonb('backup_codes'), // Array of hashed backup codes
  deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft delete
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  statusIdx: index('users_status_idx').on(table.status),
  createdAtIdx: index('users_created_at_idx').on(table.createdAt),
}));

export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  type: roleTypeEnum('type').default('custom').notNull(),
  priority: integer('priority').default(0), // Higher priority = more powerful
  isDefault: boolean('is_default').default(false), // Auto-assign to new users
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('roles_slug_idx').on(table.slug),
  typeIdx: index('roles_type_idx').on(table.type),
}));

export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  resource: varchar('resource', { length: 100 }).notNull(), // articles, users, subscriptions
  action: varchar('action', { length: 50 }).notNull(), // create, read, update, delete, publish
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('permissions_slug_idx').on(table.slug),
  resourceActionIdx: index('permissions_resource_action_idx').on(table.resource, table.action),
}));

export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  grantedBy: uuid('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Temporary role assignment
  metadata: jsonb('metadata'),
}, (table) => ({
  userRoleIdx: uniqueIndex('user_roles_user_role_idx').on(table.userId, table.roleId),
  userIdIdx: index('user_roles_user_id_idx').on(table.userId),
  roleIdIdx: index('user_roles_role_id_idx').on(table.roleId),
}));

export const rolePermissions = pgTable('role_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  rolePermissionIdx: uniqueIndex('role_permissions_role_permission_idx').on(table.roleId, table.permissionId),
  roleIdIdx: index('role_permissions_role_id_idx').on(table.roleId),
}));

export const userPermissions = pgTable('user_permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  grantedBy: uuid('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
}, (table) => ({
  userPermissionIdx: uniqueIndex('user_permissions_user_permission_idx').on(table.userId, table.permissionId),
  userIdIdx: index('user_permissions_user_id_idx').on(table.userId),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token', { length: 500 }).notNull().unique(),
  refreshToken: varchar('refresh_token', { length: 500 }),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  deviceId: varchar('device_id', { length: 255 }),
  deviceName: varchar('device_name', { length: 255 }),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex('sessions_token_idx').on(table.token),
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: auditActionEnum('action').notNull(),
  resource: varchar('resource', { length: 100 }), // table name
  resourceId: uuid('resource_id'), // record id
  changes: jsonb('changes'), // before/after
  metadata: jsonb('metadata'), // additional context
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  resourceIdx: index('audit_logs_resource_idx').on(table.resource, table.resourceId),
  timestampIdx: index('audit_logs_timestamp_idx').on(table.timestamp),
  actionIdx: index('audit_logs_action_idx').on(table.action),
}));

// ==================== EDITORIAL & CMS ====================

export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  displayName: varchar('display_name', { length: 200 }).notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  title: varchar('title', { length: 200 }), // Senior Editor, Contributing Writer
  website: text('website'),
  twitter: varchar('twitter', { length: 100 }),
  linkedin: varchar('linkedin', { length: 100 }),
  isVerified: boolean('is_verified').default(false),
  isStaff: boolean('is_staff').default(false),
  articleCount: integer('article_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('authors_slug_idx').on(table.slug),
  userIdIdx: index('authors_user_id_idx').on(table.userId),
}));

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  imageUrl: text('image_url'),
  color: varchar('color', { length: 7 }), // Hex color
  icon: varchar('icon', { length: 50 }),
  displayOrder: integer('display_order').default(0),
  articleCount: integer('article_count').default(0),
  isVisible: boolean('is_visible').default(true),
  metadata: jsonb('metadata'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug),
  parentIdIdx: index('categories_parent_id_idx').on(table.parentId),
}));

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  articleCount: integer('article_count').default(0),
  isVisible: boolean('is_visible').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('tags_slug_idx').on(table.slug),
}));

export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 300 }).notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  excerpt: text('excerpt'),
  content: text('content').notNull(), // Rich text / HTML / Markdown
  contentFormat: varchar('content_format', { length: 20 }).default('html'), // html, markdown, json
  coverImageUrl: text('cover_image_url'),
  coverImageAlt: text('cover_image_alt'),
  coverImageCredit: text('cover_image_credit'),
  status: articleStatusEnum('status').default('draft').notNull(),
  visibility: articleVisibilityEnum('visibility').default('public').notNull(),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  primaryAuthorId: uuid('primary_author_id').references(() => authors.id, { onDelete: 'set null' }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  featuredUntil: timestamp('featured_until', { withTimezone: true }),
  isFeatured: boolean('is_featured').default(false),
  isPinned: boolean('is_pinned').default(false),
  allowComments: boolean('allow_comments').default(true),
  viewCount: integer('view_count').default(0),
  readCount: integer('read_count').default(0), // Actually read to end
  shareCount: integer('share_count').default(0),
  commentCount: integer('comment_count').default(0),
  reactionCount: integer('reaction_count').default(0),
  bookmarkCount: integer('bookmark_count').default(0),
  readingTimeMinutes: integer('reading_time_minutes'),
  wordCount: integer('word_count'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoKeywords: text('seo_keywords'),
  seoIndexStatus: seoIndexStatusEnum('seo_index_status').default('index'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImageUrl: text('og_image_url'),
  canonicalUrl: text('canonical_url'),
  customCss: text('custom_css'),
  customJs: text('custom_js'),
  metadata: jsonb('metadata'), // Additional fields
  aiGenerated: boolean('ai_generated').default(false), // If AI assisted
  aiMetadata: jsonb('ai_metadata'), // AI generation details
  versionNumber: integer('version_number').default(1),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  publishedBy: uuid('published_by').references(() => users.id, { onDelete: 'set null' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugStatusIdx: uniqueIndex('articles_slug_status_idx').on(table.slug, table.status),
  statusIdx: index('articles_status_idx').on(table.status),
  visibilityIdx: index('articles_visibility_idx').on(table.visibility),
  publishedAtIdx: index('articles_published_at_idx').on(table.publishedAt),
  categoryIdIdx: index('articles_category_id_idx').on(table.categoryId),
  primaryAuthorIdIdx: index('articles_primary_author_id_idx').on(table.primaryAuthorId),
  featuredIdx: index('articles_featured_idx').on(table.isFeatured, table.publishedAt),
}));

export const articleAuthors = pgTable('article_authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').default(0),
  contributionType: varchar('contribution_type', { length: 50 }), // writer, editor, photographer
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleAuthorIdx: uniqueIndex('article_authors_article_author_idx').on(table.articleId, table.authorId),
  articleIdIdx: index('article_authors_article_id_idx').on(table.articleId),
  authorIdIdx: index('article_authors_author_id_idx').on(table.authorId),
}));

export const articleTags = pgTable('article_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleTagIdx: uniqueIndex('article_tags_article_tag_idx').on(table.articleId, table.tagId),
  articleIdIdx: index('article_tags_article_id_idx').on(table.articleId),
  tagIdIdx: index('article_tags_tag_id_idx').on(table.tagId),
}));

export const articleRevisions = pgTable('article_revisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  changes: jsonb('changes'), // Diff from previous version
  changeDescription: text('change_description'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleVersionIdx: uniqueIndex('article_revisions_article_version_idx').on(table.articleId, table.versionNumber),
  articleIdIdx: index('article_revisions_article_id_idx').on(table.articleId),
}));

export const editorialNotes = pgTable('editorial_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note: text('note').notNull(),
  isInternal: boolean('is_internal').default(true), // Internal vs public correction
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleIdIdx: index('editorial_notes_article_id_idx').on(table.articleId),
  userIdIdx: index('editorial_notes_user_id_idx').on(table.userId),
}));

export const relatedArticles = pgTable('related_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  relatedArticleId: uuid('related_article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  score: decimal('score', { precision: 5, scale: 4 }), // Relevance score
  isManual: boolean('is_manual').default(false), // Manually curated vs algorithmic
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleRelatedIdx: uniqueIndex('related_articles_article_related_idx').on(table.articleId, table.relatedArticleId),
  articleIdIdx: index('related_articles_article_id_idx').on(table.articleId),
}));

// ==================== SUBSCRIPTION & SAAS ====================

export const subscriptionPlans = pgTable('subscription_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  interval: planIntervalEnum('interval').notNull(),
  intervalCount: integer('interval_count').default(1).notNull(), // e.g., 3 months
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  trialDays: integer('trial_days').default(0),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  maxSubscribers: integer('max_subscribers'), // Limit for exclusive plans
  currentSubscribers: integer('current_subscribers').default(0),
  features: jsonb('features'), // Array of feature descriptions
  metadata: jsonb('metadata'),
  displayOrder: integer('display_order').default(0),
  stripePriceId: varchar('stripe_price_id', { length: 255 }), // External payment processor
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('subscription_plans_slug_idx').on(table.slug),
  activeIdx: index('subscription_plans_active_idx').on(table.isActive),
}));

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id),
  status: subscriptionStatusEnum('status').default('active').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  trialStartDate: timestamp('trial_start_date', { withTimezone: true }),
  trialEndDate: timestamp('trial_end_date', { withTimezone: true }),
  canceledAt: timestamp('canceled_at', { withTimezone: true }),
  cancelReason: text('cancel_reason'),
  pausedAt: timestamp('paused_at', { withTimezone: true }),
  resumesAt: timestamp('resumes_at', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  renewalCount: integer('renewal_count').default(0),
  autoRenew: boolean('auto_renew').default(true),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('subscriptions_user_id_idx').on(table.userId),
  planIdIdx: index('subscriptions_plan_id_idx').on(table.planId),
  statusIdx: index('subscriptions_status_idx').on(table.status),
  currentPeriodEndIdx: index('subscriptions_current_period_end_idx').on(table.currentPeriodEnd),
}));

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  transactionId: varchar('transaction_id', { length: 255 }), // External processor ID
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  paymentMethodDetails: jsonb('payment_method_details'), // Card last4, bank, etc.
  failureReason: text('failure_reason'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }).default('0'),
  refundedAt: timestamp('refunded_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('payments_user_id_idx').on(table.userId),
  subscriptionIdIdx: index('payments_subscription_id_idx').on(table.subscriptionId),
  statusIdx: index('payments_status_idx').on(table.status),
  transactionIdIdx: index('payments_transaction_id_idx').on(table.transactionId),
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  status: invoiceStatusEnum('status').default('draft').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  lineItems: jsonb('line_items'), // Array of {description, quantity, amount}
  billingAddress: jsonb('billing_address'),
  notes: text('notes'),
  pdfUrl: text('pdf_url'),
  stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  invoiceNumberIdx: uniqueIndex('invoices_invoice_number_idx').on(table.invoiceNumber),
  userIdIdx: index('invoices_user_id_idx').on(table.userId),
  statusIdx: index('invoices_status_idx').on(table.status),
}));

export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 200 }),
  description: text('description'),
  discountType: varchar('discount_type', { length: 20 }).notNull(), // percentage, fixed_amount
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }), // For fixed_amount
  maxRedemptions: integer('max_redemptions'),
  redemptionCount: integer('redemption_count').default(0),
  maxRedemptionsPerUser: integer('max_redemptions_per_user').default(1),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }),
  applicablePlans: jsonb('applicable_plans'), // Array of plan IDs or null for all
  isActive: boolean('is_active').default(true),
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: uniqueIndex('coupons_code_idx').on(table.code),
  activeIdx: index('coupons_active_idx').on(table.isActive),
}));

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  couponId: uuid('coupon_id').notNull().references(() => coupons.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  couponIdIdx: index('coupon_redemptions_coupon_id_idx').on(table.couponId),
  userIdIdx: index('coupon_redemptions_user_id_idx').on(table.userId),
}));

export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  key: varchar('key', { length: 200 }).notNull().unique(),
  description: text('description'),
  status: featureFlagStatusEnum('status').default('disabled').notNull(),
  rolloutPercentage: integer('rollout_percentage').default(0), // 0-100
  rolloutUserIds: jsonb('rollout_user_ids'), // Specific users
  planRestrictions: jsonb('plan_restrictions'), // Array of plan IDs with access
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: uniqueIndex('feature_flags_key_idx').on(table.key),
}));

export const usageLimits = pgTable('usage_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').references(() => subscriptionPlans.id),
  resourceType: varchar('resource_type', { length: 100 }).notNull(), // articles_read, downloads, exports
  limitValue: integer('limit_value').notNull(),
  usedValue: integer('used_value').default(0),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userResourceIdx: uniqueIndex('usage_limits_user_resource_idx').on(table.userId, table.resourceType, table.periodStart),
  userIdIdx: index('usage_limits_user_id_idx').on(table.userId),
}));

// ==================== PAYWALL & CONTENT ACCESS ====================

export const paywallRules = pgTable('paywall_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // metered, hard, category_based, tag_based
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0), // Higher = evaluated first
  conditions: jsonb('conditions'), // Complex rule logic
  freeArticleLimit: integer('free_article_limit'), // For metered paywall
  periodDays: integer('period_days').default(30), // Reset period
  applicableCategories: jsonb('applicable_categories'),
  applicableTags: jsonb('applicable_tags'),
  requiredPlans: jsonb('required_plans'), // Array of plan IDs
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activeIdx: index('paywall_rules_active_idx').on(table.isActive, table.priority),
}));

export const articleAccess = pgTable('article_access', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  accessType: varchar('access_type', { length: 50 }).notNull(), // subscription, promo, gifted, purchased
  grantedBy: uuid('granted_by').references(() => users.id),
  grantedAt: timestamp('granted_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
}, (table) => ({
  articleUserIdx: uniqueIndex('article_access_article_user_idx').on(table.articleId, table.userId),
  articleIdIdx: index('article_access_article_id_idx').on(table.articleId),
  userIdIdx: index('article_access_user_id_idx').on(table.userId),
}));

export const readingHistory = pgTable('reading_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  readPercentage: integer('read_percentage').default(0), // 0-100
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  scrollDepth: integer('scroll_depth').default(0), // Max scroll percentage
  isCompleted: boolean('is_completed').default(false),
  lastReadAt: timestamp('last_read_at', { withTimezone: true }).defaultNow().notNull(),
  firstReadAt: timestamp('first_read_at', { withTimezone: true }).defaultNow().notNull(),
  deviceType: varchar('device_type', { length: 50 }),
  metadata: jsonb('metadata'),
}, (table) => ({
  userArticleIdx: uniqueIndex('reading_history_user_article_idx').on(table.userId, table.articleId),
  userIdIdx: index('reading_history_user_id_idx').on(table.userId),
  articleIdIdx: index('reading_history_article_id_idx').on(table.articleId),
  lastReadAtIdx: index('reading_history_last_read_at_idx').on(table.lastReadAt),
}));

// ==================== MEDIA & ASSETS ====================

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalFilename: varchar('original_filename', { length: 500 }).notNull(),
  mimeType: mediaMimeTypeEnum('mime_type').notNull(),
  mediaType: mediaTypeEnum('media_type').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(), // Bytes
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'), // For video/audio in seconds
  url: text('url').notNull(),
  cdnUrl: text('cdn_url'),
  thumbnailUrl: text('thumbnail_url'),
  storageProvider: varchar('storage_provider', { length: 50 }).default('s3'), // s3, cloudinary, local
  storagePath: text('storage_path'),
  storageKey: text('storage_key'),
  blurhash: varchar('blurhash', { length: 100 }), // For image placeholders
  altText: text('alt_text'),
  caption: text('caption'),
  credit: text('credit'),
  exifData: jsonb('exif_data'),
  metadata: jsonb('metadata'),
  isPublic: boolean('is_public').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uploadedByIdx: index('media_uploaded_by_idx').on(table.uploadedBy),
  mediaTypeIdx: index('media_media_type_idx').on(table.mediaType),
  createdAtIdx: index('media_created_at_idx').on(table.createdAt),
}));

export const mediaVariants = pgTable('media_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  mediaId: uuid('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  variantName: varchar('variant_name', { length: 100 }).notNull(), // thumbnail, medium, large, webp
  width: integer('width'),
  height: integer('height'),
  fileSize: bigint('file_size', { mode: 'number' }),
  url: text('url').notNull(),
  format: varchar('format', { length: 20 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  mediaVariantIdx: uniqueIndex('media_variants_media_variant_idx').on(table.mediaId, table.variantName),
  mediaIdIdx: index('media_variants_media_id_idx').on(table.mediaId),
}));

// ==================== PLATFORM PAGES ====================

export const pages = pgTable('pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: varchar('slug', { length: 300 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  pageType: pageTypeEnum('page_type').default('static').notNull(),
  templateName: varchar('template_name', { length: 100 }),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  parentId: uuid('parent_id'),
  displayOrder: integer('display_order').default(0),
  showInMenu: boolean('show_in_menu').default(false),
  showInFooter: boolean('show_in_footer').default(false),
  customCss: text('custom_css'),
  customJs: text('custom_js'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoIndexStatus: seoIndexStatusEnum('seo_index_status').default('index'),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('pages_slug_idx').on(table.slug),
  pageTypeIdx: index('pages_page_type_idx').on(table.pageType),
  publishedIdx: index('pages_published_idx').on(table.isPublished, table.publishedAt),
}));

// ==================== COMMUNITY & ENGAGEMENT ====================

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  content: text('content').notNull(),
  status: commentStatusEnum('status').default('pending').notNull(),
  likeCount: integer('like_count').default(0),
  replyCount: integer('reply_count').default(0),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleIdIdx: index('comments_article_id_idx').on(table.articleId),
  userIdIdx: index('comments_user_id_idx').on(table.userId),
  parentIdIdx: index('comments_parent_id_idx').on(table.parentId),
  statusIdx: index('comments_status_idx').on(table.status),
  createdAtIdx: index('comments_created_at_idx').on(table.createdAt),
}));

export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'cascade' }),
  commentId: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  reactionType: reactionTypeEnum('reaction_type').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userArticleReactionIdx: uniqueIndex('reactions_user_article_reaction_idx').on(table.userId, table.articleId, table.reactionType),
  userCommentReactionIdx: uniqueIndex('reactions_user_comment_reaction_idx').on(table.userId, table.commentId, table.reactionType),
  articleIdIdx: index('reactions_article_id_idx').on(table.articleId),
  commentIdIdx: index('reactions_comment_id_idx').on(table.commentId),
}));

export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  collectionId: uuid('collection_id'),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userArticleIdx: uniqueIndex('bookmarks_user_article_idx').on(table.userId, table.articleId),
  userIdIdx: index('bookmarks_user_id_idx').on(table.userId),
  articleIdIdx: index('bookmarks_article_id_idx').on(table.articleId),
}));

export const bookmarkCollections = pgTable('bookmark_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  bookmarkCount: integer('bookmark_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('bookmark_collections_user_id_idx').on(table.userId),
}));

export const follows = pgTable('follows', {
  id: uuid('id').primaryKey().defaultRandom(),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').references(() => users.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').references(() => authors.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  followerFollowingIdx: uniqueIndex('follows_follower_following_idx').on(table.followerId, table.followingId),
  followerAuthorIdx: uniqueIndex('follows_follower_author_idx').on(table.followerId, table.authorId),
  followerCategoryIdx: uniqueIndex('follows_follower_category_idx').on(table.followerId, table.categoryId),
  followerTagIdx: uniqueIndex('follows_follower_tag_idx').on(table.followerId, table.tagId),
  followerIdIdx: index('follows_follower_id_idx').on(table.followerId),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('notifications_user_id_idx').on(table.userId),
  isReadIdx: index('notifications_is_read_idx').on(table.isRead),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

// ==================== ANALYTICS & TELEMETRY ====================

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sessionId: uuid('session_id'),
  eventType: eventTypeEnum('event_type').notNull(),
  eventName: varchar('event_name', { length: 200 }),
  articleId: uuid('article_id').references(() => articles.id, { onDelete: 'set null' }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  referrer: text('referrer'),
  utmSource: varchar('utm_source', { length: 200 }),
  utmMedium: varchar('utm_medium', { length: 200 }),
  utmCampaign: varchar('utm_campaign', { length: 200 }),
  utmTerm: varchar('utm_term', { length: 200 }),
  utmContent: varchar('utm_content', { length: 200 }),
  deviceType: varchar('device_type', { length: 50 }),
  browser: varchar('browser', { length: 100 }),
  os: varchar('os', { length: 100 }),
  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  properties: jsonb('properties'), // Additional event data
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('analytics_events_user_id_idx').on(table.userId),
  sessionIdIdx: index('analytics_events_session_id_idx').on(table.sessionId),
  eventTypeIdx: index('analytics_events_event_type_idx').on(table.eventType),
  articleIdIdx: index('analytics_events_article_id_idx').on(table.articleId),
  timestampIdx: index('analytics_events_timestamp_idx').on(table.timestamp),
}));

export const articleMetrics = pgTable('article_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  viewCount: integer('view_count').default(0),
  uniqueViewCount: integer('unique_view_count').default(0),
  readCount: integer('read_count').default(0),
  averageReadTime: integer('average_read_time').default(0), // Seconds
  shareCount: integer('share_count').default(0),
  commentCount: integer('comment_count').default(0),
  reactionCount: integer('reaction_count').default(0),
  bookmarkCount: integer('bookmark_count').default(0),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }),
  avgScrollDepth: decimal('avg_scroll_depth', { precision: 5, scale: 2 }),
  conversionRate: decimal('conversion_rate', { precision: 5, scale: 2 }), // Free to paid
  revenueGenerated: decimal('revenue_generated', { precision: 10, scale: 2 }).default('0'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  articleDateIdx: uniqueIndex('article_metrics_article_date_idx').on(table.articleId, table.date),
  articleIdIdx: index('article_metrics_article_id_idx').on(table.articleId),
  dateIdx: index('article_metrics_date_idx').on(table.date),
}));

export const searchQueries = pgTable('search_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  query: text('query').notNull(),
  resultsCount: integer('results_count').default(0),
  clickedArticleId: uuid('clicked_article_id').references(() => articles.id, { onDelete: 'set null' }),
  clickPosition: integer('click_position'),
  sessionId: uuid('session_id'),
  ipAddress: inet('ip_address'),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('search_queries_user_id_idx').on(table.userId),
  queryIdx: index('search_queries_query_idx').on(table.query),
  timestampIdx: index('search_queries_timestamp_idx').on(table.timestamp),
}));

// ==================== NEWSLETTERS & EMAIL ====================

export const newsletters = pgTable('newsletters', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  description: text('description'),
  fromName: varchar('from_name', { length: 200 }).notNull(),
  fromEmail: varchar('from_email', { length: 255 }).notNull(),
  replyToEmail: varchar('reply_to_email', { length: 255 }),
  frequency: varchar('frequency', { length: 50 }), // daily, weekly, monthly
  sendTime: varchar('send_time', { length: 10 }), // HH:MM format
  isActive: boolean('is_active').default(true),
  subscriberCount: integer('subscriber_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('newsletters_slug_idx').on(table.slug),
}));

export const newsletterSubscriptions = pgTable('newsletter_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // active, unsubscribed, bounced
  unsubscribeToken: varchar('unsubscribe_token', { length: 255 }).notNull(),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  unsubscribeReason: text('unsubscribe_reason'),
  metadata: jsonb('metadata'),
  subscribedAt: timestamp('subscribed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailNewsletterIdx: uniqueIndex('newsletter_subscriptions_email_newsletter_idx').on(table.email, table.newsletterId),
  newsletterIdIdx: index('newsletter_subscriptions_newsletter_id_idx').on(table.newsletterId),
  userIdIdx: index('newsletter_subscriptions_user_id_idx').on(table.userId),
}));

export const newsletterCampaigns = pgTable('newsletter_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  newsletterId: uuid('newsletter_id').notNull().references(() => newsletters.id, { onDelete: 'cascade' }),
  subject: text('subject').notNull(),
  preheader: text('preheader'),
  content: text('content').notNull(),
  htmlContent: text('html_content'),
  status: varchar('status', { length: 20 }).default('draft').notNull(), // draft, scheduled, sending, sent
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  recipientCount: integer('recipient_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  unsubscribeCount: integer('unsubscribe_count').default(0),
  bounceCount: integer('bounce_count').default(0),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  newsletterIdIdx: index('newsletter_campaigns_newsletter_id_idx').on(table.newsletterId),
  statusIdx: index('newsletter_campaigns_status_idx').on(table.status),
  scheduledAtIdx: index('newsletter_campaigns_scheduled_at_idx').on(table.scheduledAt),
}));

export const emailTemplates = pgTable('email_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  type: emailTemplateTypeEnum('type').notNull(),
  subject: text('subject').notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  variables: jsonb('variables'), // Available template variables
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex('email_templates_slug_idx').on(table.slug),
  typeIdx: index('email_templates_type_idx').on(table.type),
}));

// ==================== ADVANCED FEATURES ====================

export const experiments = pgTable('experiments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  key: varchar('key', { length: 200 }).notNull().unique(),
  description: text('description'),
  hypothesis: text('hypothesis'),
  status: experimentStatusEnum('status').default('draft').notNull(),
  variants: jsonb('variants').notNull(), // Array of {id, name, weight, config}
  targetingRules: jsonb('targeting_rules'),
  trafficAllocation: integer('traffic_allocation').default(100), // Percentage
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  winningVariantId: varchar('winning_variant_id', { length: 100 }),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: uniqueIndex('experiments_key_idx').on(table.key),
  statusIdx: index('experiments_status_idx').on(table.status),
}));

export const experimentAssignments = pgTable('experiment_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  experimentId: uuid('experiment_id').notNull().references(() => experiments.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id'),
  variantId: varchar('variant_id', { length: 100 }).notNull(),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  experimentUserIdx: uniqueIndex('experiment_assignments_experiment_user_idx').on(table.experimentId, table.userId),
  experimentSessionIdx: uniqueIndex('experiment_assignments_experiment_session_idx').on(table.experimentId, table.sessionId),
  experimentIdIdx: index('experiment_assignments_experiment_id_idx').on(table.experimentId),
}));

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  url: text('url').notNull(),
  events: jsonb('events').notNull(), // Array of webhook event types
  secret: varchar('secret', { length: 255 }).notNull(),
  status: webhookStatusEnum('status').default('active').notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  failureCount: integer('failure_count').default(0),
  lastError: text('last_error'),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('webhooks_status_idx').on(table.status),
}));

export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  event: webhookEventEnum('event').notNull(),
  payload: jsonb('payload').notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  errorMessage: text('error_message'),
  attemptCount: integer('attempt_count').default(1),
  succeededAt: timestamp('succeeded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  webhookIdIdx: index('webhook_logs_webhook_id_idx').on(table.webhookId),
  createdAtIdx: index('webhook_logs_created_at_idx').on(table.createdAt),
}));

export const redirects = pgTable('redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourcePath: varchar('source_path', { length: 500 }).notNull().unique(),
  targetPath: varchar('target_path', { length: 500 }).notNull(),
  statusCode: integer('status_code').default(301).notNull(), // 301, 302, 307, 308
  isActive: boolean('is_active').default(true),
  hitCount: integer('hit_count').default(0),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sourcePathIdx: uniqueIndex('redirects_source_path_idx').on(table.sourcePath),
  activeIdx: index('redirects_active_idx').on(table.isActive),
}));

export const sitemapEntries = pgTable('sitemap_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull().unique(),
  priority: decimal('priority', { precision: 2, scale: 1 }).default('0.5'),
  changeFrequency: varchar('change_frequency', { length: 20 }).default('weekly'), // always, hourly, daily, weekly, monthly, yearly, never
  lastModified: timestamp('last_modified', { withTimezone: true }).notNull(),
  resourceType: varchar('resource_type', { length: 50 }), // article, page, category
  resourceId: uuid('resource_id'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  urlIdx: uniqueIndex('sitemap_entries_url_idx').on(table.url),
  activeIdx: index('sitemap_entries_active_idx').on(table.isActive),
}));

// ==================== INTERNAL TOOLS ====================

export const scheduledJobs = pgTable('scheduled_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobType: varchar('job_type', { length: 100 }).notNull(),
  jobName: varchar('job_name', { length: 200 }),
  payload: jsonb('payload'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, running, completed, failed
  priority: integer('priority').default(0),
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  maxRetries: integer('max_retries').default(3),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusScheduledIdx: index('scheduled_jobs_status_scheduled_idx').on(table.status, table.scheduledFor),
  jobTypeIdx: index('scheduled_jobs_job_type_idx').on(table.jobType),
}));

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 200 }).notNull().unique(),
  value: jsonb('value').notNull(),
  valueType: varchar('value_type', { length: 50 }).notNull(), // string, number, boolean, json
  description: text('description'),
  isPublic: boolean('is_public').default(false), // Exposed to frontend
  isEncrypted: boolean('is_encrypted').default(false),
  category: varchar('category', { length: 100 }),
  metadata: jsonb('metadata'),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: uniqueIndex('system_settings_key_idx').on(table.key),
  categoryIdx: index('system_settings_category_idx').on(table.category),
}));

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull().unique(), // Hashed API key
  keyPrefix: varchar('key_prefix', { length: 10 }).notNull(), // First few chars for identification
  scopes: jsonb('scopes').notNull(), // Array of allowed permissions
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  usageCount: integer('usage_count').default(0),
  rateLimit: integer('rate_limit').default(1000), // Requests per hour
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
  userIdIdx: index('api_keys_user_id_idx').on(table.userId),
  activeIdx: index('api_keys_active_idx').on(table.isActive),
}));

export const rateLimits = pgTable('rate_limits', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(), // IP, user ID, API key
  resource: varchar('resource', { length: 100 }).notNull(), // login, api, article_view
  requestCount: integer('request_count').default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  identifierResourceWindowIdx: uniqueIndex('rate_limits_identifier_resource_window_idx').on(table.identifier, table.resource, table.windowStart),
  windowEndIdx: index('rate_limits_window_end_idx').on(table.windowEnd),
}));

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  permissions: many(userPermissions),
  sessions: many(sessions),
  subscriptions: many(subscriptions),
  payments: many(payments),
  invoices: many(invoices),
  articles: many(articles),
  comments: many(comments),
  reactions: many(reactions),
  bookmarks: many(bookmarks),
  following: many(follows, { relationName: 'follower' }),
  followers: many(follows, { relationName: 'following' }),
  notifications: many(notifications),
  readingHistory: many(readingHistory),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
  users: many(userPermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  primaryAuthor: one(authors, {
    fields: [articles.primaryAuthorId],
    references: [authors.id],
  }),
  authors: many(articleAuthors),
  tags: many(articleTags),
  revisions: many(articleRevisions),
  comments: many(comments),
  reactions: many(reactions),
  bookmarks: many(bookmarks),
  metrics: many(articleMetrics),
}));

export const articleAuthorsRelations = relations(articleAuthors, ({ one }) => ({
  article: one(articles, {
    fields: [articleAuthors.articleId],
    references: [articles.id],
  }),
  author: one(authors, {
    fields: [articleAuthors.authorId],
    references: [authors.id],
  }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoryHierarchy',
  }),
  children: many(categories, {
    relationName: 'categoryHierarchy',
  }),
  articles: many(articles),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
  payments: many(payments),
  invoices: many(invoices),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
  reactions: many(reactions),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  parent: one(pages, {
    fields: [pages.parentId],
    references: [pages.id],
    relationName: 'pageHierarchy',
  }),
  children: many(pages, {
    relationName: 'pageHierarchy',
  }),
}));

export const bookmarkCollectionsRelations = relations(bookmarkCollections, ({ one, many }) => ({
  user: one(users, {
    fields: [bookmarkCollections.userId],
    references: [users.id],
  }),
  bookmarks: many(bookmarks),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [bookmarks.articleId],
    references: [articles.id],
  }),
  collection: one(bookmarkCollections, {
    fields: [bookmarks.collectionId],
    references: [bookmarkCollections.id],
  }),
}));