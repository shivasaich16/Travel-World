import { Link } from "wouter";
import { useListFeaturedServices, useListCategories, useListLocations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, ArrowRight, ArrowUpRight, CarFront, Clapperboard, Clock3, Hotel, ShieldCheck, Sparkles, Stethoscope, Utensils } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  hotels: Hotel,
  doctors: Stethoscope,
  restaurants: Utensils,
  salons: Sparkles,
  cinema: Clapperboard,
  transport: CarFront,
};

export function Home() {
  const [, navigate] = useLocation();
  const { data: featuredServices, isLoading: loadingFeatured } = useListFeaturedServices();
  const { data: categories, isLoading: loadingCategories } = useListCategories();
  const { data: locations, isLoading: loadingLocations } = useListLocations();

  const [searchCity, setSearchCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity && searchCity !== "all") params.append("city", searchCity);
    if (searchQuery) params.append("search", searchQuery);
    navigate(`/services?${params.toString()}`);
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[80vh] flex items-center justify-center pt-20 pb-32 overflow-hidden">
        <div className="hero-grid absolute inset-0 z-0" />
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="route-orbit route-orbit-one">
          <span className="route-node route-node-one" />
          <span className="route-node route-node-two" />
        </div>
        <div className="route-orbit route-orbit-two">
          <span className="route-node route-node-three" />
        </div>
        <div className="theme-card theme-card-hotel">
          <Hotel className="h-5 w-5 text-primary" />
          <span><strong>Hotel stays</strong><small>Made memorable</small></span>
        </div>
        <div className="theme-card theme-card-cinema">
          <Clapperboard className="h-5 w-5 text-accent-foreground" />
          <span><strong>Movie nights</strong><small>Front-row moments</small></span>
        </div>
        <div className="theme-card theme-card-doctor">
          <Stethoscope className="h-5 w-5 text-primary" />
          <span><strong>Doctor visits</strong><small>Care, on time</small></span>
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/10 via-background/20 to-background" />
        <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />

        <div className="absolute left-[8%] top-[26%] z-10 hidden items-center gap-3 rounded-full border border-white/60 bg-background/65 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md md:flex animate-float-slow">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="h-3.5 w-3.5" />
          </span>
          9 cities, one trusted place
        </div>
        <div className="absolute right-[9%] top-[36%] z-10 hidden items-center gap-3 rounded-full border border-white/60 bg-background/65 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-md md:flex animate-float">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-accent-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          Verified experiences
        </div>
        
        <div className="container relative z-20 px-4 md:px-8 flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
          <div className="eyebrow-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Premium experiences in India
          </div>
          
          <h1 data-testid="text-home-headline" className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Your next <span className="headline-gradient italic">great day</span> starts here.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            Discover trusted hotels, dining, doctors, salons, cinema and rides across India — then book the moment in a few simple taps.
          </p>

          <div className="search-shell w-full max-w-3xl mt-8 p-3 bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  data-testid="input-home-search"
                  placeholder="What are you looking for?" 
                  className="pl-10 h-14 bg-background border-none text-base focus-visible:ring-1 shadow-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64 relative border-t md:border-t-0 md:border-l border-border/50">
                <Select value={searchCity} onValueChange={setSearchCity}>
                  <SelectTrigger className="h-14 border-none bg-background shadow-none text-base focus:ring-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <SelectValue placeholder="Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All India</SelectItem>
                    {locations?.map(loc => (
                      <SelectItem key={loc.city} value={loc.city}>{loc.city}, {loc.state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl text-base w-full md:w-auto">
                <span>Find an experience</span>
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure checkout</span>
            <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-primary" /> Instant confirmation</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-accent text-accent" /> Loved across India</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-reveal py-24 bg-background">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Make time for what matters</h2>
              <p className="text-muted-foreground text-lg">Explore our curated selection of services</p>
            </div>
            <Button variant="ghost" asChild className="group">
              <Link href="/services">
                View all services <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {loadingCategories ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))
            ) : (
              categories?.map(category => (
                <Link 
                  key={category.slug} 
                  href={`/services?category=${category.slug}`}
                    data-testid={`link-category-${category.slug}`}
                    className="category-tile group flex flex-col items-center justify-center p-6 bg-secondary/50 border border-border/50 rounded-2xl hover:bg-primary hover:border-primary transition-all duration-300 hover:shadow-lg hover-elevate"
                >
                  <div className="category-icon h-16 w-16 mb-4 rounded-full bg-background flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                    {(() => {
                      const Icon = categoryIcons[category.slug] ?? Star;
                      return <Icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />;
                    })()}
                  </div>
                  <h3 className="font-medium text-center group-hover:text-primary-foreground transition-colors">{category.name}</h3>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="section-reveal py-24 bg-secondary/30">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Trending Experiences</h2>
            <p className="text-muted-foreground text-lg">Highly rated by our discerning community</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingFeatured ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full rounded-2xl" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : (
              featuredServices?.map(service => (
                  <Link key={service.id} href={`/services/${service.id}`} data-testid={`link-featured-service-${service.id}`} className="service-card group block">
                  <div className="relative aspect-[4/3] mb-6 overflow-hidden rounded-2xl bg-muted">
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({service.reviewCount})</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-1">{service.name}</h3>
                      <p className="font-serif text-lg font-semibold whitespace-nowrap ml-4">₹{service.price}</p>
                    </div>
                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                      <span className="bg-secondary px-2 py-0.5 rounded text-xs font-medium text-secondary-foreground">
                        {service.categoryLabel}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {service.city}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
