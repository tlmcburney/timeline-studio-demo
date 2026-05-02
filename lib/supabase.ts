import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Event } from "./types";

let client: SupabaseClient | null = null;

/**
 * Returns a Supabase client, or null if env vars are not configured.
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface SavedEvent {
  id: string;
  couple_name: string;
  event_date: string;
  venue: string;
  data: Event;
  created_at: string;
  updated_at: string;
}

/**
 * Save an event to Supabase. If id is provided, updates existing record.
 * Returns the saved event's id.
 */
export async function saveEvent(
  event: Event,
  existingId?: string
): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const payload = {
    couple_name: event.coupleName,
    event_date: event.date,
    venue: event.venue,
    data: event,
    updated_at: new Date().toISOString(),
  };

  if (existingId) {
    const { error } = await sb
      .from("events")
      .update(payload)
      .eq("id", existingId);

    if (error) {
      console.error("Supabase save error:", error);
      return null;
    }
    return existingId;
  } else {
    const { data, error } = await sb
      .from("events")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase save error:", error);
      return null;
    }
    return data?.id || null;
  }
}

/**
 * Load all saved events from Supabase, ordered by most recent first.
 */
export async function loadEvents(): Promise<SavedEvent[]> {
  const sb = getSupabase();
  if (!sb) return [];

  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Supabase load error:", error);
    return [];
  }

  return (data || []) as SavedEvent[];
}

/**
 * Delete a saved event from Supabase.
 */
export async function deleteEvent(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const { error } = await sb.from("events").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete error:", error);
    return false;
  }
  return true;
}
