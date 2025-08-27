"use server"

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

//export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
   

    const { fileId, filePath,userId ,expiresInSeconds = 3600 } = await req.json(); // Default to 1 hour

    if (!fileId || !filePath) {
      return NextResponse.json({ error: 'File ID and file path are required' }, { status: 400 });
    }

    // Verify file ownership (important security step)
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .select('user_id')
      .eq('id', fileId)
      .single();

    if (dbError || !fileRecord || fileRecord.user_id !== userId) {
      console.error('Ownership verification failed:', dbError);
      return NextResponse.json({ error: 'Unauthorized to share this file' }, { status: 403 });
    }

    // Generate signed URL
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('files')
      .createSignedUrl(filePath, expiresInSeconds);

    if (signedUrlError) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, shareableLink: signedUrlData.signedUrl });
  } 
  
  catch (err: any) {
    console.error('Share file error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
