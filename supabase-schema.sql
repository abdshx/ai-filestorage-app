-- Create a table to store file metadata
CREATE TABLE IF NOT EXISTS files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  mime_type TEXT,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with TEXT[], -- Array of user IDs or emails
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
-- Users can only see their own files
CREATE POLICY "Users can view own files" ON files
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert own files" ON files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own files
CREATE POLICY "Users can update own files" ON files
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete own files" ON files
  FOR DELETE USING (auth.uid() = user_id);

-- Optional: Policy to allow anonymous users to view shared files
CREATE POLICY "Allow anonymous access to shared files." ON files
  FOR SELECT USING (is_shared = TRUE);

-- Add new columns for AI analysis results and processing status
ALTER TABLE files
ADD COLUMN status TEXT DEFAULT 'uploaded',
ADD COLUMN tags TEXT[],
ADD COLUMN summary TEXT,
ADD COLUMN keywords TEXT[],
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_files_updated_at 
  BEFORE UPDATE ON files 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create a storage bucket for files
-- Note: This needs to be run in the Supabase dashboard or via the Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', true);

-- Create storage policies for the files bucket
-- Users can upload files to their own folder
CREATE POLICY "Users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view files in their own folder
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update files in their own folder
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete files in their own folder
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'files' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
