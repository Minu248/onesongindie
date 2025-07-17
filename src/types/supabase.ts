// Supabase 관련 타입 정의
export interface User {
  id: string
  auth_user_id: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  username?: string
  display_name?: string
  avatar_url?: string
  bio?: string
  provider: string
  provider_id: string
  created_at: string
  updated_at: string
} 