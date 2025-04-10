
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Text content aligned to the right */}
      <div className="absolute inset-0 flex items-center justify-end z-10">
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 1, 
            type: "spring", 
            stiffness: 100, 
            damping: 10 
          }}
          className="max-w-lg mx-16 text-right"
        >
          <span className="bg-white/90 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 inline-block">
            The Ultimate Political Database
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-kenya-red via-kenya-black to-kenya-green">
            Kenya's Political Landscape<br />In Your Hands
          </h1>
          <p className="text-xl text-white mb-8 shadow-text">
            Access comprehensive data on Kenyan politicians, track projects, analyze trends, and join a community of informed citizens.
          </p>
          
          <div className="flex flex-wrap justify-end gap-4 mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                size="lg" 
                className="text-base px-8 py-6" 
                onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
              >
                {user ? 'Go to Dashboard' : 'Join The Community'}
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6 bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                <Link to="/politicians">
                  <Users className="mr-2 h-5 w-5" />
                  Explore Politicians
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/70 z-[5]"></div>
    </section>
  );
};

export default HeroSection;
