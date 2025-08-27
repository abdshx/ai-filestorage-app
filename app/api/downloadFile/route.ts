// app/api/downloadFile/route.ts
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return NextResponse.json({ error: "File ID is required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

  // Fetch the file path from your database based on fileId
  // Assuming your 'files' table has a 'path' column and 'id' column
  const { data: fileData, error: dbError } = await supabase
    .from("files")
    .select("file_path, name")
    .eq("id", fileId)
    .single();

  if (dbError || !fileData) {
    console.error("Error fetching file data:", dbError);
    return NextResponse.json(
      { error: "File not found or database error" },
      { status: 404 }
    );
  }

  const { data, error: storageError } = await supabase.storage
    .from("files") // Your storage bucket name
    .download(fileData.file_path);

  if (storageError) {
    console.error("Error downloading file from storage:", storageError);
    return NextResponse.json(
      { error: "Error downloading file" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "File not found in storage" }, { status: 404 });
  }

  // Set headers for file download
  const headers = new Headers();
  headers.set("Content-Type", data.type);
  headers.set("Content-Disposition", `attachment; filename="${fileData.name}"`);

  return new NextResponse(data, { headers });
}
