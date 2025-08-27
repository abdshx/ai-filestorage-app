"use server"

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(req: Request) {
  try {
   

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    const userId = searchParams.get('userId');

    if (!folderId || !userId) {
      return NextResponse.json({ error: 'Folder ID and User ID are required' }, { status: 400 });
    }

    // if (user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized to view this folder' }, { status: 403 });
    // }

    const { data: folder, error: dbError } = await supabaseAdmin
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single();

    if (dbError || !folder) {
      console.error('Error fetching folder details:', dbError);
      return NextResponse.json({ error: dbError?.message || 'Folder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, folder });
  } catch (err: any) {
    console.error('Fetch folder details error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
