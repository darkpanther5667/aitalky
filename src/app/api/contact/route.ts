import { NextResponse } from "next/server";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";
import { getDbPool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    // Try Supabase first
    try {
      const client = getSupabaseAdmin() || supabase;
      await client.from("contact_messages").insert({
        name: name.trim(),
        email: email.trim(),
        subject: subject || "General Inquiry",
        message: message.trim(),
        created_at: new Date().toISOString(),
      });
    } catch {}

    // Fallback to pg pool
    try {
      const p = getDbPool();
      await p.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT,
          message TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      await p.query(
        `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)`,
        [name.trim(), email.trim(), subject || "General Inquiry", message.trim()]
      );
    } catch (pgErr) {
      console.warn("PG contact insert fallback:", pgErr);
    }

    return NextResponse.json({ success: true, message: "Thank you for contacting aitalky. We will respond within 24 hours." });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to submit message." },
      { status: 500 }
    );
  }
}
