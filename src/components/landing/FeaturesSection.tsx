
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users, Map, ClipboardList } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -100 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
      transition={{ 
        duration: 0.7, 
        delay, 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }}
      className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100"
    >
      <Icon className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
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
          className="text-3xl font-bold mb-12 text-center text-white"
        >
          Comprehensive Political Intelligence
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={Users}
            title="Politician Profiles" 
            description="Detailed profiles including education, roles, and party affiliations of all major Kenyan political figures."
            delay={0.1}
          />
          <FeatureCard 
            icon={Map} 
            title="County Insights" 
            description="Explore political representation and project distribution across all 47 counties."
            delay={0.3}
          />
          <FeatureCard 
            icon={ClipboardList} 
            title="Project Tracking" 
            description="Monitor ongoing and completed projects initiated by politicians across different counties."
            delay={0.5}
          />
        </div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-black/50 z-0"></div>
    </section>
  );
};

export default FeaturesSection;
