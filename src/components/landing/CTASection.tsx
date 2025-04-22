
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center">
      <div className="container mx-auto px-4 z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ 
            duration: 0.8,
            type: "spring", 
            stiffness: 100, 
            damping: 10 
          }}
          className="bg-gradient-to-r from-kenya-red/60 to-kenya-green/60 backdrop-blur-lg rounded-2xl shadow-2xl p-12 max-w-4xl mx-auto text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.2,
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="text-4xl font-bold mb-6 text-white"
          >
            Join The Political Baseline Community
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.4,
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="text-xl text-white mb-10 max-w-3xl mx-auto"
          >
            Stay informed, contribute data, and be part of the movement to increase political accountability in Kenya.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.6,
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/community')}
              className="text-lg px-10 py-8 bg-white text-kenya-black hover:bg-white/90"
            >
              Join Our Community
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 bg-black/80 text-white py-8 z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">About Us</h3>
              <p className="text-sm text-white/70">
                Political Baseline is dedicated to tracking and analyzing political data
                in Kenya to promote transparency and accountability.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><Link to="/politicians" className="hover:text-white">Politicians</Link></li>
                <li><Link to="/parties" className="hover:text-white">Political Parties</Link></li>
                <li><Link to="/counties" className="hover:text-white">Counties</Link></li>
                <li><Link to="/community" className="hover:text-white">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <p className="text-sm text-white/70">
                Have questions or suggestions? Join our community to get in touch.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
            © {new Date().getFullYear()} Political Baseline. All rights reserved.
          </div>
        </div>
      </footer>
    </section>
  );
};

export default CTASection;
