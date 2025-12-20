import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Siap Memulai Karirmu di Industri Digital?</h2>
        <p className="text-white/90 mb-6">Bergabunglah dengan ribuan alumni yang telah sukses berkarir di perusahaan ternama.</p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="inline-block bg-white text-blue-700 font-semibold px-6 py-2 rounded-lg shadow hover:opacity-95">Daftar Sekarang</Link>
          <Link href="/contact" className="inline-block bg-white/10 border border-white/30 text-white px-5 py-2 rounded-lg hover:bg-white/20">Hubungi Kami</Link>
        </div>
      </div>
    </footer>
  );
}
