
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Users, Map, ClipboardList, ChevronDown, Flag, TrendingUp, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useAuth } from "@/context/AuthContext";

const FeatureCard = ({ icon: Icon, title, description, className = "", delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100",
        className
      )}
    >
      <Icon className="h-12 w-12 text-primary mb-4" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
};

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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col items-center"
    >
      <div className="bg-red-50 p-3 rounded-full mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-3xl font-bold mb-1">{Math.floor(count).toLocaleString()}</h3>
      <p className="text-muted-foreground text-sm">{label}</p>
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { user } = useAuth();
  
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-green-500/20 animate-pulse" style={{animationDuration: '10s'}}></div>
          <div className="absolute inset-0 bg-[url('/kenya-map-bg.svg')] opacity-10 bg-no-repeat bg-center bg-contain"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <span className="bg-white/90 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block">
              The Ultimate Political Database
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-kenya-red via-kenya-black to-kenya-green">
              Kenya's Political Landscape<br />In Your Hands
            </h1>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto">
              Access comprehensive data on Kenyan politicians, track projects, analyze trends, and join a community of informed citizens.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button size="lg" className="text-base px-8 py-6" onClick={() => user ? navigate('/dashboard') : navigate('/auth')}>
                {user ? 'Go to Dashboard' : 'Join The Community'}
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
                <Link to="/politicians">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Politicians
                </Link>
              </Button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 cursor-pointer"
              onClick={scrollToFeatures}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm text-slate-600 mb-2">Learn More</span>
                <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Comprehensive Political Intelligence
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-600"
            >
              Stay informed with accurate, up-to-date information on Kenya's political landscape
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
              delay={0.2}
            />
            <FeatureCard 
              icon={ClipboardList} 
              title="Project Tracking" 
              description="Monitor ongoing and completed projects initiated by politicians across different counties."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold mb-4"
            >
              Kenya's Most Comprehensive Political Database
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard icon={Users} value="500" label="Politicians Tracked" delay={0.1} />
            <StatCard icon={Map} value="47" label="Counties Covered" delay={0.2} />
            <StatCard icon={Flag} value="20" label="Political Parties" delay={0.3} />
            <StatCard icon={ClipboardList} value="1500" label="Projects Monitored" delay={0.4} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Join The Political Baseline Community</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Stay informed, contribute data, and be part of the movement to increase political accountability in Kenya.
            </p>
            <Button size="lg" onClick={() => user ? navigate('/dashboard') : navigate('/auth')} className="text-lg px-8 py-6">
              {user ? 'Access Dashboard' : 'Sign Up Now'}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer with Kenya colors */}
      <div className="h-2 bg-gradient-to-r from-kenya-black via-kenya-red to-kenya-green"></div>
    </div>
  );
};

export default Index;
