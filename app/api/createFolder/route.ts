"use server"

import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)



export async function POST(req: Request) {
  try {
   

    const { name, parentId, userId } = await req.json();

    if (!name || !userId) {
      return NextResponse.json({ error: 'Folder name and user ID are required' }, { status: 400 });
    }

    // Ensure the userId from the request matches the authenticated user
    // if (user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized to create folder for this user' }, { status: 403 });
    // }

    const { data: folder, error: dbError } = await supabaseAdmin
      .from('folders')
      .insert({
        name,
        user_id: userId,
        parent_id: parentId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating folder:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, folder });
  } catch (err: any) {
    console.error('Create folder error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
