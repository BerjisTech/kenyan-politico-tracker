
import { Card } from "@/components/ui/card";

export default function Communities() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-6">Communities</h1>
      <div className="grid gap-4">
        <Card className="p-4">
          <h2 className="font-medium mb-2">Communities Coming Soon</h2>
          <p className="text-muted-foreground">This section is under development.</p>
        </Card>
      </div>
    </div>
  );
}
