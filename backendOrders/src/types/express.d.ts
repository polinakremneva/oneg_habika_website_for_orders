declare global {
  namespace Express {
    interface Request {
      userId?: string; // Making it optional with '?' to match Express types
    }
  }
}

// Need this to make it a module
export {};
