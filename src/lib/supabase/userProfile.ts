import { User, Profile } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

// 사용자 프로필 생성/업데이트 함수
export const createOrUpdateUserProfile = async (
  authUser: any, 
  provider: string, 
  supabaseClient: SupabaseClient
): Promise<{ user: User; profile: Profile }> => {
  if (!supabaseClient) {
    throw new Error('Supabase client is required')
  }
  
  try {
    // 1. users 테이블에서 사용자 찾기 또는 생성
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()

    let user: User
    if (userError && userError.code === 'PGRST116') {
      // 사용자가 없으면 생성
      const { data: newUser, error: createUserError } = await supabaseClient
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          email: authUser.email,
          is_active: true
        })
        .select()
        .single()

      if (createUserError) throw createUserError
      user = newUser
    } else if (userError) {
      throw userError
    } else {
      user = userData
    }

    // 2. profiles 테이블에서 프로필 찾기 또는 생성
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // 프로필이 없으면 생성
      const { data: newProfile, error: createProfileError } = await supabaseClient
        .from('profiles')
        .insert({
          user_id: user.id,
          display_name: authUser.user_metadata?.full_name || authUser.email,
          avatar_url: authUser.user_metadata?.avatar_url,
          provider: provider,
          provider_id: authUser.user_metadata?.provider_id || authUser.id
        })
        .select()
        .single()

      if (createProfileError) throw createProfileError
      return { user, profile: newProfile }
    } else if (profileError) {
      throw profileError
    } else {
      // 프로필이 있으면 업데이트
      const { data: updatedProfile, error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          display_name: authUser.user_metadata?.full_name || profileData.display_name,
          avatar_url: authUser.user_metadata?.avatar_url || profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id)
        .select()
        .single()

      if (updateError) throw updateError
      return { user, profile: updatedProfile }
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error)
    throw error
  }
} 