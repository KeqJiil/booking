import { Toaster } from "@shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">

        <Toaster richColors position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
