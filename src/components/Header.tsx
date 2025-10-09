import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User, LogOut, Settings, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import newIcon from "@/assets/newicon.svg";

const Header = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [iconPosition, setIconPosition] = useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchArtistProfile(session.user.id);
        } else {
          setArtistName(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchArtistProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchArtistProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('artist_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching artist profile:', error);
        return;
      }

      setArtistName(data?.artist_name || null);
    } catch (error) {
      console.error('Error fetching artist profile:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setIconPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Draggable Icon */}
      <div 
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
        style={{
          left: `${iconPosition.x}px`,
          top: `${iconPosition.y}px`,
          filter: isDragging ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'none'
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (!isDragging) {
            navigate('/');
          }
        }}
      >
        <img 
          src={newIcon} 
          alt="SHOCASE Icon" 
          className="h-12 w-auto"
          draggable={false}
        />
      </div>

      {/* Main Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-6 backdrop-blur-md bg-background/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left - Empty spacer for balance */}
          <div className="w-24" />
          
          {/* Center Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/venues")}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
            >
              Venues
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => user ? navigate("/epk") : navigate("/auth")}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
            >
              Press Kit
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => user ? navigate("/outreach") : navigate("/auth")}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
            >
              Outreach
            </Button>
          </nav>
          
          {/* Right - Auth Section */}
          <div className="flex items-center gap-2 w-24 justify-end">
            {/* Mobile Hamburger Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10 h-11 w-11"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-card/95 backdrop-blur-sm">
                <nav className="flex flex-col gap-2 mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate("/venues");
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-base h-12 text-foreground hover:bg-muted"
                  >
                    Venues
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      user ? navigate("/epk") : navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-base h-12 text-foreground hover:bg-muted"
                  >
                    Press Kit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      user ? navigate("/outreach") : navigate("/auth");
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-base h-12 text-foreground hover:bg-muted"
                  >
                    Outreach
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.email || "")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card/95 backdrop-blur-sm border-white/10 z-50" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{artistName || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      Signed in
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account-settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="hidden md:flex items-center gap-2 text-white hover:text-gray-300"
              >
                <User className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;