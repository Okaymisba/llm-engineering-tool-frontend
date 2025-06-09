
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

const supabaseUrl = "https://npzxrwegjfvpxvojinpm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wenhyd2VnamZ2cHh2b2ppbnBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMDU1NzIsImV4cCI6MjA2NDc4MTU3Mn0.DoEFurVmAP0_GSL8DAbvgiFF8lj469XkKIQLzlAnf8E"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
