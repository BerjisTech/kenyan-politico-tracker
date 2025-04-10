
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users, Award, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const PoliticiansSection = () => {
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
            <div className="bg-red-50 p-4 w-16 h-16 rounded-full mb-6 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-6">500+ Politicians Tracked</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our comprehensive database monitors the careers, activities, and performance of over 500 politicians across Kenya. 
              From national leaders to county representatives, we track:
            </p>
            
            <ul className="space-y-4 mb-8">
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Award className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Political History</span>
                  <p className="text-muted-foreground">Complete career trajectory including positions held and party affiliations</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <FileText className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Performance Metrics</span>
                  <p className="text-muted-foreground">Popularity ratings and project completion rates tracked over time</p>
                </div>
              </motion.li>
              
              <motion.li 
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <span className="font-medium">Public Record</span>
                  <p className="text-muted-foreground">Scandals, achievements, and public statements all documented</p>
                </div>
              </motion.li>
            </ul>
            
            <Button variant="default" className="group">
              Explore Politicians 
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
            className="relative h-[500px] bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-opacity-70 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-8 w-full">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                    transition={{ 
                      delay: 0.2 + (i * 0.1), 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15 
                    }}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="w-full aspect-video bg-slate-200 mb-3 rounded-md"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PoliticiansSection;
