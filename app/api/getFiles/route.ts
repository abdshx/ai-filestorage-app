"use server"

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const folderId = searchParams.get('folderId'); // Get folderId from query parameters

    if (!userId) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
    }

    // const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser()

    // if (userError || !user) {
    //   console.error('Authentication error:', userError);
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    // }
   // const user="9ac2446a-b790-4c67-b7e0-d8ad8ce60ce7";

    let query = supabaseAdmin
      .from('files')
      .select('*')
      .eq('user_id', userId);

    if (folderId === '00000000-0000-0000-0000-000000000000' || folderId === "null") {
      query = query.is('folder_id', null); // Fetch files not in any folder (root)
    } else if (folderId) {
      query = query.eq('folder_id', folderId); // Fetch files within a specific folder
    }

    const { data: files, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching files:', error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ files })
  } catch (err: any) {
    console.error('Server error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}