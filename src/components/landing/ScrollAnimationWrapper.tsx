
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const ScrollAnimationWrapper = ({
  children,
  section = 1,
  totalSections = 5,
  onScroll
}) => {
  const [currentSection, setCurrentSection] = useState(1);
  const { scrollYProgress } = useScroll();
  
  // Calculate section thresholds
  const sectionHeight = 1 / totalSections;
  const sectionStart = (section - 1) * sectionHeight;
  const sectionEnd = section * sectionHeight;
  
  // Transform scrollYProgress to section progress (0 to 1)
  const sectionProgress = useTransform(
    scrollYProgress,
    [sectionStart, sectionEnd],
    [0, 1]
  );
  
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((value) => {
      const newSection = Math.ceil(value * totalSections);
      if (newSection !== currentSection) {
        setCurrentSection(newSection);
        if (onScroll) {
          onScroll(newSection);
        }
      }
    });
    
    return () => unsubscribe();
  }, [scrollYProgress, totalSections, currentSection, onScroll]);
  
  return (
    <motion.div style={{ opacity: sectionProgress }}>
      {children}
    </motion.div>
  );
};

export default ScrollAnimationWrapper;
