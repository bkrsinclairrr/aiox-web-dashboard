// Shared authentication system across all AIOX applications
// This package should be used by: MemberHub, AIOX Dashboard, AIOX Core

export { AuthProvider, useAuth } from '../context/AuthContext'
export { useSharedAuth } from '../hooks/useSharedAuth'

// Client setup
export { supabase } from '../lib/supabase'

