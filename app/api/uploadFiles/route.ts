"use server"

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiProcessQueue } from '@/lib/queue';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

// Handle POST /api/upload
export async function POST(req: Request) {
  try {
    // Parse FormData (because file uploads come as multipart/form-data)
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bucketName = (formData.get('bucketName') as string) || 'files'
    const userId = formData.get('userId') as string;
    const folderId = formData.get('folderId') as string | null; // Get folderId from formData

    if (!userId) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
    }

    // Create a unique file path with user ID and timestamp
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${timestamp}_${file.name}`
    const filePath = `${userId}/${folderId || 'root'}/${fileName}`;
    


    console.log(userId, "userId", filePath, "filePath", bucketName, "bucketName")
    // Upload file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath)
       

    
    // Save file metadata to DB
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        user_id: userId,
        folder_id: folderId === '00000000-0000-0000-0000-000000000000' ? null : folderId, // Set to null if it's the root placeholder
        name: file.name,
        file_path: filePath,
        public_url: publicUrl,
        file_type: fileExtension,
        file_size: file.size,
        mime_type: file.type,
        is_shared: false
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving file metadata:', dbError)
      // Don’t fail upload just because metadata failed
    }

    // Dispatch AI processing job only if it's not an image
    if (fileRecord && !file.type.startsWith('image/')) {
      await aiProcessQueue.add('process-file', {
        fileId: fileRecord.id,
        filePath: filePath,
        fileType: fileExtension,
      });
      console.log(`Dispatched AI processing job for file ${fileRecord.id}`);
    } else if (fileRecord && file.type.startsWith('image/')) {
      console.log(`Skipping AI processing for image file ${fileRecord.id}`);
      // Optionally, update the status to 'ready' immediately for images if no other AI processing is intended
      await supabaseAdmin
        .from('files')
        .update({ status: 'ready', processed_at: new Date().toISOString() })
        .eq('id', fileRecord.id);
    }

    return NextResponse.json({
      success: true,
      data,
      publicUrl,
      filePath,
      fileRecord
    })
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
