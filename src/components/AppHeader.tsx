import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Settings, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import newLogo from "@/assets/newlogo.svg";

const AppHeader = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => {
            fetchArtistProfile(session.user.id);
          }, 0);
        } else {
          setArtistName(null);
        }
      }
    );

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
      navigate("/");
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { label: "Venues", path: "/venues" },
    { label: "Press Kit", path: "/epk" },
    { label: "Outreach", path: "/outreach" },
  ];

  const NavButton = ({ label, path }: { label: string; path: string }) => (
    <Button
      variant="ghost"
      onClick={() => {
        navigate(path);
        setMobileMenuOpen(false);
      }}
      className={`transition-all duration-200 ${
        isActivePath(path)
          ? "bg-primary/10 text-primary font-semibold border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left - Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center hover:opacity-80 transition-opacity"
        >
          <img src={newLogo} alt="SHOCASE" className="h-8 w-auto" />
        </button>

        {/* Center - Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <NavButton key={item.path} label={item.label} path={item.path} />
          ))}
        </nav>

        {/* Right - Account & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-card/95 backdrop-blur-sm">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`justify-start text-base h-12 ${
                      isActivePath(item.path)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Account Dropdown */}
          {user && (
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
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
