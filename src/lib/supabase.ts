import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sdkrbzzdnbljkhzaqqxy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ENcWfC085BNG1qnCH0IZuQ_-_c5_7HJ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
