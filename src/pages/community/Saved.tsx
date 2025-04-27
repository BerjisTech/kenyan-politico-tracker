
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { fetchSavedContent } from "@/services/community";
import { Post } from "@/types/community";
import { BookmarkX } from "lucide-react";

export default function Saved() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedContent() {
      try {
        setLoading(true);
        const { posts } = await fetchSavedContent({ pageSize: 20 });
        setSavedPosts(posts);
      } catch (error) {
        console.error("Error loading saved content:", error);
        toast.error("Failed to load your saved content");
      } finally {
        setLoading(false);
      }
    }

    loadSavedContent();
  }, []);

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-semibold mb-6">Saved Content</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : savedPosts.length > 0 ? (
        <div className="grid gap-4">
          {savedPosts.map((post) => (
            <Card key={post.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-0">
                <h2 className="font-medium mb-2">{post.title}</h2>
                <p className="text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookmarkX className="h-12 w-12 text-primary/70" />
            </div>
            <h2 className="text-xl font-medium">No saved content yet</h2>
            <p className="text-muted-foreground max-w-md">
              When you save posts or topics, they'll appear here for easy access.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
