import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

/**
 * For use in Client Components.
 * Pass `() => session?.getToken()` from Clerk's `useSession()` hook.
 *
 * @example
 * const { session } = useSession()
 * const supabase = createClerkSupabaseClient(() => session?.getToken() ?? null)
 */
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
) {
  return createClient(supabaseUrl, supabaseKey, {
    accessToken: getToken,
  })
}
