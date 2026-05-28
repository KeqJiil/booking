import { Toaster } from "@/shared/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router } from "./providers/routerConfig";
import { RouterProvider } from "react-router-dom";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Toaster richColors position="top-right" />
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
