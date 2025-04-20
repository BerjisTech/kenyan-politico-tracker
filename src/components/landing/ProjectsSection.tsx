
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ClipboardList, Calendar, ArrowRight, Rocket, Map, Package, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define project timeline data with vector info
const projectTimeline = [
  {
    id: 1,
    title: "Nairobi Expressway",
    date: "2020-2023",
    description: "27.1km elevated highway connecting JKIA to Westlands",
    status: "Completed",
    position: "right",
    vector: <Rocket className="w-32 h-32 text-amber-500" />,
    vectorPosition: "same" // vector appears on same side as text
  },
  {
    id: 2,
    title: "Standard Gauge Railway (SGR)",
    date: "2017-2021",
    description: "Extension of the railway line from Nairobi to Naivasha",
    status: "Completed",
    position: "left",
    vector: <Compass className="w-32 h-32 text-amber-500" />,
    vectorPosition: "opposite" // vector appears opposite to text
  },
  {
    id: 3,
    title: "Kipevu Oil Terminal",
    date: "2019-2022",
    description: "New offshore terminal at the Port of Mombasa",
    status: "In Progress",
    position: "right",
    vector: <Package className="w-32 h-32 text-amber-500" />,
    vectorPosition: "none" // no vector
  }
];

// Timeline item component with vector illustrations
const TimelineItem = ({ item }) => {
  const isRight = item.position === "right";
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "-100px 0px"
  });
  
  const renderVector = () => {
    if (item.vectorPosition === "none") return null;
    
    const vectorElement = (
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15 
        }}
        className="flex items-center justify-center p-8"
      >
        {item.vector}
      </motion.div>
    );
    
    if (item.vectorPosition === "same") {
      return (
        <div className={`w-[45%] ${isRight ? 'ml-auto' : 'mr-auto'}`}>
          {vectorElement}
        </div>
      );
    }
    
    return (
      <div className={`w-[45%] ${!isRight ? 'ml-auto' : 'mr-auto'}`}>
        {vectorElement}
      </div>
    );
  };
  
  return (
    <div className={`flex w-full min-h-[70vh] relative items-center ${
      item.vectorPosition === "same" ? "flex-col" : ""
    }`}>
      {/* Timeline center line */}
      <div className="absolute left-1/2 -translate-x-1/2 h-full">
        <div className="h-full w-0.5 bg-amber-400"></div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15 
          }}
          className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-500 border-2 border-white"
        />
      </div>
      
      {/* Content */}
      {item.vectorPosition === "opposite" && isRight && renderVector()}
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, x: isRight ? 100 : -100 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: isRight ? 100 : -100 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15 
        }}
        className={`w-[45%] p-8 bg-white rounded-lg shadow-md ${isRight ? 'ml-auto' : 'mr-auto'}`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl">{item.title}</h3>
          <span className={`text-sm py-1 px-3 rounded-full ${
            item.status === "Completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            {item.status}
          </span>
        </div>
        <div className="flex items-center text-base text-muted-foreground mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          <span>{item.date}</span>
        </div>
        <p className="text-muted-foreground text-lg leading-relaxed">{item.description}</p>
      </motion.div>
      {item.vectorPosition === "opposite" && !isRight && renderVector()}
      {item.vectorPosition === "same" && renderVector()}
    </div>
  );
};

const ProjectsSection = () => {
  const [sectionRef, sectionInView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  return (
    <section className="relative py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={sectionInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="bg-amber-50 p-4 w-20 h-20 rounded-full mb-8 mx-auto flex items-center justify-center"
          >
            <ClipboardList className="h-10 w-10 text-amber-600" />
          </motion.div>
          
          <motion.h2
            ref={sectionRef} 
            initial={{ opacity: 0, y: 20 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              delay: 0.1,
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="text-5xl font-bold mb-6"
          >
            1,500+ Projects Monitored
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ 
              delay: 0.2,
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="text-xl text-muted-foreground max-w-4xl mx-auto"
          >
            Track the progress, budget, and impact of all major development projects across Kenya, from infrastructure to social programs.
          </motion.p>
        </div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Timeline */}
          {projectTimeline.map((item) => (
            <TimelineItem key={item.id} item={item} />
          ))}
          
          {/* See all projects button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ 
              delay: 0.8,
              duration: 0.7, 
              type: "spring", 
              stiffness: 100, 
              damping: 10 
            }}
            className="flex justify-center mt-16"
          >
            <Button variant="outline" size="lg" className="group border-amber-600 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              View All Projects 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
