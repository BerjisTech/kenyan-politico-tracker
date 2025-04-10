
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/services/auth";
import { Link } from "react-router-dom";
import { LogIn, LogOut, User, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function UserMenu() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      setIsOpen(false);
    }
  };

  const getInitials = () => {
    if (user?.user_metadata?.first_name || user?.user_metadata?.last_name) {
      return `${(user.user_metadata.first_name || '').charAt(0)}${(user.user_metadata.last_name || '').charAt(0)}`;
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return isAuthenticated ? (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-primary text-white">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <div className="flex gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/auth">
          <LogIn className="h-4 w-4 mr-2" />
          Log In
        </Link>
      </Button>
      <Button size="sm" asChild>
        <Link to="/auth?tab=signup">
          <UserPlus className="h-4 w-4 mr-2" />
          Sign Up
        </Link>
      </Button>
    </div>
  );
}
