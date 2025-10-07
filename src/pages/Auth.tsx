import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import CountryCodeSelector from "@/components/CountryCodeSelector";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [birthday, setBirthday] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password strength validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  // Birthday validation (must be 13+ years old)
  const validateBirthday = (birthday: string) => {
    if (!birthday) return { isValid: false, message: "" };
    
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
    
    return {
      isValid: actualAge >= 13,
      message: actualAge < 13 ? "Must be 13 years or older" : ""
    };
  };

  // Location validation
  const validateLocation = (location: string) => {
    const trimmedLocation = location.trim();
    return {
      isValid: trimmedLocation.length >= 2,
      message: trimmedLocation.length < 2 ? "Please enter your city and state/country" : ""
    };
  };

  const passwordValidation = validatePassword(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";
  const birthdayValidation = validateBirthday(birthday);
  const locationValidation = validateLocation(location);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        navigate("/epk");
      }
    };
    checkAuth();
  }, [navigate]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset Link Sent!",
        description: "Check your email for the password reset link.",
      });
      
      setShowResetForm(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate password requirements
    if (!passwordValidation.isValid) {
      toast({
        title: "Password Requirements Not Met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (!passwordsMatch) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both password fields match.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate age requirement
    if (!birthdayValidation.isValid) {
      toast({
        title: "Age Requirement",
        description: birthdayValidation.message || "Please enter a valid birthday.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate location requirement
    if (!locationValidation.isValid) {
      toast({
        title: "Location Required",
        description: locationValidation.message || "Please enter your location.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const signUpData: any = {
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            birthday,
            location,
            ...(phoneNumber && { phone: `${countryCode}${phoneNumber}` })
          }
        }
      };
      
      const { error } = await supabase.auth.signUp(signUpData);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
      });
      
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setPhoneNumber("");
      setBirthday("");
      setLocation("");
      setActiveTab("signin");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate("/epk");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/80 p-4">
      <Card className="w-full max-w-md glass-card border-white/10 transition-all duration-500 animate-slide-in-up">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">
            {showResetForm ? "Reset Password" : "Welcome to WinningEPK"}
          </CardTitle>
          <CardDescription>
            {showResetForm ? "Enter your email to receive a reset link" : "Create your professional electronic press kit"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showResetForm ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResetForm(false)}
                className="mb-4 p-0 h-auto text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full transition-all duration-300 hover:shadow-glow" 
                disabled={loading || !resetEmail}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 transition-all duration-300">
                <TabsTrigger value="signin" className="transition-all duration-200">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="transition-all duration-200">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="transition-all duration-300">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                      >
                        {showSignInPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        className="transition-all duration-200"
                      />
                      <Label htmlFor="remember" className="text-sm">Remember me</Label>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-primary hover:text-primary/80 transition-colors duration-200 underline-offset-4 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full transition-all duration-300 hover:shadow-glow" 
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="transition-all duration-300">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number <span className="text-muted-foreground">(optional)</span></Label>
                    <div className="flex">
                      <CountryCodeSelector
                        value={countryCode}
                        onChange={setCountryCode}
                        className="rounded-r-none border-r-0"
                      />
                      <Input
                        id="phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="123-456-7890"
                        className="rounded-l-none transition-all duration-200 focus:ring-2 focus:ring-primary/50"
                        maxLength={15}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthday">Birthday</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className={`transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
                        birthday && !birthdayValidation.isValid ? "border-destructive" : ""
                      }`}
                      required
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    />
                    {birthday && !birthdayValidation.isValid && (
                      <p className="text-xs text-destructive animate-slide-in-up">{birthdayValidation.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Nashville, TN or London, UK"
                        className={`pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
                          location && !locationValidation.isValid ? "border-destructive" : ""
                        }`}
                        required
                        autoComplete="address-level2"
                      />
                    </div>
                    {location && !locationValidation.isValid && (
                      <p className="text-xs text-destructive animate-slide-in-up">{locationValidation.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Your location helps with local booking opportunities
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
                          password && !passwordValidation.isValid ? "border-destructive" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </div>
                    
                    {password && (
                      <div className="space-y-1 text-xs animate-slide-in-up">
                        <div className={`flex items-center gap-1 transition-colors duration-200 ${passwordValidation.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span className={`text-xs ${passwordValidation.minLength ? '✓' : '○'}`}>
                            {passwordValidation.minLength ? '✓' : '○'}
                          </span>
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1 transition-colors duration-200 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span className={`text-xs ${passwordValidation.hasUpperCase ? '✓' : '○'}`}>
                            {passwordValidation.hasUpperCase ? '✓' : '○'}
                          </span>
                          One uppercase letter
                        </div>
                        <div className={`flex items-center gap-1 transition-colors duration-200 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span className={`text-xs ${passwordValidation.hasLowerCase ? '✓' : '○'}`}>
                            {passwordValidation.hasLowerCase ? '✓' : '○'}
                          </span>
                          One lowercase letter
                        </div>
                        <div className={`flex items-center gap-1 transition-colors duration-200 ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span className={`text-xs ${passwordValidation.hasNumbers ? '✓' : '○'}`}>
                            {passwordValidation.hasNumbers ? '✓' : '○'}
                          </span>
                          One number
                        </div>
                        <div className={`flex items-center gap-1 transition-colors duration-200 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}`}>
                          <span className={`text-xs ${passwordValidation.hasSpecialChar ? '✓' : '○'}`}>
                            {passwordValidation.hasSpecialChar ? '✓' : '○'}
                          </span>
                          One special character
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/50 ${
                          confirmPassword && !passwordsMatch ? "border-destructive" : passwordsMatch ? "border-green-600" : ""
                        }`}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                        )}
                      </Button>
                    </div>
                    {confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-destructive animate-slide-in-up">Passwords do not match</p>
                    )}
                    {passwordsMatch && (
                      <p className="text-xs text-green-600 animate-slide-in-up">✓ Passwords match</p>
                    )}
                  </div>
                  
                   <Button 
                     type="submit" 
                     className="w-full transition-all duration-300 hover:shadow-glow" 
                     disabled={loading || !passwordValidation.isValid || !passwordsMatch || !birthdayValidation.isValid || !locationValidation.isValid}
                   >
                     {loading ? "Creating Account..." : "Create Account"}
                   </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}