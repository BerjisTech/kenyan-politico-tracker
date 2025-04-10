
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const ChiefStationSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const stationVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    }
  };

  const personVariants = {
    hidden: (i) => ({ opacity: 0, y: 100, x: i % 2 === 0 ? -50 : 50 }),
    visible: (i) => ({ 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { 
        duration: 0.8, 
        delay: 0.2 + (i * 0.1),
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    })
  };

  const textVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        delay: 0.4,
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8, 
        delay: 0.6,
        type: "spring", 
        stiffness: 100, 
        damping: 10 
      }
    }
  };

  return (
    <section ref={ref} className="relative h-screen overflow-hidden flex items-center">
      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">Join Our Community</h2>
            <p className="text-lg text-gray-200 mb-8">
              Become part of a growing network of politically engaged citizens who are driving 
              accountability and transparency. Our platform provides comprehensive data on 
              politicians, projects, and political events across Kenya.
            </p>
          </motion.div>
          
          <motion.div
            variants={ctaVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="bg-white/10 backdrop-blur-md p-8 rounded-xl border border-white/20"
          >
            <h3 className="text-2xl font-bold mb-4 text-white">Get Started Today</h3>
            <p className="text-gray-200 mb-6">
              Access our comprehensive database and join thousands of Kenyans who are 
              staying informed about their political landscape.
            </p>
            <Button 
              size="lg" 
              onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
              className="w-full py-6 text-lg"
            >
              {user ? 'Access Dashboard' : 'Sign Up Now'}
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Chief Station Graphics */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] z-0">
        {/* Station building */}
        <motion.div
          variants={stationVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[300px] h-[120px] bg-slate-700 rounded-t-lg"
        >
          {/* Door */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[50px] h-[80px] bg-slate-900 rounded-t-sm"></div>
          
          {/* Windows */}
          <div className="absolute bottom-[40px] left-[40px] w-[40px] h-[30px] bg-blue-400"></div>
          <div className="absolute bottom-[40px] right-[40px] w-[40px] h-[30px] bg-blue-400"></div>
          
          {/* Sign */}
          <div className="absolute top-[10px] left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-white flex items-center justify-center">
            <span className="text-xs font-bold">CHIEF'S OFFICE</span>
          </div>
        </motion.div>
        
        {/* People */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={personVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="absolute bottom-0"
            style={{
              left: `${20 + (i * 15)}%`,
              zIndex: 10 - i,
            }}
          >
            {/* Person */}
            <div className="relative">
              {/* Head */}
              <div className="w-[20px] h-[20px] bg-amber-800 rounded-full"></div>
              {/* Body */}
              <div className="w-[30px] h-[40px] bg-blue-600 rounded-md mt-1"></div>
              {/* Legs */}
              <div className="flex">
                <div className="w-[10px] h-[20px] bg-gray-700 ml-1"></div>
                <div className="w-[10px] h-[20px] bg-gray-700 ml-1"></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-black/70 z-[-1]"></div>
    </section>
  );
};

export default ChiefStationSection;
