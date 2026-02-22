import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Search,
  Plus,
  Home,
  Building2,
  Store,
  LogIn,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

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
    if (profile.role === "admin") return "/admin";
    if (profile.role === "seller") return "/seller/dashboard";
    return "/dashboard";
  };

  const handlePostPropertyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (profile?.role === "seller" || profile?.role === "admin") {
      navigate("/post-property");
    } else {
      toast.warning("You need to be a seller to post property");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl text-primary">
            BookMyCorner
          </Link>

          {/* DESKTOP (780px+) */}
          <div className="hidden [@media(min-width:780px)]:flex items-center gap-6 lg:gap-8 text-[15px] font-medium">
            <Link
              to="/search"
              className="flex items-center gap-1 hover:text-primary"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>

            <Link to="/search?category=buy" className="hover:text-primary">
              Buy
            </Link>

            <Link to="/search?category=rent" className="hover:text-primary">
              Rent
            </Link>

            <Link
              to="/search?category=commercial"
              className="hover:text-primary"
            >
              Commercial
            </Link>

            {/* Post property */}
            <button
              onClick={handlePostPropertyClick}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm"
            >
              <Plus className="h-4 w-4" />
              Post Property
              <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded">
                FREE
              </span>
            </button>

            {/* ⭐ LOGGED IN */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">
                  Hi, {profile?.full_name?.split(" ")[0] || "User"}
                </span>

                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              /* ⭐ LOGGED OUT */
              <button
                onClick={() => navigate("/login")}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md border font-semibold hover:bg-gray-50"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>

          {/* HAMBURGER (<780px) */}
          <button
            className="[@media(min-width:780px)]:hidden"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-black/40">
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-xl p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-xl text-primary">
                BookMyCorner
              </span>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* MENU */}
            <div className="flex flex-col gap-5 text-[16px] font-medium">
              <Link
                to="/search"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <Search className="h-5 w-5" />
                Search
              </Link>

              <Link
                to="/search?category=buy"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <Home className="h-5 w-5" />
                Buy
              </Link>

              <Link
                to="/search?category=rent"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <Building2 className="h-5 w-5" />
                Rent
              </Link>

              <Link
                to="/search?category=commercial"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3"
              >
                <Store className="h-5 w-5" />
                Commercial
              </Link>

              {/* Post property */}
              <button
                onClick={() => {
                  handlePostPropertyClick();
                  setIsOpen(false);
                }}
                className="cursor-pointer mt-2 w-full py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Post Property FREE
              </button>

              {/* ⭐ LOGGED IN */}
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsOpen(false)}
                    className="cursor-pointer flex items-center gap-3"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 text-red-500"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                /* ⭐ LOGGED OUT */
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
