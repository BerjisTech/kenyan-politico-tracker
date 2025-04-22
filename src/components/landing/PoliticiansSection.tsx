
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Users, Award, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PoliticiansSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  const [politicians, setPoliticians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoliticians = async () => {
      try {
        // Get politicians ordered by popularity (using ratings)
        const { data, error } = await supabase
          .from('politicians')
          .select(`
            id, name, image, bio, 
            popularity_ratings(rating, date),
            roles!roles_politician_id_fkey(title, organization)
          `)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          throw error;
        }

        // Transform and sort by popularity if ratings exist
        const processedPoliticians = data.map(politician => {
          // Calculate average rating if ratings exist
          const ratings = politician.popularity_ratings || [];
          const avgRating = ratings.length > 0 
            ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length
            : 0;
            
          return {
            ...politician,
            avgRating,
            currentRole: politician.roles && politician.roles.length > 0 
              ? politician.roles[0] 
              : { title: 'Politician', organization: '' }
          };
        }).sort((a, b) => b.avgRating - a.avgRating);
        
        setPoliticians(processedPoliticians);
      } catch (err) {
        console.error("Error fetching politicians:", err);
        toast.error("Could not load politicians data");
      } finally {
        setLoading(false);
      }
    };

    fetchPoliticians();
  }, []);

  const PoliticianCard = ({ politician, index }) => (
    <motion.div 
      key={politician.id}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
      transition={{ 
        delay: 0.2 + (index * 0.1), 
        type: "spring", 
        stiffness: 200, 
        damping: 15 
      }}
      className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
    >
      <div className="w-full aspect-video bg-slate-100 mb-3 rounded-md overflow-hidden">
        {politician.image ? (
          <img 
            src={politician.image} 
            alt={politician.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/300x200?text=No+Image";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            <Users className="h-12 w-12 text-slate-400" />
          </div>
        )}
      </div>
      <h3 className="font-medium text-lg">{politician.name}</h3>
      <p className="text-sm text-primary">
        {politician.currentRole?.title} 
        {politician.currentRole?.organization ? ` • ${politician.currentRole.organization}` : ''}
      </p>
    </motion.div>
  );

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
            
            <Button variant="default" asChild className="group">
              <a href="/politicians">
                Explore Politicians 
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
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
                {loading ? (
                  // Loading skeletons
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg shadow-md">
                      <Skeleton className="w-full h-32 mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))
                ) : (
                  // Politician cards
                  politicians.map((politician, i) => (
                    <PoliticianCard key={politician.id} politician={politician} index={i} />
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PoliticiansSection;
