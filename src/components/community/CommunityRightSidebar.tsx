
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp } from "lucide-react";

export function CommunityRightSidebar() {
  const trendingTopics = [
    { id: 1, name: "Elections 2024", members: 1234 },
    { id: 2, name: "County Development", members: 890 },
    { id: 3, name: "Infrastructure", members: 567 },
  ];

  return (
    <div className="w-[280px] h-screen fixed top-14 right-0 p-4 space-y-4 bg-card border-l overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingTopics.map((topic) => (
            <div key={topic.id} className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">{topic.name}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  {topic.members} members
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
