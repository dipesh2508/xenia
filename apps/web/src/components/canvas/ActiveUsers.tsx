import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Badge } from "@repo/ui/components/ui/badge";
import { Clock } from "lucide-react";

interface CanvasUser {
  id: string;
  name: string;
  image: string | null;
  color: string;
  mousePosition?: { x: number; y: number } | null;
  lastActive: Date;
}

interface ActiveUsersProps {
  users: CanvasUser[];
  currentUserId?: string;
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ users, currentUserId }) => {
  // Format the time elapsed since the user was last active
  const formatTimeElapsed = (lastActive: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(lastActive).getTime()) / 1000);
    
    if (diffInSeconds < 5) {
      return "now";
    } else if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }
  };

  if (users.length === 0 && !currentUserId) {
    return null;
  }

  return (
    <div className="w-64 border-l bg-background/60 backdrop-blur-sm p-3 overflow-y-auto h-full shrink-0">
      <h3 className="text-sm font-medium mb-3">Active Users</h3>
      
      <div className="space-y-3">
        {/* Current user */}
        {currentUserId && (
          <div className="flex items-center justify-between p-2 rounded-md bg-accent/20">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ background: "linear-gradient(45deg, #22c55e, #10b981)" }}
              />
              <span className="text-sm font-medium">You</span>
            </div>
            <Badge variant="outline" className="bg-background/80">Active</Badge>
          </div>
        )}
        
        {/* Other users */}
        {users.map((user) => (
          <div 
            key={user.id}
            className="flex items-center justify-between p-2 rounded-md hover:bg-accent/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || undefined} alt={user.name} />
                <AvatarFallback 
                  className="text-xs"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {formatTimeElapsed(user.lastActive)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Color indicator */}
            <div 
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: user.color }}
            />
          </div>
        ))}
      </div>

      {users.length === 0 && currentUserId && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          No other users are currently active.
        </div>
      )}
    </div>
  );
};

export default ActiveUsers; 