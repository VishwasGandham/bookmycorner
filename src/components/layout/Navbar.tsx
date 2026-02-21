import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Search, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!profile?.role) return "/dashboard";
    switch (profile.role) {
      case "admin":
        return "/admin";
      case "seller":
        return "/seller/dashboard";
      default:
        return "/dashboard";
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link
          to="/"
          className="flex items-center space-x-2 font-bold text-xl text-primary"
        >
          <span className="text-2xl"></span>
          <span>BookMyCorner</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/search"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Search className="h-4 w-4" /> Search
          </Link>
          <Link
            to="/post-property"
            className="flex items-center gap-1 transition-colors hover:text-primary"
          >
            <Plus className="h-4 w-4" /> Sell Plot
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">
                Hi, {profile?.full_name?.split(" ")[0] || "User"}
                {profile?.role && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                    {profile.role}
                  </span>
                )}
              </span>
              <Link
                to={getDashboardLink()}
                className="flex items-center space-x-1 transition-colors hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background">
          <div className="flex flex-col space-y-4 px-4 py-6 text-center">
            <Link
              to="/search"
              onClick={() => setIsOpen(false)}
              className="hover:text-primary flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" /> Search Properties
            </Link>
            <Link
              to="/post-property"
              onClick={() => setIsOpen(false)}
              className="hover:text-primary flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Sell Plot
            </Link>

            {user ? (
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground pb-2">
                  Signed in as {profile?.full_name}
                  {profile?.role && (
                    <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary capitalize">
                      {profile.role}
                    </span>
                  )}
                </div>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 rounded-md bg-secondary hover:bg-secondary/80"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 rounded-md border border-border hover:bg-muted"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 rounded-md bg-secondary"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2 rounded-md bg-primary text-primary-foreground"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
