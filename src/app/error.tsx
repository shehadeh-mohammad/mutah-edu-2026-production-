'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Global Error caught:', error);

    const errorMessage = error.message?.toLowerCase() || '';
    const errorStack = error.stack?.toLowerCase() || '';
    const errorDigest = error.digest?.toLowerCase() || '';

    const isChunkLoadError =
      errorMessage.includes('chunkloaderror') ||
      errorMessage.includes('loading chunk failed') ||
      errorMessage.includes('failed to fetch dynamically imported module') ||
      errorMessage.includes("type 'css' broken") ||
      errorStack.includes('chunkloaderror') ||
      errorDigest.includes('chunkloaderror');

    if (isChunkLoadError) {
      const now = Date.now();
      const lastReloadTime = sessionStorage.getItem('last_chunk_reload_time');
      const timeSinceLastReload = lastReloadTime ? now - parseInt(lastReloadTime, 10) : Infinity;

      if (timeSinceLastReload > 10000) {
        sessionStorage.setItem('last_chunk_reload_time', now.toString());
        console.warn('ChunkLoadError detected. Initiating immediate page reload to fetch latest bundles.');
        window.location.reload();
      } else {
        console.warn('ChunkLoadError detected, but skipping reload to avoid infinite loop. Please try again manually.');
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans text-gray-100">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-3 text-white">Something went wrong!</h2>
        <p className="text-gray-400 mb-6 text-sm">
          We encountered an unexpected error. The application might be updating or experiencing temporary issues.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-900/20"
          >
            Reload Page
          </button>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/5"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
