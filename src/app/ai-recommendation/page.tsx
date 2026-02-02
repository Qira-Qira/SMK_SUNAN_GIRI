'use client';

import Navbar from '@/components/common/Navbar';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code,
  Wrench,
  Palette,
  Brain,
  Zap,
  Layers,
  Lightbulb,
  Users,
  BookOpen,
  Headphones,
  Hammer,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Rocket,
  Building2,
  MapPin,
  Shovel,
} from 'lucide-react';
import CountUp from '@/components/common/CountUp';

interface Answer {
  [key: string]: string;
}

interface Question {
  id: string;
  pertanyaan: string;
  icon: any;
  pilihan: {
    value: string;
    label: string;
    icon: any;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'minat',
    pertanyaan: 'Kegiatan apa yang paling kamu nikamati di waktu luang?',
    icon: Lightbulb,
    pilihan: [
      { value: 'membuat_program', label: 'Membuat program/website', icon: Code },
      { value: 'memperbaiki_elektronik', label: 'Memperbaiki alat elektronik', icon: Wrench },
      { value: 'menggambar_desain', label: 'Menggambar atau mendesain', icon: Palette },
      { value: 'analisis_data', label: 'Menghitung dan menganalisis', icon: Brain },
      { value: 'membantu_orang', label: 'Membantu orang lain', icon: Users },
      { value: 'merakit_buat', label: 'Merakit atau membuat sesuatu', icon: Hammer },
    ],
  },
  {
    id: 'kemampuan',
    pertanyaan: 'Kemampuan mana yang paling menonjol pada diri Anda?',
    icon: Zap,
    pilihan: [
      { value: 'logika_analisis', label: 'Logika & Analisis', icon: Brain },
      { value: 'kreativitas', label: 'Kreativitas', icon: Palette },
      { value: 'komunikasi', label: 'Komunikasi', icon: Users },
      { value: 'kepemimpinan', label: 'Kepemimpinan', icon: Rocket },
      { value: 'kerja_sama_tim', label: 'Kerja sama tim', icon: Layers },
      { value: 'kesabaran_detail', label: 'Kesabaran & detail', icon: BookOpen },
    ],
  },
  {
    id: 'gayaBelajar',
    pertanyaan: 'Anda lebih mudah memahami sesuatu melalui?',
    icon: BookOpen,
    pilihan: [
      { value: 'visual', label: 'Visual (Gambar, Video, Diagram)', icon: Palette },
      { value: 'auditori', label: 'Auditori (Mendengarkan penjelasan)', icon: Headphones },
      { value: 'kinestetik', label: 'Kinestetik (Praktik langsung)', icon: Hammer },
      { value: 'campuran', label: 'Campuran dari semuanya', icon: Layers },
    ],
  },
  {
    id: 'karier',
    pertanyaan: 'Cita-cita karier Anda setelah lulus SMK?',
    icon: Briefcase,
    pilihan: [
      { value: 'berwirausaha', label: 'Berwirausaha/Memiliki bisnis sendiri', icon: Rocket },
      { value: 'pegawai', label: 'Bekerja sebagai karyawan', icon: Building2 },
      { value: 'lanjut_kuliah', label: 'Melanjutkan ke pendidikan tinggi', icon: GraduationCap },
      { value: 'industri_kreatif', label: 'Bekerja di industri kreatif/startup', icon: Lightbulb },
      { value: 'pemerintah', label: 'Bekerja di sektor pemerintahan', icon: MapPin },
    ],
  },
  {
    id: 'preferensi',
    pertanyaan: 'Jenis pekerjaan seperti apa yang Anda inginkan?',
    icon: Shovel,
    pilihan: [
      { value: 'praktik', label: 'Praktik Langsung (Hands-on)', icon: Hammer },
      { value: 'teori_riset', label: 'Teori & Riset', icon: BookOpen },
      { value: 'campuran_kerja', label: 'Campuran Teori & Praktik', icon: Layers },
      { value: 'outdoor', label: 'Pekerjaan di Lapangan', icon: MapPin },
      { value: 'kantor', label: 'Pekerjaan di Kantor', icon: Building2 },
    ],
  },
];

export default function AIRecommendationPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const selectedAnswer = answers[currentQuestion.id];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isAnswered = selectedAnswer !== undefined;
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleSelectAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (!isAnswered) {
      toast.error('Silakan pilih jawaban terlebih dahulu');
      return;
    }

    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai-recommendation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', data);
        toast.error('Gagal: ' + (data.error || 'Error tidak diketahui'));
        return;
      }

      if (data.recommendations) {
        setResults(data.recommendations);
      } else {
        toast.info('Tidak ada data rekomendasi yang diterima');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Gagal mendapatkan rekomendasi: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (results) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-12 px-4 text-emerald-900">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-12 text-center text-emerald-900">Rekomendasi Jurusan Anda</h1>
            <div className="grid md:grid-cols-3 gap-6">
              {results.map((result: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-lg shadow hover:shadow-lg transition border-t-4 border-lime-500">
                  <h3 className="text-2xl font-bold mb-3 text-emerald-900">{result.jurusan}</h3>
                  <div className="text-lime-600 font-bold text-3xl mb-4">
                    <CountUp end={result.score} suffix="%" />
                  </div>
                  <p className="text-emerald-700 text-sm mb-6 leading-relaxed">{result.alasan}</p>
                  <button
                    onClick={() => {
                      setResults(null);
                      setCurrentStep(0);
                      setAnswers({});
                    }}
                    className="w-full bg-lime-500 hover:bg-lime-600 text-emerald-900 px-4 py-3 rounded-lg font-semibold transition duration-200"
                  >
                    Uji Lagi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-br from-emerald-600 to-emerald-500 text-white">
        {/* Header */}
        <div className="text-center py-16 px-4">
          <div className="text-5xl mb-4 flex justify-center">
            <Bot className="w-16 h-16 text-emerald-100" />
          </div>
          <h1 className="text-5xl font-bold mb-4">AI Saran Jurusan SMK</h1>
          <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
            Temukan jurusan yang cocok dengan minat, bakat, dan kemampuan Anda
          </p>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl mx-auto bg-white text-emerald-900 rounded-lg shadow-2xl p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-emerald-700">
                  Pertanyaan {currentStep + 1} dari {QUESTIONS.length}
                </span>
                <span className="text-sm font-semibold text-lime-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-lime-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                {currentQuestion.icon && <currentQuestion.icon className="w-8 h-8 text-emerald-600" />}
                <h2 className="text-3xl font-bold text-emerald-900">
                  {currentQuestion.pertanyaan}
                </h2>
              </div>

              {/* Answer Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.pilihan.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelectAnswer(option.value)}
                      className={`p-6 rounded-lg border-2 transition-all duration-200 text-left flex items-start gap-4 ${
                        selectedAnswer === option.value
                          ? 'border-lime-500 bg-lime-50 text-emerald-900'
                          : 'border-emerald-200 bg-white text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <OptionIcon className={`w-6 h-6 flex-shrink-0 mt-1 ${
                        selectedAnswer === option.value ? 'text-lime-600' : 'text-emerald-600'
                      }`} />
                      <p className="font-semibold text-base">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 justify-between items-center">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  currentStep === 0
                    ? 'bg-emerald-200 text-emerald-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <ChevronLeft className="w-5 h-5" /> Kembali
              </button>

              <button
                onClick={handleNext}
                disabled={!isAnswered || isLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition duration-200 ${
                  isAnswered && !isLoading
                    ? 'bg-gradient-to-r from-lime-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-lime-500/50'
                    : 'bg-emerald-200 text-emerald-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Memproses...
                  </>
                ) : (
                  <>
                    {isLastQuestion ? 'Lihat Hasil' : 'Selanjutnya'} <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
