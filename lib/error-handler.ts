import { NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export function handleApiError(error: unknown, context?: string): NextResponse {
  if (isProduction) {
    console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);
    
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server. Silakan coba lagi nanti." },
      { status: 500 }
    );
  }

  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);
  
  return NextResponse.json(
    { success: false, error: errorMessage },
    { status: 500 }
  );
}

export function handleValidationError(message: string): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}

export function handleUnauthorized(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function handleForbidden(message: string = "Forbidden"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

export function handleNotFound(message: string = "Resource not found"): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 404 }
  );
}
