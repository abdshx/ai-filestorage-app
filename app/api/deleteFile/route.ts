"use server"

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)


export async function DELETE(req: Request) {
 
 
    try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
    }

    const { fileId, filePath } = await req.json();

    if (!fileId || !filePath) {
      return NextResponse.json({ error: 'File ID and file path are required' }, { status: 400 });
    }

    const { error: storageError } = await supabaseAdmin.storage
    .from('files')
    .remove([filePath])

  if (storageError) {
    throw storageError
  }

  // Delete from database
  const { error: dbError } = await supabaseAdmin
    .from('files')
    .delete()
    .eq('id', fileId)
    .eq('user_id', userId)

     if (dbError) {
    throw dbError
     }
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  

   } 
  
 catch (err: any) {
    console.error('Delete file error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
