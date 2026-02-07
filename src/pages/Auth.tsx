import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Film, Clapperboard } from "lucide-react";
import { Navigate } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().trim().email("Invalid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }
    const passResult = passwordSchema.safeParse(password);
    if (!passResult.success) {
      setError(passResult.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error: authError } = isSignUp
      ? await signUp(emailResult.data, password)
      : await signIn(emailResult.data, password);

    if (authError) {
      setError(authError.message);
    } else if (isSignUp) {
      setSignUpSuccess(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            <h1 className="text-5xl text-foreground">WATCHLOG</h1>
          </div>
          <p className="text-muted-foreground text-sm">Track every movie & series you watch</p>
        </div>

        {signUpSuccess ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center space-y-3">
            <Film className="h-10 w-10 text-primary mx-auto" />
            <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <Button variant="ghost" onClick={() => { setSignUpSuccess(false); setIsSignUp(false); }}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
            <h2 className="text-2xl text-center text-foreground">{isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}</h2>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
