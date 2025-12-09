import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { RegisterForm } from "./register-form";
import { signIn } from "@/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  const returnTo = params.returnTo || "/dashboard";
  const error = params.error;
  const isGoogleOAuthConfigured = !!(
    process.env.GOOGLE_CLIENT_ID && 
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.AUTH_SECRET
  );
  
  // Log missing configuration in development
  if (process.env.NODE_ENV === "development" && !isGoogleOAuthConfigured) {
    const missing = [];
    if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
    if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
    if (!process.env.AUTH_SECRET) missing.push("AUTH_SECRET");
    console.warn(`Google OAuth is not configured. Missing: ${missing.join(", ")}`);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
      <Card className="w-full border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Create account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              {error === "Configuration"
                ? "Google OAuth is not configured. Please use email and password registration, or configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and AUTH_SECRET in your environment variables."
                : "An error occurred during registration. Please try again."}
            </Alert>
          )}
          {isGoogleOAuthConfigured && (
            <>
              <form
                action={async () => {
                  "use server";
                  try {
                    await signIn("google", { redirectTo: returnTo });
                  } catch (error: any) {
                    // Check if this is a Next.js redirect (not a real error)
                    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
                      throw error; // Re-throw redirect exceptions
                    }
                    
                    // Log error for debugging
                    if (process.env.NODE_ENV === "development") {
                      console.error("Google sign-in error:", error);
                    }
                    
                    // Redirect with error if Google sign-in fails
                    redirect(`/auth/register?error=Configuration&returnTo=${encodeURIComponent(returnTo)}`);
                  }
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </form>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-950 px-2 text-white/70">Or continue with</span>
                </div>
              </div>
            </>
          )}
          <RegisterForm returnTo={returnTo} />
          <p className="text-sm text-white/70">
            Already have an account?{" "}
            <Link className="text-sky-300 underline" href="/auth/login">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

