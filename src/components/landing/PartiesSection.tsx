import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Flag, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

const PartiesSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const { data, error } = await supabase
          .from('parties')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setParties(data || []);
      } catch (err) {
        console.error("Error fetching parties:", err);
        toast.error("Could not load parties data");
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

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
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="absolute w-24 h-24 rounded-full bg-slate-200 animate-pulse" 
                       style={{
                         top: `${Math.random() * 300}px`,
                         left: `${Math.random() * 300}px`
                       }}
                  />
                ))
              ) : (
                parties.slice(0, 4).map((party, index) => (
                  <motion.div
                    key={party.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                    className={`absolute w-${28 - (index * 4)} h-${28 - (index * 4)} rounded-full ${
                      ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][index]
                    } flex items-center justify-center text-center p-4`}
                    style={{
                      top: ['0%', '25%', '10%', '30%'][index],
                      left: ['25%', '0%', '20%', '0%'][index],
                    }}
                  >
                    <span className="text-white font-bold text-sm">{party.name}</span>
                  </motion.div>
                ))
              )}
              
              {/* Connection lines */}
              {!loading && parties.length > 0 && (
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
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartiesSection;
