
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HomeIcon, Users, Map, ClipboardList } from "lucide-react";
import { useEffect } from "react";
import { populateSampleData } from "@/services/database";

const Index = () => {
  useEffect(() => {
    // This will populate the database with sample data based on the mock data
    // We only need to run this once to have data in our database
    const initializeData = async () => {
      try {
        await populateSampleData();
        console.log("Sample data has been populated in the database");
      } catch (error) {
        console.error("Error populating sample data:", error);
      }
    };
    
    // Uncomment this to populate sample data
    // initializeData();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-slate-50 px-4 py-10">
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Political Baseline Kenya
        </h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive data on Kenyan politicians, their roles, projects, and more.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button size="lg" asChild>
            <Link to="/politicians">
              <Users className="mr-2 h-5 w-5" />
              View Politicians
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/counties">
              <Map className="mr-2 h-5 w-5" />
              Browse by County
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/parties">
              <ClipboardList className="mr-2 h-5 w-5" />
              Political Parties
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">Politician Profiles</h2>
          <p className="text-muted-foreground mb-4">
            Detailed profiles of Kenyan politicians including their education, current roles, and party affiliations.
          </p>
          <Link to="/politicians" className="text-primary hover:underline font-medium">
            Browse Politicians →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <ClipboardList className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">Projects Tracking</h2>
          <p className="text-muted-foreground mb-4">
            Keep track of ongoing and completed projects initiated by politicians across different counties.
          </p>
          <span className="text-muted-foreground italic">Coming soon</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Map className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-bold mb-2">County Insights</h2>
          <p className="text-muted-foreground mb-4">
            Explore political data organized by counties and constituencies across Kenya.
          </p>
          <Link to="/counties" className="text-primary hover:underline font-medium">
            View Counties →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
