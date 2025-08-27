# Supabase Setup Guide for File Upload

This guide will help you set up Supabase to enable file upload functionality in your application.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A new or existing Supabase project

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "ai-filestorage-app")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the values with your actual Supabase project credentials.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Click "Run" to execute the SQL commands

This will create:
- A `files` table to store file metadata
- Row Level Security (RLS) policies
- Storage policies for the files bucket

## Step 5: Create Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Click "Create a new bucket"
3. Set the bucket name to `files`
4. Make it public (check the "Public bucket" option)
5. Click "Create bucket"

## Step 6: Install Dependencies

Run the following command to install the Supabase client:

```bash
pnpm install
```

## Step 7: Test the Upload Functionality

1. Start your development server:
   ```bash
   pnpm dev
   ```

2. Navigate to your application
3. Click the "Upload Files" button
4. Try uploading a file (image, video, document, etc.)
5. Check your Supabase dashboard > Storage > files to see the uploaded file

## File Structure

The uploaded files will be stored in the following structure:
```
files/
├── user-id-1/
│   ├── timestamp_filename1.jpg
│   └── timestamp_filename2.pdf
└── user-id-2/
    └── timestamp_filename3.zip
```

## Security Features

- **Row Level Security (RLS)**: Users can only access their own files
- **Storage Policies**: Users can only upload/access files in their own folder
- **Authentication Required**: All file operations require user authentication
- **Unique File Names**: Files are renamed with timestamps to prevent conflicts

## Troubleshooting

### Common Issues:

1. **"User not authenticated" error**
   - Make sure you have authentication set up in your app
   - Check that the user is logged in before uploading

2. **"Bucket not found" error**
   - Ensure you've created the `files` bucket in Supabase Storage
   - Check that the bucket name matches exactly

3. **"Permission denied" error**
   - Verify that the storage policies are correctly set up
   - Check that the user is authenticated

4. **Environment variables not working**
   - Make sure your `.env.local` file is in the project root
   - Restart your development server after adding environment variables

### Getting Help

- Check the Supabase documentation: https://supabase.com/docs
- Review the browser console for detailed error messages
- Check the Supabase dashboard logs for server-side errors

## Next Steps

After setting up file upload, you might want to:

1. Implement file sharing functionality
2. Add file preview capabilities
3. Implement file search and filtering
4. Add file organization features (folders, tags)
5. Implement file versioning
6. Add file access controls and permissions
