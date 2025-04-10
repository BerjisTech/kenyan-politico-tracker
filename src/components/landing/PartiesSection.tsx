
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Flag, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PartiesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="relative min-h-screen bg-white py-20 flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -100 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ 
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
          >
            <div className="bg-blue-50 p-4 w-16 h-16 rounded-full mb-6 flex items-center justify-center">
              <Flag className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold mb-6">20+ Political Parties</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our system tracks all major and minor political parties in Kenya, providing insights into:
            </p>
            
            <ul className="space-y-4 mb-8">
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <PieChart className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Party Structure</span>
                  <p className="text-muted-foreground">Leadership hierarchies, regional influence, and organizational structure</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <PieChart className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Policy Positions</span>
                  <p className="text-muted-foreground">Track stance on key national issues and policy evolution over time</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <PieChart className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Electoral Performance</span>
                  <p className="text-muted-foreground">Historical election results and representation across government</p>
                </div>
              </motion.li>
            </ul>
            
            <Button variant="outline" className="group border-blue-600 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              Explore Parties 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.2,
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="relative flex justify-center items-center"
          >
            <div className="relative w-[400px] h-[400px]">
              {/* Party 1 */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                className="absolute top-0 left-[25%] w-28 h-28 rounded-full bg-red-500 flex items-center justify-center"
              >
                <span className="text-white font-bold">Party A</span>
              </motion.div>
              
              {/* Party 2 */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                className="absolute top-[25%] right-0 w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center"
              >
                <span className="text-white font-bold">Party B</span>
              </motion.div>
              
              {/* Party 3 */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                className="absolute bottom-[10%] right-[20%] w-32 h-32 rounded-full bg-green-500 flex items-center justify-center"
              >
                <span className="text-white font-bold">Party C</span>
              </motion.div>
              
              {/* Party 4 */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                className="absolute bottom-[30%] left-0 w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center"
              >
                <span className="text-white font-bold">Party D</span>
              </motion.div>
              
              {/* Connection lines */}
              <svg className="absolute inset-0 w-full h-full z-[-1]">
                <motion.line 
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  x1="150" y1="50" x2="300" y2="150" 
                  stroke="#718096" strokeWidth="2" strokeDasharray="5,5" />
                <motion.line 
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  x1="300" y1="150" x2="250" y2="300" 
                  stroke="#718096" strokeWidth="2" strokeDasharray="5,5" />
                <motion.line 
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  x1="250" y1="300" x2="50" y2="250" 
                  stroke="#718096" strokeWidth="2" strokeDasharray="5,5" />
                <motion.line 
                  initial={{ pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  x1="50" y1="250" x2="150" y2="50" 
                  stroke="#718096" strokeWidth="2" strokeDasharray="5,5" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartiesSection;
