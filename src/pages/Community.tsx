
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Construction } from "lucide-react";

export default function Community() {
  return (
    <div className="container py-20">
      <Card className="shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Community Dashboard Coming Soon</CardTitle>
          <div className="flex justify-center mt-8">
            <Construction className="h-24 w-24 text-primary/70" />
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            We're currently building an amazing community dashboard where you'll be able to:
          </p>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Connect with other users</span>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Contribute to politician data</span>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Track politician activities</span>
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <span>Join community discussions</span>
            </div>
          </div>
          
          <div className="mt-8">
            <Button asChild>
              <a href="/politicians">Explore Politicians</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
