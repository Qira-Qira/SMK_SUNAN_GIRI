'use client';

import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/common/HeroSection';
import StatsSection from '@/components/common/StatsSection';
import ProgramsSection from '@/components/common/ProgramsSection';
import FeaturesSection from '@/components/common/FeaturesSection';
import TestimonialSection from '@/components/common/TestimonialSection';
import NewsSection from '@/components/common/NewsSection';
import Footer from '@/components/common/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ProgramsSection />
      <FeaturesSection />
      <TestimonialSection />
      <NewsSection />
      <Footer />

    </>
  );
}
