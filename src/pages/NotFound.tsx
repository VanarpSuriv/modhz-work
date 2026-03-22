import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
        <div className="text-center space-y-6">
          <div className="text-8xl font-bold gradient-text">404</div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground max-w-md">
            The page <code className="px-2 py-1 bg-secondary rounded text-primary">{location.pathname}</code> doesn't exist.
          </p>
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotFound;
