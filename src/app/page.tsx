'use client';

import Navbar from '@/components/common/Navbar';
import HeroSection from '@/components/common/HeroSection';
import StatsSection from '@/components/common/StatsSection';
import ProgramsSection from '@/components/common/ProgramsSection';
import FeaturesSection from '@/components/common/FeaturesSection';
import TestimonialSection from '@/components/common/TestimonialSection';
import NewsSection from '@/components/common/NewsSection';
import VideoSection from '@/components/common/VideoSection';
import VisiMisiSection from '@/components/common/VisiMisiSection';
import Footer from '@/components/common/Footer';
import ScrollAnimation from '@/components/common/ScrollAnimation';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />

      <StatsSection />

      <ScrollAnimation animation="fade-up" delay={150}>
        <VisiMisiSection />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" delay={200}>
        <ProgramsSection />
      </ScrollAnimation>

      <FeaturesSection />

      <ScrollAnimation animation="fade-up" delay={200}>
        <TestimonialSection />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" delay={200}>
        <NewsSection />
      </ScrollAnimation>

      <ScrollAnimation animation="fade-up" delay={200}>
        <VideoSection />
      </ScrollAnimation>

      <Footer />
    </>
  );
}
