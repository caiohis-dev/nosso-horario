import { createClient } from 'npm:@supabase/supabase-js'
import type { Database } from '../../../src/types/database.ts'

const supabaseAdmin = createClient<Database>(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

export { supabaseAdmin }
