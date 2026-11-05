import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, LogIn, LogOut, MapPin } from "lucide-react";
import { useClerk, useUser } from "@clerk/react";

export function TopNav() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user, isSignedIn } = useUser();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <header className="site-nav sticky top-0 z-50 w-full border-b bg-background/75 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link href="/" data-testid="link-home" className="group flex items-center gap-2.5">
          <span className="logo-mark flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <img src={`${basePath}/logo.svg`} alt="" className="h-7 w-7 rounded-lg" />
          </span>
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">Trav<span className="text-primary">-World</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            href="/services" 
            data-testid="link-explore-services"
            className={`text-sm font-medium transition-colors hover:text-primary ${location === '/services' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Explore Services
          </Link>
          <Link 
            href="/bookings" 
            data-testid="link-my-bookings"
            className={`text-sm font-medium transition-colors hover:text-primary ${location === '/bookings' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Booking activity
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/bookings" data-testid="link-bookings-cta">
            <Button variant="outline" size="sm" className="hidden md:flex gap-2 nav-cta">
              <Calendar className="h-4 w-4" />
              <span>Bookings</span>
            </Button>
          </Link>
          {isSignedIn && user && (
            <span className="hidden md:inline text-sm text-muted-foreground">
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
          )}
          {isSignedIn ? (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              title="Log out"
              data-testid="button-logout"
              onClick={() => signOut({ redirectUrl: `${basePath}/sign-in` })}
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Log out</span>
            </Button>
          ) : (
            <Link href="/sign-in" data-testid="link-author-sign-in">
              <Button size="sm" className="gap-2">
                <LogIn className="h-4 w-4" />
                Author sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
