///instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('🚀 Server instrumentation initialized');
    
    // Initialize database connection pool if needed
    // Load environment variables
    // Setup monitoring, logging, etc.
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    console.log('⚡ Edge instrumentation initialized');
  }
}

export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Headers;
  }
) => {
  // Log errors globally
  console.error('Request error:', {
    error: err.message,
    stack: err.stack,
    path: request.path,
    method: request.method,
  });
};