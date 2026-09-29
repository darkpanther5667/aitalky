import { Pool } from "pg";
import { Article, Category } from "@/types/news";
import { supabase, getSupabaseAdmin } from "@/lib/supabase";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      "postgresql://postgres:DSfN535pj3V%267nz@db.dzuneeilrzvrxjrarxkj.supabase.co:5432/postgres";

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 3000,
    });
  }
  return pool;
}

function mapRowToArticle(data: any): Article {
  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary,
    content: data.content,
    source: data.source,
    sourceUrl: data.source_url || data.sourceUrl || "",
    url: data.url,
    publishedAt: new Date(data.published_at || data.publishedAt).toISOString(),
    category: data.category as Category,
    readingTimeMinutes: data.reading_time_minutes || data.readingTimeMinutes || 3,
    author: data.author,
    authorRole: data.author_role || data.authorRole,
    imageUrl: data.image_url || data.imageUrl,
    tags: Array.isArray(data.tags) ? data.tags : [],
    keyPoints: Array.isArray(data.key_points || data.keyPoints)
      ? data.key_points || data.keyPoints
      : [],
    views: data.views || 0,
    likes: data.likes || 0,
  };
}

export async function getDbArticleBySlug(slug: string): Promise<Article | null> {
  // 1. Try Supabase REST API first (fast, HTTPS port 443, reliable on Vercel)
  try {
    const client = getSupabaseAdmin() || supabase;
    const { data, error } = await client
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (data && !error) {
      return mapRowToArticle(data);
    }
  } catch (err) {
    console.error("Supabase REST getDbArticleBySlug error:", err);
  }

  // 2. Fallback to direct pg pool
  try {
    const p = getDbPool();
    const res = await p.query(
      `SELECT
        id, slug, title, summary, content, source,
        source_url as "sourceUrl", url, published_at as "publishedAt",
        category, reading_time_minutes as "readingTimeMinutes",
        author, author_role as "authorRole", image_url as "imageUrl",
        tags, key_points as "keyPoints", views, likes
      FROM articles
      WHERE slug = $1 LIMIT 1`,
      [slug]
    );

    if (res.rows.length === 0) return null;
    return mapRowToArticle(res.rows[0]);
  } catch (pgErr) {
    console.error("PG fallback getDbArticleBySlug error:", pgErr);
    return null;
  }
}

export async function getDbArticles(category?: Category, limit: number = 30): Promise<Article[]> {
  // 1. Try Supabase REST API first
  try {
    const client = getSupabaseAdmin() || supabase;
    let query = client
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false })
      .limit(limit);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (data && !error && data.length > 0) {
      return data.map(mapRowToArticle);
    }
  } catch (err) {
    console.error("Supabase REST getDbArticles error:", err);
  }

  // 2. Fallback to direct pg pool
  try {
    const p = getDbPool();
    let query = `
      SELECT
        id, slug, title, summary, content, source,
        source_url as "sourceUrl", url, published_at as "publishedAt",
        category, reading_time_minutes as "readingTimeMinutes",
        author, author_role as "authorRole", image_url as "imageUrl",
        tags, key_points as "keyPoints", views, likes
      FROM articles
    `;
    const params: any[] = [];

    if (category && category !== "all") {
      query += ` WHERE category = $1 ORDER BY published_at DESC LIMIT $2`;
      params.push(category, limit);
    } else {
      query += ` ORDER BY published_at DESC LIMIT $1`;
      params.push(limit);
    }

    const res = await p.query(query, params);
    return res.rows.map(mapRowToArticle);
  } catch (pgErr) {
    console.error("PG fallback getDbArticles error:", pgErr);
    return [];
  }
}

export async function upsertArticle(article: Article): Promise<void> {
  // 1. Try Supabase REST API first
  try {
    const client = getSupabaseAdmin() || supabase;
    const payload = {
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content || article.summary,
      source: article.source,
      source_url: article.sourceUrl || null,
      url: article.url,
      published_at: article.publishedAt,
      category: article.category,
      reading_time_minutes: article.readingTimeMinutes || 3,
      author: article.author,
      author_role: article.authorRole,
      image_url: article.imageUrl,
      tags: article.tags || [],
      key_points: article.keyPoints || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await client
      .from("articles")
      .upsert(payload, { onConflict: "slug" });

    if (!error) return;
  } catch (err) {
    console.error("Supabase REST upsert error:", err);
  }

  // 2. Fallback to direct pg pool
  try {
    const p = getDbPool();
    const query = `
      INSERT INTO articles (
        id, slug, title, summary, content, source, source_url, url,
        published_at, category, reading_time_minutes, author, author_role,
        image_url, tags, key_points, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW()
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = CASE WHEN length(EXCLUDED.content) > length(articles.content) THEN EXCLUDED.content ELSE articles.content END,
        source = EXCLUDED.source,
        source_url = EXCLUDED.source_url,
        image_url = COALESCE(EXCLUDED.image_url, articles.image_url),
        key_points = CASE WHEN cardinality(EXCLUDED.key_points) > 0 THEN EXCLUDED.key_points ELSE articles.key_points END,
        updated_at = NOW();
    `;

    await p.query(query, [
      article.id,
      article.slug,
      article.title,
      article.summary,
      article.content || article.summary,
      article.source,
      article.sourceUrl || null,
      article.url,
      article.publishedAt,
      article.category,
      article.readingTimeMinutes || 3,
      article.author,
      article.authorRole,
      article.imageUrl,
      article.tags || [],
      article.keyPoints || [],
    ]);
  } catch (pgErr) {
    console.error(`PG upsert error for ${article.slug}:`, pgErr);
  }
}

export async function upsertArticles(articles: Article[]): Promise<void> {
  if (!articles || articles.length === 0) return;

  // 1. Fast batch upsert with Supabase REST API
  try {
    const client = getSupabaseAdmin() || supabase;
    const payloads = articles.map((article) => ({
      id: article.id,
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content || article.summary,
      source: article.source,
      source_url: article.sourceUrl || null,
      url: article.url,
      published_at: article.publishedAt,
      category: article.category,
      reading_time_minutes: article.readingTimeMinutes || 3,
      author: article.author,
      author_role: article.authorRole,
      image_url: article.imageUrl,
      tags: article.tags || [],
      key_points: article.keyPoints || [],
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from("articles")
      .upsert(payloads, { onConflict: "slug" });

    if (!error) return;
  } catch (err) {
    console.error("Batch upsert error, falling back to sequential:", err);
  }

  // 2. Fallback to sequential upsert
  for (const article of articles) {
    try {
      await upsertArticle(article);
    } catch {
      // Ignore individual failures
    }
  }
}

export async function incrementArticleViews(slug: string): Promise<void> {
  try {
    const client = getSupabaseAdmin() || supabase;
    const { data } = await client
      .from("articles")
      .select("views")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      await client
        .from("articles")
        .update({ views: (data.views || 0) + 1 })
        .eq("slug", slug);
      return;
    }
  } catch {}

  try {
    const p = getDbPool();
    await p.query(`UPDATE articles SET views = views + 1 WHERE slug = $1`, [slug]);
  } catch {}
}

export async function incrementArticleLikes(slug: string): Promise<number> {
  try {
    const client = getSupabaseAdmin() || supabase;
    const { data } = await client
      .from("articles")
      .select("likes")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      const nextLikes = (data.likes || 0) + 1;
      await client.from("articles").update({ likes: nextLikes }).eq("slug", slug);
      return nextLikes;
    }
  } catch {}

  try {
    const p = getDbPool();
    const res = await p.query(
      `UPDATE articles SET likes = likes + 1 WHERE slug = $1 RETURNING likes`,
      [slug]
    );
    return res.rows[0]?.likes || 0;
  } catch {
    return 0;
  }
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const client = getSupabaseAdmin() || supabase;
    const { error } = await client
      .from("subscribers")
      .upsert({ email: cleanEmail }, { onConflict: "email" });

    if (!error) {
      return { success: true, message: "Subscribed to Morning AI Wire successfully." };
    }
  } catch {}

  try {
    const p = getDbPool();
    await p.query(
      `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [cleanEmail]
    );
    return { success: true, message: "Subscribed to Morning AI Wire successfully." };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to subscribe" };
  }
}

export async function searchArticlesDb(query: string, limit: number = 20): Promise<Article[]> {
  const sanitized = query.trim();
  if (!sanitized) return [];

  try {
    const client = getSupabaseAdmin() || supabase;
    const { data, error } = await client
      .from("articles")
      .select("*")
      .or(`title.ilike.%${sanitized}%,summary.ilike.%${sanitized}%`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (data && !error && data.length > 0) {
      return data.map(mapRowToArticle);
    }
  } catch {}

  try {
    const p = getDbPool();
    const res = await p.query(
      `SELECT
        id, slug, title, summary, content, source,
        source_url as "sourceUrl", url, published_at as "publishedAt",
        category, reading_time_minutes as "readingTimeMinutes",
        author, author_role as "authorRole", image_url as "imageUrl",
        tags, key_points as "keyPoints", views, likes
      FROM articles
      WHERE title ILIKE $1 OR summary ILIKE $1 OR content ILIKE $1
      ORDER BY published_at DESC
      LIMIT $2`,
      [`%${sanitized}%`, limit]
    );

    return res.rows.map(mapRowToArticle);
  } catch {
    return [];
  }
}

export async function getUserBookmarks(userId: string): Promise<string[]> {
  try {
    const client = getSupabaseAdmin() || supabase;
    const { data, error } = await client
      .from("bookmarks")
      .select("article_slug")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data && !error) {
      return data.map((r: any) => r.article_slug);
    }
  } catch {}

  try {
    const p = getDbPool();
    const res = await p.query(
      `SELECT article_slug FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows.map((r) => r.article_slug);
  } catch {
    return [];
  }
}

export async function toggleUserBookmark(userId: string, slug: string): Promise<{ bookmarked: boolean }> {
  try {
    const client = getSupabaseAdmin() || supabase;
    const { data } = await client
      .from("bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("article_slug", slug)
      .maybeSingle();

    if (data) {
      await client.from("bookmarks").delete().eq("id", data.id);
      return { bookmarked: false };
    } else {
      await client.from("bookmarks").insert({ user_id: userId, article_slug: slug });
      return { bookmarked: true };
    }
  } catch {}

  try {
    const p = getDbPool();
    const check = await p.query(
      `SELECT id FROM bookmarks WHERE user_id = $1 AND article_slug = $2`,
      [userId, slug]
    );

    if (check.rows.length > 0) {
      await p.query(`DELETE FROM bookmarks WHERE user_id = $1 AND article_slug = $2`, [userId, slug]);
      return { bookmarked: false };
    } else {
      await p.query(
        `INSERT INTO bookmarks (user_id, article_slug) VALUES ($1, $2) ON CONFLICT (user_id, article_slug) DO NOTHING`,
        [userId, slug]
      );
      return { bookmarked: true };
    }
  } catch {
    return { bookmarked: false };
  }
}
