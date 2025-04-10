
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users, Map, Flag, ClipboardList } from "lucide-react";

const StatCard = ({ value, label, icon: Icon, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const end = parseInt(value);
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start > end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [inView, value]);
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 100 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
      transition={{ 
        duration: 0.7, 
        delay, 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }}
      className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center"
    >
      <div className="bg-red-50 p-3 rounded-full mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-3xl font-bold mb-1">{Math.floor(count).toLocaleString()}</h3>
      <p className="text-muted-foreground text-sm">{label}</p>
    </motion.div>
  );
};

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
          className="text-3xl font-bold mb-16 text-center text-white"
        >
          Kenya's Most Comprehensive Political Database
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={Users} value="500" label="Politicians Tracked" delay={0.1} />
          <StatCard icon={Map} value="47" label="Counties Covered" delay={0.3} />
          <StatCard icon={Flag} value="20" label="Political Parties" delay={0.5} />
          <StatCard icon={ClipboardList} value="1500" label="Projects Monitored" delay={0.7} />
        </div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
    </section>
  );
};

export default StatsSection;
