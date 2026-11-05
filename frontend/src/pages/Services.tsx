import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useListServices, useListCategories, useListLocations } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDownUp, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";

function useSearchParams() {
  const [location] = useLocation();
  const queryString = location.includes("?") ? location.split("?")[1] : "";
  return new URLSearchParams(queryString);
}

export function Services() {
  const params = useSearchParams();

  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [city, setCity] = useState(params.get("city") ?? "all");
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [sort, setSort] = useState<"rating" | "price-low" | "price-high">("rating");

  const { data: categories } = useListCategories();
  const { data: locations } = useListLocations();
  const { data: services, isLoading } = useListServices({
    category: category !== "all" ? category : undefined,
    city: city !== "all" ? city : undefined,
    search: search || undefined,
  });
  const sortedServices = useMemo(() => {
    const items = [...(services ?? [])];
    if (sort === "price-low") return items.sort((a, b) => a.price - b.price);
    if (sort === "price-high") return items.sort((a, b) => b.price - a.price);
    return items.sort((a, b) => b.rating - a.rating);
  }, [services, sort]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold mb-2">Explore Services</h1>
        <p className="text-muted-foreground text-lg">Discover premium experiences across India</p>
      </div>

      <div className="filter-panel flex flex-col gap-4 mb-10 p-4 bg-secondary/40 border border-border/50 rounded-2xl">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Refine your search
        </div>
        <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-56" data-testid="select-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-full md:w-56" data-testid="select-city">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <SelectValue placeholder="Location" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All India</SelectItem>
            {locations?.map((loc) => (
              <SelectItem key={loc.city} value={loc.city}>
                {loc.city}, {loc.state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => setSort(sort === "rating" ? "price-low" : sort === "price-low" ? "price-high" : "rating")}
          data-testid="button-sort-services"
        >
          <ArrowDownUp className="h-4 w-4" />
          {sort === "rating" ? "Top rated" : sort === "price-low" ? "Price: low to high" : "Price: high to low"}
        </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant={category === "all" ? "default" : "outline"} onClick={() => setCategory("all")} data-testid="button-filter-all">
            All services
          </Button>
          {categories?.map((c) => (
            <Button
              key={c.slug}
              type="button"
              size="sm"
              variant={category === c.slug ? "default" : "outline"}
              onClick={() => setCategory(c.slug)}
              data-testid={`button-filter-${c.slug}`}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          : sortedServices.map((service) => (
              <Link key={service.id} href={`/services/${service.id}`} className="group block" data-testid={`link-service-${service.id}`}>
                <div className="relative aspect-[4/3] mb-4 overflow-hidden rounded-2xl bg-muted">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-sm font-medium">{service.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="font-serif font-semibold whitespace-nowrap ml-4">₹{service.price}</p>
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
            ))}
      </div>

      {!isLoading && sortedServices.length === 0 && (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg">No services match your search.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setCategory("all");
              setCity("all");
              setSearch("");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
