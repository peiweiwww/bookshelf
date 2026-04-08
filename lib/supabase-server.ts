import { createClient } from '@supabase/supabase-js'
import { auth } from '@clerk/nextjs/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

/**
 * For use in Server Components, Server Actions, and Route Handlers.
 * Attaches the current Clerk session token so Supabase RLS policies
 * can reference `auth.uid()` / `requesting_user_id()`.
 *
 * @example
 * const supabase = await createServerSupabaseClient()
 * const { data } = await supabase.from('books').select()
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth()
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: () => getToken(),
  })
}
