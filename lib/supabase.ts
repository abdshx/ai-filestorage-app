import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey) // For server-side with elevated privileges

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error getting user:', error)
    return null
  }
  return user
}



// Helper function to fetch user files from the database


// Helper function to delete a file
export const deleteFile = async (fileId: string, filePath: string) => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('files')
    .remove([filePath])

  if (storageError) {
    throw storageError
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', user.id)

  if (dbError) {
    throw dbError
  }

  return { success: true }
}
