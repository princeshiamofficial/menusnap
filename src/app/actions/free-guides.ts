"use server";

import pool from "@/lib/mysql";
import { FreeGuide, GuideLead, GuideChapter } from "@/lib/menusnap-types";
import { z } from "zod";
import { revalidatePath } from "next/cache";

function parseChapters(raw: any): GuideChapter[] | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Ensures the free_guides and guide_leads tables exist with proper schema and indexes.
 */
export async function ensureFreeGuidesTables(): Promise<void> {
  try {
    // 1. Guides Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS free_guides (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        cover_image VARCHAR(500) NULL,
        file_url VARCHAR(500) NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Restaurant Growth',
        badge_text VARCHAR(100) NULL DEFAULT 'Free PDF',
        chapters LONGTEXT NULL,
        download_count INT NOT NULL DEFAULT 0,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active_sort (is_active, sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Ensure chapters column exists for existing tables
    try {
      await pool.execute("ALTER TABLE free_guides ADD COLUMN IF NOT EXISTS chapters LONGTEXT NULL AFTER badge_text;");
    } catch (e) {
      // Ignore if column already exists
    }

    // 2. Leads Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS guide_leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guide_id INT NULL,
        guide_name VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        restaurant_name VARCHAR(255) NOT NULL,
        event_id VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_guide_id (guide_id),
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Seed default guides if table is empty
    const [countRows]: any = await pool.execute("SELECT COUNT(*) AS total FROM free_guides");
    const total = countRows?.[0]?.total || 0;
    if (total === 0) {
      await pool.execute(`
        INSERT INTO free_guides (title, slug, description, cover_image, file_url, category, badge_text, chapters, download_count, is_active, sort_order)
        VALUES
        (
          'রেস্টুরেন্ট ডিজিটাল সাকসেস গাইড',
          'restaurant-digital-success-guide',
          'আপনার রেস্টুরেন্টকে ব্র্যান্ডে পরিণত করার সম্পূর্ণ রোডম্যাপ।',
          '/Ebook.png',
          '/Business Growth Guide By Color Hut.pdf',
          'বিজনেস গ্রোথ',
          'সম্পূর্ণ বিনামূল্যে',
          '[{"title":"ফুড ফটোগ্রাফি","description":"প্রাকৃতিক আলো, সঠিক অ্যাঙ্গেল এবং প্রপস ব্যবহার করে কাস্টমারের ক্ষুধা জাগিয়ে তোলার কৌশল।"},{"title":"সোশ্যাল মিডিয়া মার্কেটিং","description":"ফেসবুক ও ইনস্টাগ্রামে নিয়মিত পোস্ট, টার্গেটেড অ্যাড এবং ইউজার জেনারেটেড কন্টেন্টের সঠিক ব্যবহার।"},{"title":"ভিডিও কন্টেন্ট","description":"Behind-the-scene ক্লিপ, ফুড প্রিপারেশন Reels এবং কাস্টমার রিভিউ — যা বিক্রি বাড়ায়।"},{"title":"Local SEO ও Google Maps","description":"\\"Best Restaurant near me\\" সার্চে প্রথমে থাকতে Google Business Profile, রিভিউ ও লোকাল কীওয়ার্ড।"},{"title":"রেস্টুরেন্ট অটোমেশন","description":"Smart POS, অনলাইন অর্ডার সিস্টেম, KDS এবং কাস্টমার ডেটাবেজ দিয়ে কাজের চাপ কমান।"},{"title":"৭ সাকসেস ফর্মুলা","description":"ওয়েটার ট্রেনিং, আপ-সেলিং, বান্ডেল অফার, স্টুডেন্ট ডিল, কর্পোরেট গেস্ট — সব কৌশল একসাথে।"},{"title":"মেনু ইঞ্জিনিয়ারিং","description":"BCG Matrix দিয়ে Stars, Plowhorses, Puzzles, Low আইটেম চিহ্নিত করে মুনাফা বাড়ান।"},{"title":"কাস্টমার রিটেনশন","description":"লয়্যালটি প্রোগ্রাম, SMS মার্কেটিং এবং পার্সোনালাইজেশন দিয়ে পুরোনো কাস্টমার ধরে রাখুন।"}]',
          0,
          1,
          1
        ),
        (
          'রেস্টুরেন্ট মার্কেটিং ও সোশ্যাল মিডিয়া প্লেবুক',
          'restaurant-marketing-playbook',
          'সোশ্যাল মিডিয়া রিলস, ফুড ফটোগ্রাফি, লোকাল বিজ্ঞাপন এবং গুগল ম্যাপসে সেরা হওয়ার কার্যকরী কৌশল।',
          '/Ebook.png',
          '/Business Growth Guide By Color Hut.pdf',
          'মার্কেটিং ও গ্রোথ',
          'প্র্যাক্টিক্যাল গাইড',
          '[{"title":"ফুড ফটোগ্রাফি টেকনিক","description":"প্রাকৃতিক আলো ও সঠিক অ্যাঙ্গেল ব্যবহার করে খাবারের লোভনীয় ছবি তোলার সহজ কৌশল।"},{"title":"ভাইরাল রিলস তৈরি","description":"ফেসবুক ও ইনস্টাগ্রামের জন্য বিহাইন্ড-দ্য-সিন ও কিচেন প্রিপারেশন রিলস দিয়ে ফলোয়ার বৃদ্ধি।"},{"title":"ইনফ্লুয়েন্সার স্ট্র্যাটেজি","description":"সঠিক ফুড ব্লগার নির্বাচন এবং খাঁটি কাস্টমার রিভিউ দিয়ে ব্র্যান্ডের গ্রহণযোগ্যতা তৈরি।"},{"title":"Local SEO ও Google Maps","description":"\\"Best Restaurant Near Me\\" সার্চে সবার প্রথমে র‍্যাংক করার কমপ্লিট অপটিমাইজেশন।"},{"title":"লোকাল ফেসবুক অ্যাড","description":"কম বাজেটে রেস্টুরেন্টের আশেপাশের ভোজনরসিকদের টার্গেট করে অর্ডার ও ভিজিটর বাড়ানোর নিয়ম।"},{"title":"রিভিউ ও রেপুটেশন বৃদ্ধি","description":"গুগল ও সোশ্যাল মিডিয়ায় ৫-স্টার রিভিউ বাড়ানো এবং নেগেটিভ ফিডব্যাক সহজে হ্যান্ডল করা।"},{"title":"অফার ও উৎসব ক্যাম্পেইন","description":"রমজান, ঈদ এবং বিশেষ উৎসবে আকর্ষণীয় বান্ডেল অফার ডিজাইন করে বিক্রি দ্বিগুণ করা।"},{"title":"কাস্টমার রি-মার্কেটিং","description":"মেসেঞ্জার ও এসএমএস ব্যবহার করে পুরোনো কাস্টমারদের নিয়মিত নতুন অফার পাঠানো।"}]',
          0,
          1,
          2
        ),
        (
          'ফুড কস্টিং ও অপচয় কমানোর চেকলিস্ট',
          'food-costing-waste-reduction-checklist',
          'ফুড কস্ট ৩০% এর নিচে রাখা, কিচেন অপচয় দূর করা এবং দৈনিক অডিট করে মুনাফা বাড়ানোর সহজ গাইড।',
          '/Ebook.png',
          '/Business Growth Guide By Color Hut.pdf',
          'রেস্টুরেন্ট অপারেশনস',
          'চেকলিস্ট ও ফর্মুলা',
          '[{"title":"রেসিপি স্ট্যান্ডার্ডাইজেশন","description":"প্রতিটি খাবারের সুনির্দিষ্ট উপাদান ও পরিমাপ নির্ধারণ করে একই স্বাদ বজায় রাখা।"},{"title":"ফুড কস্ট ফর্মুলা","description":"আইডিয়াল ও বাস্তব খরচের তুলনা করে প্রতিটি খাবারের সঠিক বিক্রয়মূল্য নির্ধারণ।"},{"title":"কিচেন অপচয় রোধ","description":"রান্নাঘর ও স্টোরেজে নষ্ট হওয়া খাদ্যপণ্যের দৈনিক হিসাব রেখে অপচয় শূন্যে নামিয়ে আনা।"},{"title":"FIFO ইনভেন্টরি পদ্ধতি","description":"আগে আসা উপাদান আগে ব্যবহার করার নিয়ম মেনে মেয়াদোত্তীর্ণ পণ্যের ক্ষতি রোধ করা।"},{"title":"সাপ্লায়ার ও সোর্সিং","description":"সরাসরি পাইকারি মার্কেট ও নির্ভরযোগ্য ভেন্ডর থেকে সাশ্রয়ী মূল্যে কাঁচামাল কেনা।"},{"title":"হাই-প্রফিট মেনু ফোকাস","description":"বেশি লাভজনক খাবারগুলোকে মেনু কার্ডে প্রাধান্য দিয়ে বিক্রির গড় মুনাফা বৃদ্ধি করা।"},{"title":"দৈনিক ও সাপ্তাহিক অডিট","description":"স্টক ব্যালেন্স, ফ্রিজ টেম্পারেচার এবং কাটতি মিলিয়ে নেওয়ার প্রস্তুতকৃত চেকলিস্ট।"},{"title":"স্টাফ ট্রেনিং ও সচেতনতা","description":"শেফ ও সহকারী কর্মীদের কিচেন হাইজিন ও অপচয় রোধে সচেতন করার নির্দেশিকা।"}]',
          0,
          1,
          3
        )
      `);
    }
  } catch (err) {
    console.error("Database initialization error (free_guides):", err);
  }
}

/**
 * Public action: Fetches all active guides sorted for display on website.
 */
export async function getPublicFreeGuidesAction(): Promise<{
  success: boolean;
  data?: FreeGuide[];
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();
    const [rows]: any = await pool.execute(
      "SELECT * FROM free_guides WHERE is_active = 1 ORDER BY sort_order ASC, id DESC"
    );

    const guides: FreeGuide[] = (rows || []).map((r: any) => ({
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      description: r.description,
      cover_image: r.cover_image,
      file_url: r.file_url,
      category: r.category,
      badge_text: r.badge_text,
      chapters: parseChapters(r.chapters),
      download_count: Number(r.download_count) || 0,
      is_active: Boolean(r.is_active),
      sort_order: Number(r.sort_order) || 0,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    }));

    return { success: true, data: guides };
  } catch (error: any) {
    console.error("getPublicFreeGuidesAction error:", error);
    return { success: false, error: error.message || "Failed to load guides." };
  }
}

/**
 * Public action: Fetches a single free guide by slug.
 */
export async function getFreeGuideBySlugAction(slug: string): Promise<{
  success: boolean;
  data?: FreeGuide;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();
    const [rows]: any = await pool.execute(
      "SELECT * FROM free_guides WHERE slug = ? AND is_active = 1 LIMIT 1",
      [slug]
    );

    if (!rows || rows.length === 0) {
      return { success: false, error: "Guide not found." };
    }

    const r = rows[0];
    const guide: FreeGuide = {
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      description: r.description,
      cover_image: r.cover_image,
      file_url: r.file_url,
      category: r.category,
      badge_text: r.badge_text,
      chapters: parseChapters(r.chapters),
      download_count: Number(r.download_count) || 0,
      is_active: Boolean(r.is_active),
      sort_order: Number(r.sort_order) || 0,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    };

    return { success: true, data: guide };
  } catch (error: any) {
    console.error("getFreeGuideBySlugAction error:", error);
    return { success: false, error: error.message || "Failed to load guide." };
  }
}

const LeadSchema = z.object({
  guideId: z.number().int().positive().optional().nullable(),
  guideName: z.string().trim().min(1, "Guide name is required.").max(255),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  phone: z.string().trim().min(6, "Please enter a valid phone number.").max(50),
  restaurantName: z.string().trim().min(2, "Restaurant or business name is required.").max(255),
});

/**
 * Public action: Handles lead capture submission when user downloads a guide.
 * Saves lead, increments download count, and returns lead ID + event ID for dataLayer.
 */
export async function submitGuideLeadAction(data: {
  guideId?: number | null;
  guideName: string;
  fullName: string;
  email: string;
  phone: string;
  restaurantName: string;
}): Promise<{
  success: boolean;
  leadId?: number;
  eventId?: string;
  guideName?: string;
  fileUrl?: string | null;
  error?: string;
}> {
  try {
    const validated = LeadSchema.parse(data);
    await ensureFreeGuidesTables();

    // Unique event_id for GTM / Meta Pixel CAPI deduplication
    const eventId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 1. Insert lead into guide_leads table
    const [insertResult]: any = await pool.execute(
      `INSERT INTO guide_leads (guide_id, guide_name, full_name, email, phone, restaurant_name, event_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        validated.guideId || null,
        validated.guideName,
        validated.fullName,
        validated.email,
        validated.phone,
        validated.restaurantName,
        eventId,
      ]
    );

    const leadId = insertResult.insertId;

    // 2. Fetch guide file_url and increment download count
    let fileUrl: string | null = null;
    if (validated.guideId) {
      await pool.execute(
        "UPDATE free_guides SET download_count = download_count + 1 WHERE id = ?",
        [validated.guideId]
      );

      const [guideRows]: any = await pool.execute(
        "SELECT file_url FROM free_guides WHERE id = ? LIMIT 1",
        [validated.guideId]
      );
      if (guideRows && guideRows.length > 0) {
        fileUrl = guideRows[0].file_url || null;
      }
    }

    // Default download fallback if none specified in DB
    if (!fileUrl) {
      fileUrl = "https://erp.colorhutbd.xyz/file/uploads/restaurant-menu-pricing-guide.pdf";
    }

    return {
      success: true,
      leadId,
      eventId,
      guideName: validated.guideName,
      fileUrl,
    };
  } catch (error: any) {
    console.error("submitGuideLeadAction error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || "Validation failed." };
    }
    return { success: false, error: error.message || "Failed to submit lead." };
  }
}

/**
 * Admin action: Get all guides (active & inactive) with total leads count.
 */
export async function getAdminFreeGuidesAction(): Promise<{
  success: boolean;
  data?: (FreeGuide & { leads_count: number })[];
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();
    const [rows]: any = await pool.execute(`
      SELECT g.*, COUNT(l.id) AS leads_count
      FROM free_guides g
      LEFT JOIN guide_leads l ON g.id = l.guide_id
      GROUP BY g.id
      ORDER BY g.sort_order ASC, g.id DESC
    `);

    const guides = (rows || []).map((r: any) => ({
      id: Number(r.id),
      title: r.title,
      slug: r.slug,
      description: r.description,
      cover_image: r.cover_image,
      file_url: r.file_url,
      category: r.category,
      badge_text: r.badge_text,
      chapters: parseChapters(r.chapters),
      download_count: Number(r.download_count) || 0,
      is_active: Boolean(r.is_active),
      sort_order: Number(r.sort_order) || 0,
      leads_count: Number(r.leads_count) || 0,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    }));

    return { success: true, data: guides };
  } catch (error: any) {
    console.error("getAdminFreeGuidesAction error:", error);
    return { success: false, error: error.message || "Failed to load guides." };
  }
}

/**
 * Admin action: Create a new free guide.
 */
export async function createFreeGuideAction(payload: {
  title: string;
  slug?: string;
  description?: string;
  cover_image?: string;
  file_url?: string;
  category?: string;
  badge_text?: string;
  chapters?: GuideChapter[] | string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<{
  success: boolean;
  data?: FreeGuide;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();

    const cleanTitle = (payload.title || "").trim();
    if (!cleanTitle) {
      return { success: false, error: "Guide title is required." };
    }

    const cleanSlug = (
      payload.slug?.trim() ||
      cleanTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    ) || `guide-${Date.now()}`;

    const [existing]: any = await pool.execute(
      "SELECT id FROM free_guides WHERE slug = ? LIMIT 1",
      [cleanSlug]
    );
    if (existing && existing.length > 0) {
      return { success: false, error: "A guide with this slug/URL already exists. Choose a different title or slug." };
    }

    const chaptersJson = payload.chapters
      ? typeof payload.chapters === "string"
        ? payload.chapters
        : JSON.stringify(payload.chapters)
      : null;

    const [result]: any = await pool.execute(
      `INSERT INTO free_guides (
        title, slug, description, cover_image, file_url, category, badge_text, chapters, sort_order, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanTitle,
        cleanSlug,
        payload.description?.trim() || "",
        payload.cover_image?.trim() || "/Ebook.png",
        payload.file_url?.trim() || "/Business Growth Guide By Color Hut.pdf",
        payload.category?.trim() || "Restaurant Growth",
        payload.badge_text?.trim() || "Free PDF",
        chaptersJson,
        Number(payload.sort_order) || 0,
        payload.is_active !== false ? 1 : 0,
      ]
    );

    const insertedId = result.insertId;
    const [newRows]: any = await pool.execute(
      "SELECT * FROM free_guides WHERE id = ? LIMIT 1",
      [insertedId]
    );

    revalidatePath("/free-guide");
    revalidatePath("/m-admin/free-guides");

    const r = newRows[0];
    return {
      success: true,
      data: {
        ...r,
        chapters: parseChapters(r.chapters),
      },
    };
  } catch (error: any) {
    console.error("createFreeGuideAction error:", error);
    return { success: false, error: error.message || "Failed to create guide." };
  }
}

/**
 * Admin action: Update an existing guide.
 */
export async function updateFreeGuideAction(
  id: number,
  payload: {
    title?: string;
    slug?: string;
    description?: string;
    cover_image?: string;
    file_url?: string;
    category?: string;
    badge_text?: string;
    chapters?: GuideChapter[] | string | null;
    sort_order?: number;
    is_active?: boolean;
  }
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();

    const [existingRows]: any = await pool.execute(
      "SELECT * FROM free_guides WHERE id = ? LIMIT 1",
      [id]
    );
    if (!existingRows || existingRows.length === 0) {
      return { success: false, error: "Guide not found." };
    }
    const current = existingRows[0];

    const cleanTitle = payload.title !== undefined ? payload.title.trim() : current.title;
    let cleanSlug = payload.slug !== undefined ? payload.slug.trim() : current.slug;
    if (!cleanSlug) {
      cleanSlug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    // Check slug collision with other records
    const [slugRows]: any = await pool.execute(
      "SELECT id FROM free_guides WHERE slug = ? AND id != ? LIMIT 1",
      [cleanSlug, id]
    );
    if (slugRows && slugRows.length > 0) {
      return { success: false, error: "Another guide already uses this slug." };
    }

    const chaptersJson =
      payload.chapters !== undefined
        ? payload.chapters
          ? typeof payload.chapters === "string"
            ? payload.chapters
            : JSON.stringify(payload.chapters)
          : null
        : current.chapters;

    await pool.execute(
      `UPDATE free_guides SET
        title = ?,
        slug = ?,
        description = ?,
        cover_image = ?,
        file_url = ?,
        category = ?,
        badge_text = ?,
        chapters = ?,
        sort_order = ?,
        is_active = ?
      WHERE id = ?`,
      [
        cleanTitle,
        cleanSlug,
        payload.description !== undefined ? payload.description.trim() : current.description,
        payload.cover_image !== undefined ? payload.cover_image.trim() : current.cover_image,
        payload.file_url !== undefined ? payload.file_url.trim() : current.file_url,
        payload.category !== undefined ? payload.category.trim() : current.category,
        payload.badge_text !== undefined ? payload.badge_text.trim() : current.badge_text,
        chaptersJson,
        payload.sort_order !== undefined ? Number(payload.sort_order) : current.sort_order,
        payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : current.is_active,
        id,
      ]
    );

    revalidatePath("/free-guide");
    revalidatePath("/m-admin/free-guides");

    return { success: true };
  } catch (error: any) {
    console.error("updateFreeGuideAction error:", error);
    return { success: false, error: error.message || "Failed to update guide." };
  }
}

/**
 * Admin action: Delete a guide by ID.
 */
export async function deleteFreeGuideAction(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();
    await pool.execute("DELETE FROM free_guides WHERE id = ?", [id]);

    revalidatePath("/free-guide");
    revalidatePath("/m-admin/free-guides");

    return { success: true };
  } catch (error: any) {
    console.error("deleteFreeGuideAction error:", error);
    return { success: false, error: error.message || "Failed to delete guide." };
  }
}

/**
 * Admin action: Get leads list with optional guide filter and search.
 */
export async function getAdminGuideLeadsAction(params?: {
  guideId?: number;
  search?: string;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: GuideLead[];
  total?: number;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();

    let query = "SELECT * FROM guide_leads WHERE 1=1";
    const queryParams: any[] = [];

    if (params?.guideId) {
      query += " AND guide_id = ?";
      queryParams.push(params.guideId);
    }

    if (params?.search && params.search.trim()) {
      const term = `%${params.search.trim()}%`;
      query += " AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR restaurant_name LIKE ? OR guide_name LIKE ?)";
      queryParams.push(term, term, term, term, term);
    }

    query += " ORDER BY id DESC";

    const limit = Math.min(params?.limit || 200, 500);
    query += ` LIMIT ${limit}`;

    const [rows]: any = await pool.execute(query, queryParams);

    const leads: GuideLead[] = (rows || []).map((r: any) => ({
      id: Number(r.id),
      guide_id: r.guide_id ? Number(r.guide_id) : null,
      guide_name: r.guide_name,
      full_name: r.full_name,
      email: r.email,
      phone: r.phone,
      restaurant_name: r.restaurant_name,
      event_id: r.event_id,
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return { success: true, data: leads, total: leads.length };
  } catch (error: any) {
    console.error("getAdminGuideLeadsAction error:", error);
    return { success: false, error: error.message || "Failed to load leads." };
  }
}

/**
 * Admin action: Delete a captured guide lead by ID.
 */
export async function deleteGuideLeadAction(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await ensureFreeGuidesTables();
    await pool.execute("DELETE FROM guide_leads WHERE id = ?", [id]);
    return { success: true };
  } catch (error: any) {
    console.error("deleteGuideLeadAction error:", error);
    return { success: false, error: error.message || "Failed to delete lead." };
  }
}

