
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ChevronDown } from "lucide-react";

const StatsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="relative h-screen flex items-center">
      <div className="container mx-auto px-4 z-10">
        <motion.h2 
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: 0.5,
            type: "spring", 
            stiffness: 100, 
            damping: 10  
          }}
          className="text-4xl md:text-5xl font-bold mb-8 text-center text-white"
        >
          Kenya's Most Comprehensive Political Database
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.5,
            delay: 0.2,
            type: "spring", 
            stiffness: 100, 
            damping: 10  
          }}
          className="text-lg md:text-xl text-center text-white/80 max-w-3xl mx-auto mb-16"
        >
          Scroll down to discover the depth and breadth of our political tracking system,
          featuring detailed information on politicians, counties, parties, and projects.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ 
            duration: 0.5,
            delay: 0.4,
            type: "spring", 
            stiffness: 100, 
            damping: 10  
          }}
          className="flex justify-center mt-16"
        >
          <ChevronDown className="h-10 w-10 text-white animate-bounce" />
        </motion.div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
    </section>
  );
};

export default StatsSection;
