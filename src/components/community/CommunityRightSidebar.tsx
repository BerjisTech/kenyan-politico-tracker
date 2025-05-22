
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Bookmark, MessageSquare, Plus, TrendingUp, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export function CommunityRightSidebar() {
  const navigate = useNavigate();
  
  const trendingTopics = [
    { id: 1, name: "Elections 2024", members: 1234 },
    { id: 2, name: "County Development", members: 890 },
    { id: 3, name: "Infrastructure", members: 567 },
  ];

  const quickActions = [
    { icon: Bell, label: 'Notifications', count: 3, path: '/community/notifications' },
    { icon: MessageSquare, label: 'Messages', count: 5, path: '/community/messages' },
    { icon: Bookmark, label: 'Saved', count: 12, path: '/community/saved' },
  ];

  return (
    <div className="w-[280px] h-screen fixed top-14 right-0 p-4 space-y-4 bg-card border-l overflow-auto">
      <Button className="w-full" size="lg" onClick={() => navigate('/community/post/new')}>
        <Plus className="mr-2 h-4 w-4" />
        Create Community
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="w-full justify-between"
              onClick={() => navigate(action.path)}
            >
              <span className="flex items-center">
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </span>
              {action.count > 0 && (
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                  {action.count}
                </span>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>

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
