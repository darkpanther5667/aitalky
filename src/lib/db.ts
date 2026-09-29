import { Pool } from "pg";
import { Article, Category } from "@/types/news";

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
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function initDb() {
  const p = getDbPool();
  const query = `
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL,
      source_url TEXT,
      url TEXT NOT NULL,
      published_at TIMESTAMPTZ NOT NULL,
      category TEXT NOT NULL,
      reading_time_minutes INT DEFAULT 3,
      author TEXT,
      author_role TEXT,
      image_url TEXT,
      tags TEXT[] DEFAULT '{}',
      key_points TEXT[] DEFAULT '{}',
      views INT DEFAULT 0,
      likes INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

    CREATE TABLE IF NOT EXISTS subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS article_reactions (
      id SERIAL PRIMARY KEY,
      article_slug TEXT NOT NULL,
      reaction_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id SERIAL PRIMARY KEY,
      user_id UUID NOT NULL,
      article_slug TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, article_slug)
    );
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
  `;

  await p.query(query);
}

export async function upsertArticle(article: Article): Promise<void> {
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
    article.content,
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
}

export async function upsertArticles(articles: Article[]): Promise<void> {
  for (const article of articles) {
    try {
      await upsertArticle(article);
    } catch (err) {
      console.error(`Failed to upsert article ${article.slug}:`, err);
    }
  }
}

export async function getDbArticles(category?: Category, limit: number = 30): Promise<Article[]> {
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
    query += ` WHERE category = $1`;
    params.push(category);
    query += ` ORDER BY published_at DESC LIMIT $2`;
    params.push(limit);
  } else {
    query += ` ORDER BY published_at DESC LIMIT $1`;
    params.push(limit);
  }

  const res = await p.query(query, params);
  return res.rows.map((row) => ({
    ...row,
    publishedAt: new Date(row.publishedAt).toISOString(),
  }));
}

export async function getDbArticleBySlug(slug: string): Promise<Article | null> {
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
  const row = res.rows[0];
  return {
    ...row,
    publishedAt: new Date(row.publishedAt).toISOString(),
  };
}

export async function incrementArticleViews(slug: string): Promise<void> {
  try {
    const p = getDbPool();
    await p.query(`UPDATE articles SET views = views + 1 WHERE slug = $1`, [slug]);
  } catch {
    // Ignore view increment errors
  }
}

export async function incrementArticleLikes(slug: string): Promise<number> {
  const p = getDbPool();
  const res = await p.query(
    `UPDATE articles SET likes = likes + 1 WHERE slug = $1 RETURNING likes`,
    [slug]
  );
  return res.rows[0]?.likes || 0;
}

export async function addSubscriber(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const p = getDbPool();
    await p.query(
      `INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING`,
      [email.toLowerCase().trim()]
    );
    return { success: true, message: "Subscribed to Morning AI Wire successfully." };
  } catch (err: any) {
    return { success: false, message: err.message || "Failed to subscribe" };
  }
}

export async function searchArticlesDb(query: string, limit: number = 20): Promise<Article[]> {
  const p = getDbPool();
  const sanitized = query.trim();
  if (!sanitized) return [];

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

  return res.rows.map((row) => ({
    ...row,
    publishedAt: new Date(row.publishedAt).toISOString(),
  }));
}

export async function getUserBookmarks(userId: string): Promise<string[]> {
  const p = getDbPool();
  const res = await p.query(
    `SELECT article_slug FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return res.rows.map((r) => r.article_slug);
}

export async function toggleUserBookmark(userId: string, slug: string): Promise<{ bookmarked: boolean }> {
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
}

