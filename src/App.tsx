import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Debug app initialization
  useEffect(() => {
    try {
      console.log('✅ App component mounted successfully');
      console.log('🌍 URL:', window.location.href);
      console.log('📱 User Agent:', navigator.userAgent);
    } catch (error) {
      console.error('❌ App initialization error:', error);
    }
  }, []);

  console.log('🔄 App component rendering...');

  try {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('❌ App render error:', error);
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1a1a1a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>❌ Application Error</h1>
          <p>Failed to load USDT NOW FLASHER</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default App;
