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
    const parentId = searchParams.get('parentId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID are required' }, { status: 400 });
    }

    // if (user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized to view these folders' }, { status: 403 });
    // }

    let query = supabaseAdmin
      .from('folders')
      .select('*')
      .eq('user_id', userId);

    if (parentId === "null") {
      query = query.is('parent_id', null); // Top-level folders
    } else if (parentId) {
      query = query.eq('parent_id', parentId); // Subfolders
    }

    const { data: folders, error: dbError } = await query.order('created_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching folders:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, folders });
  } catch (err: any) {
    console.error('Fetch folders error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
