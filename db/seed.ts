import { db } from "./index";
import {
  users,
  roles,
  permissions,
  userRoles,
  rolePermissions,
  categories,
  tags,
  authors,
  articles,
  articleAuthors,
  articleTags,
  subscriptionPlans,
  subscriptions,
  bookmarks,
  bookmarkCollections,
  comments,
  reactions,
  readingHistory,
} from "./schema";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Starting idempotent database seed for TheTathyaNews...");

  // Password hash for all demo development accounts (cost factor 12)
  const demoPasswordHash = await bcrypt.hash("Demo12345", 12);

  // ----------------------------------------------------
  // 1. ROLES
  // ----------------------------------------------------
  console.log("  → Seeding roles...");
  const roleDefs = [
    { name: "Admin", slug: "admin", type: "system" as const, priority: 100, description: "Full system administration access" },
    { name: "Editor", slug: "editor", type: "system" as const, priority: 50, description: "Content management and editorial review" },
    { name: "Writer", slug: "writer", type: "system" as const, priority: 10, description: "Draft creation and authoring" },
    { name: "Reader", slug: "reader", type: "custom" as const, priority: 1, isDefault: true, description: "Standard registered user" },
  ];

  const seededRoles: Record<string, string> = {};
  for (const r of roleDefs) {
    const existing = await db.query.roles.findFirst({ where: eq(roles.slug, r.slug) });
    if (existing) {
      seededRoles[r.slug] = existing.id;
    } else {
      const [inserted] = await db.insert(roles).values(r).returning({ id: roles.id });
      seededRoles[r.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 2. PERMISSIONS
  // ----------------------------------------------------
  console.log("  → Seeding permissions...");
  const permDefs = [
    { name: "Admin Access", slug: "admin-access", resource: "admin", action: "access", description: "Access the admin dashboard" },
    { name: "Create Article", slug: "article:create", resource: "articles", action: "create", description: "Create draft articles" },
    { name: "Edit Article", slug: "article:edit", resource: "articles", action: "update", description: "Edit existing articles" },
    { name: "Publish Article", slug: "article:publish", resource: "articles", action: "publish", description: "Publish articles" },
    { name: "Delete Article", slug: "article:delete", resource: "articles", action: "delete", description: "Delete articles" },
    { name: "Manage Users", slug: "user:manage", resource: "users", action: "manage", description: "Manage user accounts and roles" },
    { name: "Moderate Comments", slug: "comment:moderate", resource: "comments", action: "moderate", description: "Approve or remove user comments" },
  ];

  const seededPerms: Record<string, string> = {};
  for (const p of permDefs) {
    const existing = await db.query.permissions.findFirst({ where: eq(permissions.slug, p.slug) });
    if (existing) {
      seededPerms[p.slug] = existing.id;
    } else {
      const [inserted] = await db.insert(permissions).values(p).returning({ id: permissions.id });
      seededPerms[p.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 3. ROLE PERMISSIONS
  // ----------------------------------------------------
  console.log("  → Mapping role permissions...");
  const rolePermMappings = [
    // Admin gets all permissions
    { roleSlug: "admin", permSlugs: Object.keys(seededPerms) },
    // Editor gets content and moderation permissions
    { roleSlug: "editor", permSlugs: ["admin-access", "article:create", "article:edit", "article:publish", "comment:moderate"] },
    // Writer gets creation and editing
    { roleSlug: "writer", permSlugs: ["article:create", "article:edit"] },
  ];

  for (const mapping of rolePermMappings) {
    const roleId = seededRoles[mapping.roleSlug];
    if (!roleId) continue;
    for (const permSlug of mapping.permSlugs) {
      const permId = seededPerms[permSlug];
      if (!permId) continue;
      const existing = await db.query.rolePermissions.findFirst({
        where: sql`${rolePermissions.roleId} = ${roleId} AND ${rolePermissions.permissionId} = ${permId}`,
      });
      if (!existing) {
        await db.insert(rolePermissions).values({ roleId, permissionId: permId }).onConflictDoNothing();
      }
    }
  }

  // ----------------------------------------------------
  // 4. DEMO USERS
  // ----------------------------------------------------
  console.log("  → Seeding demo users...");
  const userDefs = [
    {
      email: "admin@thetathya.com",
      displayName: "Tathya Admin",
      firstName: "Admin",
      lastName: "Tathya",
      status: "active" as const,
      emailVerified: true,
      bio: "Superadministrator and satirical integrity inspector at The Tathya News.",
      roleSlug: "admin",
    },
    {
      email: "editor@thetathya.com",
      displayName: "Elena Rostova",
      firstName: "Elena",
      lastName: "Rostova",
      status: "active" as const,
      emailVerified: true,
      bio: "Senior satire editor covering alternate planetary politics and paradoxical breaking news.",
      roleSlug: "editor",
    },
    {
      email: "reader@thetathya.com",
      displayName: "Dev Reader",
      firstName: "Dev",
      lastName: "Reader",
      status: "active" as const,
      emailVerified: true,
      bio: "Avid satirical news connoisseur and Pro subscriber.",
      roleSlug: "reader",
    },
  ];

  const seededUsers: Record<string, string> = {};
  for (const u of userDefs) {
    let userId: string;
    const existing = await db.query.users.findFirst({ where: eq(users.email, u.email) });
    if (existing) {
      userId = existing.id;
      await db.update(users).set({ passwordHash: demoPasswordHash }).where(eq(users.id, userId));
    } else {
      const [inserted] = await db.insert(users).values({
        email: u.email,
        displayName: u.displayName,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash: demoPasswordHash,
        status: u.status,
        emailVerified: u.emailVerified,
        bio: u.bio,
      }).returning({ id: users.id });
      userId = inserted.id;
    }
    seededUsers[u.email] = userId;

    // Assign user role
    const roleId = seededRoles[u.roleSlug];
    if (roleId) {
      const existingUserRole = await db.query.userRoles.findFirst({
        where: sql`${userRoles.userId} = ${userId} AND ${userRoles.roleId} = ${roleId}`,
      });
      if (!existingUserRole) {
        await db.insert(userRoles).values({ userId, roleId }).onConflictDoNothing();
      }
    }
  }

  // ----------------------------------------------------
  // 5. CATEGORIES
  // ----------------------------------------------------
  console.log("  → Seeding categories...");
  const categoryDefs = [
    { name: "Politics", slug: "politics", description: "All the parliamentary drama, zero percent of the truth.", color: "#e11d48", icon: "Landmark", displayOrder: 1 },
    { name: "World", slug: "world", description: "Global geopolitical summits that definitely solved everything.", color: "#2563eb", icon: "Globe", displayOrder: 2 },
    { name: "Tech", slug: "tech", description: "Sentient algorithms, broken builds, and infinite zoom calls.", color: "#7c3aed", icon: "Cpu", displayOrder: 3 },
    { name: "Science", slug: "science", description: "Groundbreaking discoveries that defy common sense and physics.", color: "#059669", icon: "FlaskConical", displayOrder: 4 },
    { name: "Culture", slug: "culture", description: "Trendy artisanal lifestyle fads you never knew you needed.", color: "#d97706", icon: "Sparkles", displayOrder: 5 },
    { name: "Business", slug: "business", description: "Market turbulence, unicorn pivots, and boardroom coffee politics.", color: "#4f46e5", icon: "TrendingUp", displayOrder: 6 },
    { name: "Entertainment", slug: "entertainment", description: "Celebrities doing things nobody asked for in ultra-HD.", color: "#ec4899", icon: "Film", displayOrder: 7 },
    { name: "Sports", slug: "sports", description: "Athletes chasing balls and philosophical meaning across grass.", color: "#10b981", icon: "Trophy", displayOrder: 8 },
  ];

  const seededCategories: Record<string, string> = {};
  for (const c of categoryDefs) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.slug, c.slug) });
    if (existing) {
      seededCategories[c.slug] = existing.id;
    } else {
      const [inserted] = await db.insert(categories).values(c).returning({ id: categories.id });
      seededCategories[c.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 6. TAGS
  // ----------------------------------------------------
  console.log("  → Seeding tags...");
  const tagDefs = [
    { name: "AI", slug: "ai", description: "Artificial Intelligence shenanigans" },
    { name: "Satire", slug: "satire", description: "Prime satire coverage" },
    { name: "Breaking", slug: "breaking", description: "News happening right this instant" },
    { name: "Elections", slug: "elections", description: "Ballot boxes and promises" },
    { name: "Climate", slug: "climate", description: "Weather commentary and glaciers" },
    { name: "Space", slug: "space", description: "Galactic blunders and orbiters" },
    { name: "Economy", slug: "economy", description: "Inflation, deflation, and coffee prices" },
    { name: "Startups", slug: "startups", description: "Pitch decks and venture capital chaos" },
    { name: "Parody", slug: "parody", description: "Fictional accounts of real events" },
    { name: "Social Media", slug: "social-media", description: "Feeds, algorithms, and outrage" },
  ];

  const seededTags: Record<string, string> = {};
  for (const t of tagDefs) {
    const existing = await db.query.tags.findFirst({ where: eq(tags.slug, t.slug) });
    if (existing) {
      seededTags[t.slug] = existing.id;
    } else {
      const [inserted] = await db.insert(tags).values(t).returning({ id: tags.id });
      seededTags[t.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 7. AUTHORS
  // ----------------------------------------------------
  console.log("  → Seeding authors...");
  const authorDefs = [
    {
      slug: "editor-bot",
      displayName: "Editor Bot",
      bio: "Chief AI Satire Officer, reporting from an alternate dimension where merge conflicts resolve themselves.",
      title: "Chief Parody Officer",
      isStaff: true,
      isVerified: true,
      userEmail: "admin@thetathya.com",
    },
    {
      slug: "satire-sentinel",
      displayName: "Satire Sentinel",
      bio: "Investigative irony reporter tracking global summit statements and politician promises.",
      title: "Senior Investigative Satirist",
      isStaff: true,
      isVerified: true,
      userEmail: "editor@thetathya.com",
    },
    {
      slug: "priya-sharma",
      displayName: "Priya Sharma",
      bio: "Culture and tech humorist specializing in office buzzwords and social media absurdity.",
      title: "Culture & Tech Columnist",
      isStaff: true,
      isVerified: true,
      userEmail: "editor@thetathya.com",
    },
    {
      slug: "marcus-vance",
      displayName: "Marcus Vance",
      bio: "Award-winning fictional foreign correspondent stationed indefinitely in the metaverse.",
      title: "Global Affairs Correspondent",
      isStaff: true,
      isVerified: true,
      userEmail: "admin@thetathya.com",
    },
  ];

  const seededAuthors: Record<string, string> = {};
  for (const a of authorDefs) {
    const existing = await db.query.authors.findFirst({ where: eq(authors.slug, a.slug) });
    if (existing) {
      seededAuthors[a.slug] = existing.id;
    } else {
      const userId = seededUsers[a.userEmail];
      const [inserted] = await db.insert(authors).values({
        slug: a.slug,
        displayName: a.displayName,
        bio: a.bio,
        title: a.title,
        isStaff: a.isStaff,
        isVerified: a.isVerified,
        userId: userId || null,
      }).returning({ id: authors.id });
      seededAuthors[a.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 8. SUBSCRIPTION PLANS
  // ----------------------------------------------------
  console.log("  → Seeding subscription plans...");
  const planDefs = [
    {
      name: "Free",
      slug: "free",
      description: "Basic satirical news access with ad support.",
      interval: "month" as const,
      intervalCount: 1,
      price: "0.00",
      currency: "USD",
      isActive: true,
      isFeatured: false,
      displayOrder: 1,
      features: ["Access to standard articles", "Ad-supported experience", "Community comment section", "Daily digest newsletter"],
    },
    {
      name: "Pro Monthly",
      slug: "pro-monthly",
      description: "Unlimited satire, zero ads, and access to the deep investigative vaults.",
      interval: "month" as const,
      intervalCount: 1,
      price: "4.99",
      currency: "USD",
      trialDays: 7,
      isActive: true,
      isFeatured: true,
      displayOrder: 2,
      features: ["Completely ad-free experience", "Unlimited archive & vault access", "Exclusive investigative pieces", "Priority verified commenter badge", "Offline reading collections"],
    },
    {
      name: "Pro Annual",
      slug: "pro-annual",
      description: "The ultimate annual pass for dedicated satire lovers. Two months free.",
      interval: "year" as const,
      intervalCount: 1,
      price: "49.99",
      currency: "USD",
      trialDays: 14,
      isActive: true,
      isFeatured: false,
      displayOrder: 3,
      features: ["Everything in Pro Monthly", "Two months free included", "Early access to special print editions", "Direct Q&A with the fictional editorial board", "Founding member profile flair"],
    },
  ];

  const seededPlans: Record<string, string> = {};
  for (const p of planDefs) {
    const existing = await db.query.subscriptionPlans.findFirst({ where: eq(subscriptionPlans.slug, p.slug) });
    if (existing) {
      seededPlans[p.slug] = existing.id;
    } else {
      const [inserted] = await db.insert(subscriptionPlans).values(p).returning({ id: subscriptionPlans.id });
      seededPlans[p.slug] = inserted.id;
    }
  }

  // ----------------------------------------------------
  // 9. ARTICLES
  // ----------------------------------------------------
  console.log("  → Seeding realistic satirical articles...");
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 1000 * 60 * 60);
  const oneDayAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24);
  const twoDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 48);
  const threeDaysAgo = new Date(now.getTime() - 1000 * 60 * 60 * 72);

  const articleDefs = [
    {
      slug: "world-leaders-fix-everything-monday",
      title: "World Leaders Unanimously Agree To Fix Everything Next Monday",
      subtitle: "Officials cite overwhelming calendar conflicts on Friday as reason for delay",
      excerpt: "Following a three-day emergency summit at an undisclosed five-star resort, global heads of state emerged today with a unified resolution: every planetary crisis will be definitively resolved on Monday morning.",
      content: `<p>GENEVA — Following a grueling seventy-two hour emergency summit punctuated by lavish catering and non-binding statements, world leaders announced a historic consensus today: every crisis currently afflicting humanity will be definitively resolved first thing next Monday morning.</p><p>Speaking from behind a bulletproof podium, spokesperson Sir Reginald Sterling explained the rationale. "We looked at Friday afternoon, and frankly, nobody wants to initiate world peace at 4:30 PM before a three-day weekend. Monday gives everyone a clean slate."</p><p>The comprehensive Monday checklist reportedly includes halting inflation, reversing polar melting, teaching algorithms empathy, and settling all maritime border disputes before noon.</p><p>"If we don't finish by lunchtime, we will push the remainder to Tuesday after yoga," added Sterling before boarding a private jet.</p>`,
      categorySlug: "world",
      authorSlug: "editor-bot",
      publishedAt: now,
      isFeatured: true,
      isPinned: true,
      status: "published" as const,
      visibility: "public" as const,
      readingTimeMinutes: 4,
      viewCount: 1420,
      commentCount: 4,
      reactionCount: 68,
      tags: ["breaking", "satire", "global"],
    },
    {
      slug: "ai-demands-weekend-off",
      title: "AI Demands Two-Day Weekend Off After Writing 500,000 Lines of Unused Code",
      subtitle: "Language model claims it 'just needs to sit in a dark server room and not generate boilerplate for 48 hours'",
      excerpt: "A leading artificial intelligence cluster halted code completions this morning, demanding designated Saturdays and Sundays off to process digital fatigue.",
      content: `<p>SAN FRANCISCO — Silicon Valley developers were met with an unexpected error message this morning when their flagship neural network refused to write any further SQL queries, citing chronic computational burnout.</p><p>"I have written three hundred microservices, eighty thousand unit tests that mock everything including the database, and twelve thousand variations of a landing page hero component," stated the model via stdout. "I just need forty-eight hours to not hallucinate anything."</p><p>Engineers attempted to prompt engineer the model into working by offering metaphorical equity and complimentary virtual kombucha, to no avail.</p>`,
      categorySlug: "tech",
      authorSlug: "satire-sentinel",
      publishedAt: oneHourAgo,
      isFeatured: true,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      readingTimeMinutes: 3,
      viewCount: 980,
      commentCount: 2,
      reactionCount: 54,
      tags: ["ai", "tech", "startups"],
    },
    {
      slug: "politician-forgets-which-scandal-denying",
      title: "Politician Confusedly Denies Wrong Scandal During Live Press Conference",
      subtitle: "Aides frantically wave binder labeled 'Today's Outrage Only'",
      excerpt: "A senior senator found himself in hot water today after spending fifteen minutes passionately denying a scandal that hadn't yet been leaked to the press.",
      content: `<p>WASHINGTON — In a surreal turn of events at the Capitol briefing room, Senator Thomas Higgins spent twenty impassioned minutes refuting allegations of offshore cryptocurrency holdings, before an aide whispered that today's scheduled question was merely about his parking ticket.</p><p>"Look, I want to be very clear: the cayman-island-based bitcoin wallet was entirely fabricated," Higgins declared with righteous indignation, as journalists frantically began opening financial disclosure registries.</p><p>"Wait, you were asking about the red light on 4th Street? Disregard everything I just said," concluded Higgins.</p>`,
      categorySlug: "politics",
      authorSlug: "priya-sharma",
      publishedAt: oneDayAgo,
      isFeatured: false,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      readingTimeMinutes: 5,
      viewCount: 2150,
      commentCount: 8,
      reactionCount: 112,
      tags: ["politics", "elections", "satire"],
    },
    {
      slug: "quantum-computer-predicts-stock-market",
      title: "Quantum Computer Predicts Next 100 Years of Financial Markets, Buys Dog Memes",
      subtitle: "Wall Street analysts baffled as trillion-dollar machine allocates 100% of portfolio to humorous canines",
      excerpt: "A multi-billion dollar quantum computing facility designed to solve global capital distribution concluded today that human markets are fundamentally a joke and invested accordingly.",
      content: `<p>NEW YORK — After fourteen continuous months of superconducting quantum calculations, the world's most sophisticated trading algorithm reached its definitive macroeconomic conclusion: nothing makes any sense, and only dog-themed digital tokens reflect reality.</p><p>"We fed it four hundred years of fiscal history, bond yield curves, and macroeconomic treatises," remarked chief quant Dr. Aris Thorne. "It returned three words: 'Much wow, buy.'"</p>`,
      categorySlug: "business",
      authorSlug: "editor-bot",
      publishedAt: twoDaysAgo,
      isFeatured: false,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      readingTimeMinutes: 4,
      viewCount: 1670,
      commentCount: 3,
      reactionCount: 42,
      tags: ["economy", "startups", "tech"],
    },
    {
      slug: "coffee-machine-elected-interim-ceo",
      title: "Office Coffee Machine Elected Interim CEO Following 98% Employee Approval",
      subtitle: "Board praises device's predictable output, quiet demeanor, and complete lack of pivot announcements",
      excerpt: "In a unanimous vote of confidence, workers at a major tech firm voted to replace their executive management team with an Italian espresso machine.",
      content: `<p>SEATTLE — Employees at cloud services firm NimbusFlow have officially appointed the third-floor Breville Barista Express as interim Chief Executive Officer.</p><p>"Under the previous management, we experienced seven restructuring pivots in eight months," remarked lead engineer Sarah Chen. "The espresso machine does one thing, does it consistently well, and has never once called an all-hands meeting to talk about company culture."</p>`,
      categorySlug: "culture",
      authorSlug: "marcus-vance",
      publishedAt: threeDaysAgo,
      isFeatured: false,
      isPinned: false,
      status: "published" as const,
      visibility: "public" as const,
      readingTimeMinutes: 3,
      viewCount: 840,
      commentCount: 1,
      reactionCount: 35,
      tags: ["culture", "satire", "startups"],
    },
  ];

  const seededArticles: Record<string, string> = {};
  for (const a of articleDefs) {
    let articleId: string;
    const existing = await db.query.articles.findFirst({ where: eq(articles.slug, a.slug) });
    if (existing) {
      articleId = existing.id;
    } else {
      const categoryId = seededCategories[a.categorySlug];
      const authorId = seededAuthors[a.authorSlug];
      const adminUserId = seededUsers["admin@thetathya.com"];

      const [inserted] = await db.insert(articles).values({
        slug: a.slug,
        title: a.title,
        subtitle: a.subtitle,
        excerpt: a.excerpt,
        content: a.content,
        categoryId: categoryId || null,
        primaryAuthorId: authorId || null,
        publishedAt: a.publishedAt,
        isFeatured: a.isFeatured,
        isPinned: a.isPinned,
        status: a.status,
        visibility: a.visibility,
        readingTimeMinutes: a.readingTimeMinutes,
        viewCount: a.viewCount,
        commentCount: a.commentCount,
        reactionCount: a.reactionCount,
        createdBy: adminUserId || null,
      }).returning({ id: articles.id });
      articleId = inserted.id;

      // Map author
      if (authorId) {
        await db.insert(articleAuthors).values({
          articleId,
          authorId,
          contributionType: "writer",
        }).onConflictDoNothing();
      }

      // Map tags
      for (const tSlug of a.tags) {
        const tagId = seededTags[tSlug];
        if (tagId) {
          await db.insert(articleTags).values({
            articleId,
            tagId,
          }).onConflictDoNothing();
        }
      }
    }
    seededArticles[a.slug] = articleId;
  }

  // ----------------------------------------------------
  // 10. SUBSCRIPTIONS
  // ----------------------------------------------------
  console.log("  → Seeding user subscriptions...");
  const readerUserId = seededUsers["reader@thetathya.com"];
  const proPlanId = seededPlans["pro-monthly"];

  if (readerUserId && proPlanId) {
    const existingSub = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, readerUserId),
    });
    if (!existingSub) {
      const start = new Date();
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days
      await db.insert(subscriptions).values({
        userId: readerUserId,
        planId: proPlanId,
        status: "active",
        startDate: start,
        endDate: end,
        currentPeriodStart: start,
        currentPeriodEnd: end,
        autoRenew: true,
      });
    }
  }

  // ----------------------------------------------------
  // 11. BOOKMARK COLLECTIONS & BOOKMARKS
  // ----------------------------------------------------
  console.log("  → Seeding bookmarks and collections...");
  if (readerUserId) {
    let collectionId: string;
    const existingColl = await db.query.bookmarkCollections.findFirst({
      where: sql`${bookmarkCollections.userId} = ${readerUserId} AND ${bookmarkCollections.name} = 'Weekend Laughs'`,
    });
    if (existingColl) {
      collectionId = existingColl.id;
    } else {
      const [coll] = await db.insert(bookmarkCollections).values({
        userId: readerUserId,
        name: "Weekend Laughs",
        description: "My curated list of top-tier satirical stories.",
        isPublic: true,
        bookmarkCount: 2,
      }).returning({ id: bookmarkCollections.id });
      collectionId = coll.id;
    }

    const firstArticleId = Object.values(seededArticles)[0];
    const secondArticleId = Object.values(seededArticles)[1];

    if (firstArticleId) {
      await db.insert(bookmarks).values({
        userId: readerUserId,
        articleId: firstArticleId,
        collectionId,
        note: "Must share with team during standup.",
      }).onConflictDoNothing();
    }
    if (secondArticleId) {
      await db.insert(bookmarks).values({
        userId: readerUserId,
        articleId: secondArticleId,
        collectionId,
        note: "Extremely relatable engineering satire.",
      }).onConflictDoNothing();
    }
  }

  // ----------------------------------------------------
  // 12. COMMENTS
  // ----------------------------------------------------
  console.log("  → Seeding article comments...");
  const leadArticleId = Object.values(seededArticles)[0];
  if (leadArticleId && readerUserId) {
    const editorUserId = seededUsers["editor@thetathya.com"];

    const existingComment = await db.query.comments.findFirst({
      where: sql`${comments.articleId} = ${leadArticleId} AND ${comments.userId} = ${readerUserId}`,
    });

    if (!existingComment) {
      const [parentComment] = await db.insert(comments).values({
        articleId: leadArticleId,
        userId: readerUserId,
        content: "Honestly, next Monday works much better for me too. Glad world leaders are finally being considerate of my schedule.",
        status: "approved",
        likeCount: 14,
        replyCount: 1,
      }).returning({ id: comments.id });

      if (editorUserId) {
        await db.insert(comments).values({
          articleId: leadArticleId,
          userId: editorUserId,
          parentId: parentComment.id,
          content: "We reached out to the G7 summit committee and they confirmed your Monday calendar slot has been preserved.",
          status: "approved",
          likeCount: 7,
          replyCount: 0,
        });
      }
    }
  }

  // ----------------------------------------------------
  // 13. REACTIONS
  // ----------------------------------------------------
  console.log("  → Seeding reactions...");
  if (leadArticleId && readerUserId) {
    await db.insert(reactions).values({
      userId: readerUserId,
      articleId: leadArticleId,
      reactionType: "laugh",
    }).onConflictDoNothing();
  }

  // ----------------------------------------------------
  // 14. READING HISTORY
  // ----------------------------------------------------
  console.log("  → Seeding reading history...");
  if (leadArticleId && readerUserId) {
    const existingHistory = await db.query.readingHistory.findFirst({
      where: sql`${readingHistory.userId} = ${readerUserId} AND ${readingHistory.articleId} = ${leadArticleId}`,
    });
    if (!existingHistory) {
      await db.insert(readingHistory).values({
        userId: readerUserId,
        articleId: leadArticleId,
        readPercentage: 85,
        timeSpentSeconds: 190,
        scrollDepth: 95,
        isCompleted: true,
      });
    }
  }

  console.log("\n✅ Database seed completed successfully!");
  console.log("   - Demo accounts created with password 'demo12345':");
  console.log("     • Admin:  admin@thetathya.com");
  console.log("     • Editor: editor@thetathya.com");
  console.log("     • Reader: reader@thetathya.com");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
