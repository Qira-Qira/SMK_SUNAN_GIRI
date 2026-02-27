# 📁 FILE UPLOAD MIGRATION GUIDE
## From Ephemeral Storage to Persistent Cloud Storage

**Critical Issue**: Current implementation saves files to `/public/uploads`, which will be deleted on every Vercel deployment.

---

## 🎯 SOLUTION: Migrate to Supabase Storage

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Create Storage Client

Create new file: `src/lib/storage/supabase-storage.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface UploadedFile {
  url: string;
  path: string;
  size: number;
  type: string;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToSupabase(
  file: File,
  bucket: string,
  folder: string,
  fileName?: string
): Promise<UploadedFile> {
  try {
    // Create unique filename with timestamp
    const timestamp = Date.now();
    const filenameSafe = fileName || `${timestamp}-${(file.name || 'upload')
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .toLowerCase()}`;
    
    const filePath = `${folder}/${filenameSafe}`;
    
    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);
    
    return {
      url: publicUrlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromSupabase(
  bucket: string,
  filePath: string
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
}

/**
 * List files in bucket folder
 */
export async function listFilesFromSupabase(
  bucket: string,
  folder: string
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('List files error:', error);
    throw error;
  }
}
```

### Step 3: Setup Supabase Environment Variables

Add to `.env.local` and Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
```

**How to get these:**
1. Go to [supabase.com](https://supabase.com)
2. Open your project
3. Settings → API
4. Copy `Project URL` → NEXT_PUBLIC_SUPABASE_URL
5. Copy `Service Role Secret` → SUPABASE_SERVICE_KEY

### Step 4: Create Storage Buckets in Supabase

Run in Supabase SQL editor:

```sql
-- Create buckets for uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ppdb-documents', 'ppdb-documents', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('job-applications', 'job-applications', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true);

-- Set bucket policies (allow authenticated users)
CREATE POLICY "authenticated-upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ppdb-documents');

CREATE POLICY "authenticated-read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ppdb-documents');
```

---

## 📝 UPDATE API ENDPOINTS

### A. Update PPDB Upload Endpoint

File: `src/app/api/ppdb/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/session';
import { uploadFileToSupabase } from '@/lib/storage/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]);
    
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not supported` },
        { status: 415 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 413 }
      );
    }

    // Upload to Supabase instead of local filesystem
    const uploadedFile = await uploadFileToSupabase(
      file,
      'ppdb-documents',
      user.id
    );
    
    return NextResponse.json(
      { 
        url: uploadedFile.url,
        path: uploadedFile.path,
        message: 'File uploaded successfully' 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('PPDB Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

### B. Update BKK Upload Endpoint

File: `src/app/api/bkk/uploads/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { uploadFileToSupabase } from '@/lib/storage/supabase-storage';

export async function POST(request: NextRequest) {
  try {
    // Get and verify token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    if (!['ALUMNI', 'PERUSAHAAN', 'ADMIN_UTAMA', 'ADMIN_BKK'].includes(String(payload.role))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Allowed document types
    const allowedTypes = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]);

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported. PDF or Word documents only.' },
        { status: 415 }
      );
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large (max 5MB)' },
        { status: 413 }
      );
    }

    // Upload to Supabase
    const uploadedFile = await uploadFileToSupabase(
      file,
      'job-applications',
      String(payload.id)
    );
    
    return NextResponse.json(
      { 
        url: uploadedFile.url,
        path: uploadedFile.path 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('BKK Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
```

---

## 🖼️ UPDATE FRONTEND COMPONENTS

Update any component showing uploaded files to use Supabase URLs:

```typescript
// Before:
const fileUrl = `/uploads/${filename}`;  // ❌ Won't work

// After:
const fileUrl = uploadedFile.url;  // ✅ Full Supabase URL
```

---

## ✅ MIGRATION VERIFICATION

Test the new setup:

```bash
# 1. Add environment variables
# Edit .env.local with SUPABASE credentials

# 2. Test upload locally
npm run dev

# Go to PPDB page
# Try upload file
# Should see Supabase URL in console

# 3. Verify file persists
# Upload same file again
# Stop dev server
# Run dev again
# File should still be accessible
```

---

## 🗑️ CLEANUP (Optional)

Remove old upload code:

```bash
# Delete old upload directory (can keep as backup)
rm -rf public/uploads

# Remove old upload route if duplicate
# Check if src/app/api/public/uploads/route.ts exists
# If it just serves files, can delete after migration complete
```

---

## 📋 BEFORE & AFTER COMPARISON

| Aspect | Before | After |
|--------|--------|-------|
| **Storage** | Local filesystem | Cloud (Supabase) |
| **Persistence** | ❌ Ephemeral (deleted on deploy) | ✅ Permanent |
| **Availability** | Single server | ✅ Global CDN |
| **Backup** | ❌ None | ✅ Automatic |
| **Scalability** | ❌ Limited by disk | ✅ Unlimited |
| **Cost** | Free | ~$5/month (Supabase free tier) |

---

## 🆘 TROUBLESHOOTING

### Upload fails with "403 Forbidden"
- Check SUPABASE_SERVICE_KEY is correct
- Verify bucket exists and is public
- Check bucket policies

### File URL returns 403
- File might be private bucket
- Check bucket policies allow public access
- Regenerate URL with:
  ```typescript
  const { data } = supabase.storage
    .from('bucket')
    .getPublicUrl(filePath);
  ```

### Can't find bucket
- Create bucket in Supabase dashboard
- Or use SQL:
  ```sql
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('my-bucket', 'my-bucket', true);
  ```

---

## 📚 DOCUMENTATION

- Supabase Storage Docs: https://supabase.com/docs/guides/storage
- Supabase JS Client: https://supabase.com/docs/reference/javascript/overview

---

**Implementation Status**: Ready to implement ✅  
**Complexity**: Low to Medium  
**Time to Implement**: ~1-2 hours  
**Critical for Production**: YES ✅
