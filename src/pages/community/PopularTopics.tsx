
import { Card } from "@/components/ui/card";

export default function PopularTopics() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-6">Popular Topics</h1>
      <div className="grid gap-4">
        <Card className="p-4">
          <h2 className="font-medium mb-2">Popular Topics Coming Soon</h2>
          <p className="text-muted-foreground">This section is under development.</p>
        </Card>
      </div>
    </div>
  );
}
