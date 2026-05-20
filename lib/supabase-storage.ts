import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Ma'lumotlarni o'qish
export async function getDataFromSupabase(key: string): Promise<any> {
  const { data, error } = await supabase
    .from("rnp_storage")
    .select("value")
    .eq("key", key)
    .maybeSingle()

  if (error) {
    console.error("Supabase get error:", error)
    return null
  }

  return data?.value || null
}

// Ma'lumotlarni saqlash
export async function setDataToSupabase(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from("rnp_storage")
    .upsert(
      {
        key,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    )

  if (error) {
    console.error("Supabase set error:", error)
  }
}

// Real-time subscription
export function subscribeToChanges(callback: (key: string, value: any) => void) {
  const channel = supabase
    .channel("rnp_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "rnp_storage",
      },
      (payload) => {
        const newData = payload.new as { key: string; value: any }
        if (newData?.key) {
          callback(newData.key, newData.value)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Barcha kalitlarni olish (prefix bo'yicha)
export async function getAllByPrefix(prefix: string): Promise<Map<string, any>> {
  const { data, error } = await supabase
    .from("rnp_storage")
    .select("key, value")
    .like("key", `${prefix}%`)

  const result = new Map<string, any>()

  if (error) {
    console.error("Supabase getAll error:", error)
    return result
  }

  data?.forEach((row) => {
    result.set(row.key, row.value)
  })

  return result
}
