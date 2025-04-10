
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Map, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CountiesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="relative min-h-screen bg-slate-50 py-20 flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
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
            className="order-2 md:order-1 relative h-[500px]"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={inView ? { scale: 1, y: 0, opacity: 1 } : { scale: 0.9, y: 20, opacity: 0 }}
              transition={{ 
                delay: 0.3, 
                duration: 0.7, 
                type: "spring", 
                stiffness: 100, 
                damping: 10 
              }}
              className="absolute w-[80%] h-[70%] top-[15%] left-[10%] bg-white shadow-2xl rounded-xl p-6"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h4 className="text-lg font-bold">County Profile</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive data</p>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <Map className="h-5 w-5 text-primary" />
                </div>
              </div>
              
              {/* County map visualization placeholder */}
              <div className="w-full h-[60%] bg-slate-100 rounded-lg mb-4"></div>
              
              {/* County stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Politicians</p>
                  <p className="font-medium">42</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md">
                  <p className="text-xs text-muted-foreground">Projects</p>
                  <p className="font-medium">156</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ scale: 0.9, x: -30, y: -30, opacity: 0 }}
              animate={inView ? { scale: 1, x: 0, y: 0, opacity: 1 } : { scale: 0.9, x: -30, y: -30, opacity: 0 }}
              transition={{ 
                delay: 0.5, 
                duration: 0.7, 
                type: "spring", 
                stiffness: 100, 
                damping: 10 
              }}
              className="absolute w-[60%] h-[40%] top-0 right-0 bg-white shadow-xl rounded-xl p-4"
            >
              <h4 className="text-sm font-medium mb-2">Development Index</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Healthcare</span>
                    <span>72%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Infrastructure</span>
                    <span>58%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span>Education</span>
                    <span>84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
          
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
            className="order-1 md:order-2"
          >
            <div className="bg-green-50 p-4 w-16 h-16 rounded-full mb-6 flex items-center justify-center">
              <Map className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold mb-6">All 47 Counties Covered</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our database spans all 47 counties of Kenya, providing detailed information about:
            </p>
            
            <ul className="space-y-4 mb-8">
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Leadership Structure</span>
                  <p className="text-muted-foreground">Complete profiles of governors, senators, and local representatives</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Development Metrics</span>
                  <p className="text-muted-foreground">Track economic growth, infrastructure projects, and social indicators</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Check className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Resource Allocation</span>
                  <p className="text-muted-foreground">Budget analysis and resource distribution across counties</p>
                </div>
              </motion.li>
            </ul>
            
            <Button variant="outline" className="group border-green-600 text-green-600 hover:text-green-700 hover:bg-green-50">
              Explore Counties 
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CountiesSection;
