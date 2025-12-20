import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">Siap Memulai Karirmu di Industri Digital?</h2>
        <p className="text-emerald-50 mb-6">Bergabunglah dengan ribuan alumni yang telah sukses berkarir di perusahaan ternama.</p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="inline-block bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-emerald-50 transition duration-200">Daftar Sekarang</Link>
          <Link href="/contact" className="inline-block bg-lime-400 hover:bg-lime-300 text-emerald-900 px-6 py-3 rounded-lg transition duration-200 font-semibold">Hubungi Kami</Link>
        </div>
      </div>
    </footer>
  );
}
