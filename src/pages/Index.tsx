
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, useScroll, useTransform } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import StatsSection from "../components/landing/StatsSection";
import ChiefStationSection from "../components/landing/ChiefStationSection";
import CTASection from "../components/landing/CTASection";
import Scene3D from "../components/Scene3D";

const Index = () => {
  const containerRef = useRef(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [mapView, setMapView] = useState("front");
  const [mapFlying, setMapFlying] = useState(false);
  
  const totalSections = 5;
  const sectionHeight = 100 / totalSections;
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  
  // Monitor scroll position to update current section
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      // Calculate current section (1-based index)
      const newSection = Math.ceil(value * totalSections);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        
        // Update map view based on section
        if (newSection === 1) {
          setMapView("front");
          setMapFlying(false);
        } else if (newSection === 2) {
          setMapView("south");
          setMapFlying(false);
        } else if (newSection === 3) {
          setMapView("south");
          setMapFlying(true);
        } else {
          setMapView("south");
          setMapFlying(true);
        }
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, currentSection]);
  
  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-y-auto overflow-x-hidden snap-y snap-mandatory">
      {/* 3D Map Background - Always present but changes with scroll */}
      <div className="fixed inset-0 pointer-events-none">
        <Scene3D
          viewMode={mapView}
          flying={mapFlying}
          visible={currentSection <= 3}
        />
      </div>
      
      {/* Section 1: Hero */}
      <div className="snap-start h-screen">
        <HeroSection />
      </div>
      
      {/* Section 2: Features */}
      <div className="snap-start h-screen">
        <FeaturesSection />
      </div>
      
      {/* Section 3: Stats */}
      <div className="snap-start h-screen">
        <StatsSection />
      </div>
      
      {/* Section 4: Chief Station Section */}
      <div className="snap-start h-screen">
        <ChiefStationSection />
      </div>
      
      {/* Section 5: CTA */}
      <div className="snap-start h-screen">
        <CTASection />
      </div>
      
      {/* Kenya colors footer */}
      <div className="h-2 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green"></div>
    </div>
  );
};

export default Index;
