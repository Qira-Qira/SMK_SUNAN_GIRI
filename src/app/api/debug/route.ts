import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 1. Cek apakah Env terdeteksi oleh server Vercel
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: "Variabel Environment tidak terbaca di Server!",
      details: {
        url_exists: !!supabaseUrl,
        key_exists: !!supabaseKey
      }
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 2. Cek koneksi dengan fetch sederhana
    const { data, error } = await supabase.from('User').select('count').limit(1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Koneksi Supabase Berhasil!",
      data: data
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: "Gagal Fetch ke Supabase",
      details: err.message, // Ini akan memunculkan alasan RLS atau error lainnya
      hint: err.hint || "Cek kebijakan RLS di dashboard Supabase"
    }, { status: 500 });
  }
}