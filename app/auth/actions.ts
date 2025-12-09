"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerUser, signIn, signOut } from "@/lib/auth";
import { signOut as nextAuthSignOut } from "@/auth";

function getReturnTo(formData: FormData) {
  const rt = String(formData.get("returnTo") || "");
  if (rt.startsWith("/")) return rt;
  return "/dashboard";
}

export type AuthActionResult = 
  | { success: true; redirectTo: string }
  | { success: false; error: string };

export async function registerAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const returnTo = getReturnTo(formData);
    
    try {
      // Step 1: Register user
      let user;
      try {
        user = await registerUser(email, password);
      } catch (registerError: any) {
        const registerErrorMessage = registerError?.message || "Unknown error";
        
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === "development") {
          console.error("Registration error:", registerErrorMessage, registerError);
        }
        
        // User-friendly error messages for registration
        if (registerErrorMessage.includes("already exists") || registerErrorMessage.includes("User already exists")) {
          return {
            success: false,
            error: "A user with this email already exists. Please sign in or use a different email.",
          };
        }
        
        // Password validation errors
        if (
          registerErrorMessage.includes("Invalid password") ||
          registerErrorMessage.includes("password") ||
          registerErrorMessage.includes("Password must") ||
          registerErrorMessage.includes("at least") ||
          registerErrorMessage.includes("uppercase") ||
          registerErrorMessage.includes("lowercase") ||
          registerErrorMessage.includes("number")
        ) {
          return {
            success: false,
            error: registerErrorMessage.includes("Password must") 
              ? registerErrorMessage 
              : "Password does not meet requirements. Password must be at least 8 characters and contain uppercase, lowercase letters, and numbers.",
          };
        }
        
        // Prisma errors
        if (registerErrorMessage.includes("Unique constraint") || registerErrorMessage.includes("P2002")) {
          return {
            success: false,
            error: "A user with this email already exists. Please sign in or use a different email.",
          };
        }
        
        // Return the actual error message if it's user-friendly
        return {
          success: false,
          error: registerErrorMessage && registerErrorMessage !== "Unknown error" && registerErrorMessage.length < 200
            ? registerErrorMessage
            : "Failed to create account. Please try again.",
        };
      }
      
      // Step 2: Sign in the newly created user
      try {
        await signIn(email, password);
        revalidatePath("/dashboard");
        redirect(returnTo);
        // This will never be reached, but TypeScript needs it
        return { success: true, redirectTo: returnTo };
      } catch (signInError: any) {
        // Check if this is a Next.js redirect (not a real error)
        if (signInError?.digest?.startsWith("NEXT_REDIRECT")) {
          throw signInError; // Re-throw redirect exceptions
        }
        
        // If registration succeeded but sign-in failed, user was created but session wasn't
        const signInErrorMessage = signInError?.message || "Unknown error";
        
        if (process.env.NODE_ENV === "development") {
          console.error("Sign-in after registration error:", signInErrorMessage, signInError);
        }
        
        // User was created, but sign-in failed - redirect to login
        redirect(`/auth/login?error=AccountCreated&returnTo=${encodeURIComponent(returnTo)}`);
        return { success: true, redirectTo: returnTo };
      }
    } catch (error: any) {
      // Check if this is a Next.js redirect (not a real error)
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error; // Re-throw redirect exceptions
      }
      
      const errorMessage = error?.message || "Unknown error";
      
      if (process.env.NODE_ENV === "development") {
        console.error("Unexpected registration error:", errorMessage, error);
      }
      
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  } catch (error: any) {
    // Check if this is a Next.js redirect (not a real error)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect exceptions
    }
    
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}

export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const returnTo = getReturnTo(formData);
    
    try {
      await signIn(email, password);
      revalidatePath("/dashboard");
      redirect(returnTo);
      // This will never be reached, but TypeScript needs it
      return { success: true, redirectTo: returnTo };
    } catch (error: any) {
      // Check if this is a Next.js redirect (not a real error)
      if (error?.digest?.startsWith("NEXT_REDIRECT")) {
        throw error; // Re-throw redirect exceptions
      }
      
      const errorMessage = error?.message || "Unknown error";
      
      // User-friendly error messages
      if (errorMessage.includes("Invalid credentials") || errorMessage.includes("Invalid")) {
        return {
          success: false,
          error: "Invalid email or password. Please check your credentials and try again.",
        };
      }
      
      if (errorMessage.includes("OAuth") || errorMessage.includes("Google")) {
        return {
          success: false,
          error: "This account uses Google sign-in. Please sign in with Google.",
        };
      }
      
      return {
        success: false,
        error: "Failed to sign in. Please check your credentials and try again.",
      };
    }
  } catch (error: any) {
    // Check if this is a Next.js redirect (not a real error)
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // Re-throw redirect exceptions
    }
    
    return {
      success: false,
      error: "An error occurred. Please try again.",
    };
  }
}

export async function logoutAction() {
  // Sign out from both systems
  await signOut();
  await nextAuthSignOut({ redirectTo: "/" });
  revalidatePath("/");
  redirect("/");
}

