import { Link } from "wouter";
import { useMemo, useState } from "react";
import {
  getListBookingsQueryKey,
  useGetBookingAccess,
  useGetPublicBookingHistory,
  useListBookings,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownUp,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Home,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  Timer,
  XCircle,
} from "lucide-react";

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  confirmed: "default",
  pending_at_store: "secondary",
  cancelled: "destructive",
};

const statusLabel: Record<string, string> = {
  confirmed: "Confirmed",
  pending_at_store: "Pay at store",
  cancelled: "Cancelled",
};

export function Bookings() {
  const { data: access, isLoading: accessLoading } = useGetBookingAccess();
  const { data: publicHistory, isLoading: historyLoading } = useGetPublicBookingHistory();
  const isAuthor = access?.isAuthor === true;
  const { data: bookings, isLoading } = useListBookings({
    query: {
      enabled: isAuthor,
      queryKey: getListBookingsQueryKey(),
    },
  });
  const [view, setView] = useState<"all" | "upcoming" | "history">("all");
  const [status, setStatus] = useState<"all" | "confirmed" | "pending_at_store" | "cancelled">("all");
  const [sort, setSort] = useState<"latest" | "earliest" | "amount">("latest");

  const visibleBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    let items = [...(bookings ?? [])];
    if (view === "upcoming") items = items.filter((booking) => booking.status !== "cancelled" && booking.date >= today);
    if (view === "history") items = items.filter((booking) => booking.status === "cancelled" || booking.date < today);
    if (status !== "all") items = items.filter((booking) => booking.status === status);
    return items.sort((a, b) => {
      if (sort === "amount") return b.amount - a.amount;
      const left = sort === "latest" ? `${b.date} ${b.time}` : `${a.date} ${a.time}`;
      const right = sort === "latest" ? `${a.date} ${a.time}` : `${b.date} ${b.time}`;
      return left.localeCompare(right);
    });
  }, [bookings, sort, status, view]);

  if (accessLoading) {
    return (
      <div className="container mx-auto max-w-5xl space-y-4 px-4 py-12 md:px-8">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-52 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthor) {
    const statusCounts = ["confirmed", "pending_at_store", "cancelled"].map((key) => ({
      key,
      label: statusLabel[key],
      count: publicHistory?.byStatus.find((item) => item.status === key)?.count ?? 0,
    }));

    return (
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-8">
        <div className="mb-8">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Public overview
          </p>
          <h1 className="font-serif text-4xl font-bold mb-2">Booking activity</h1>
          <p className="text-muted-foreground text-lg">An anonymized overview of Trav-World activity. No names, contact details, patient IDs, or appointment records are shown.</p>
        </div>

        {historyLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Anonymized booking totals">
              <div className="public-history-stat">
                <span>Total bookings</span><strong>{publicHistory?.totalBookings ?? 0}</strong>
              </div>
              {statusCounts.map((item) => (
                <div className="public-history-stat" key={item.key}>
                  <span>{item.label}</span><strong>{item.count}</strong>
                </div>
              ))}
            </section>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <section className="public-history-panel">
                <h2 className="font-serif text-xl font-bold">Activity by month</h2>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">Monthly totals only; no individual appointment dates.</p>
                {publicHistory?.byMonth.length ? (
                  <ul className="divide-y divide-border/60">
                    {publicHistory.byMonth.map((item) => (
                      <li key={item.month} className="flex items-center justify-between py-3 text-sm">
                        <span>{new Date(`${item.month}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
                        <strong>{item.count}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p className="py-5 text-sm text-muted-foreground">No booking activity yet.</p>}
              </section>
              <section className="public-history-panel">
                <h2 className="font-serif text-xl font-bold">Popular categories</h2>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">Aggregate counts across the whole site.</p>
                {publicHistory?.byCategory.length ? (
                  <ul className="divide-y divide-border/60">
                    {publicHistory.byCategory.map((item) => (
                      <li key={item.category} className="flex items-center justify-between py-3 text-sm">
                        <span>{item.category}</span>
                        <strong>{item.count}</strong>
                      </li>
                    ))}
                  </ul>
                ) : <p className="py-5 text-sm text-muted-foreground">No category activity yet.</p>}
              </section>
            </div>
            <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/60 bg-secondary/35 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold">Private booking records</h2>
                <p className="mt-1 text-sm text-muted-foreground">Identifiable appointments and booking management are restricted to the verified Trav-World author.</p>
              </div>
              <Link href="/sign-in" data-testid="link-author-sign-in-bookings">
                <Button variant="outline">Author sign in</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-5xl">
      <div className="mb-10">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Author workspace
        </p>
        <h1 className="font-serif text-4xl font-bold mb-2">Booking records</h1>
        <p className="text-muted-foreground text-lg">Private customer and appointment details, visible only to the verified author.</p>
      </div>

      <div className="booking-status-bar mb-8 rounded-2xl border border-border/60 bg-secondary/35 p-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Link href="/" className="booking-tab" data-testid="link-bookings-home">
            <Home className="h-4 w-4" /> Home
          </Link>
          <button type="button" className={`booking-tab ${view === "all" ? "booking-tab-active" : ""}`} onClick={() => setView("all")} data-testid="button-bookings-all">
            <Calendar className="h-4 w-4" /> Bookings <span>{bookings?.length ?? 0}</span>
          </button>
          <button type="button" className={`booking-tab ${view === "upcoming" ? "booking-tab-active" : ""}`} onClick={() => { setView("upcoming"); setSort("earliest"); }} data-testid="button-bookings-timings">
            <Timer className="h-4 w-4" /> Timings
          </button>
          <button type="button" className={`booking-tab ${view === "history" ? "booking-tab-active" : ""}`} onClick={() => setView("history")} data-testid="button-bookings-history">
            <History className="h-4 w-4" /> Past history
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Filter bookings
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all" as const, label: "All", icon: Calendar },
            { value: "confirmed" as const, label: "Confirmed", icon: CheckCircle2 },
            { value: "pending_at_store" as const, label: "Pay at store", icon: Clock },
            { value: "cancelled" as const, label: "Cancelled", icon: XCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Button key={item.value} type="button" size="sm" variant={status === item.value ? "default" : "outline"} onClick={() => setStatus(item.value)} data-testid={`button-booking-filter-${item.value}`}>
                <Icon className="mr-1.5 h-3.5 w-3.5" />{item.label}
              </Button>
            );
          })}
          <Button type="button" size="sm" variant="outline" onClick={() => setSort(sort === "latest" ? "earliest" : sort === "earliest" ? "amount" : "latest")} data-testid="button-sort-bookings">
            <ArrowDownUp className="mr-1.5 h-3.5 w-3.5" /> {sort === "latest" ? "Latest" : sort === "earliest" ? "Earliest" : "Highest value"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)}
        {!isLoading && visibleBookings.length === 0 && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">{bookings?.length ? "No bookings match this view." : "There are no booking records yet."}</p>
            <Link href="/services" className="text-primary font-medium underline mt-2 inline-block">View public catalog</Link>
          </div>
        )}
        {visibleBookings.map((booking) => (
          <Link key={booking.id} href={`/bookings/${booking.id}`} className="booking-card block border border-border/50 rounded-2xl p-5 bg-secondary/30 hover-elevate" data-testid={`link-booking-${booking.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{booking.service.name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{booking.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.time}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{booking.service.city}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Appointment <strong className="text-foreground">{booking.appointmentId}</strong></span>
                  {booking.doctorId && <span>Doctor <strong className="text-foreground">{booking.doctorId}</strong></span>}
                  {booking.doctorRoomNo && <span>{booking.doctorRoomNo}</span>}
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge variant={statusVariant[booking.status]}>{statusLabel[booking.status]}</Badge>
                <p className="font-serif font-semibold">₹{booking.amount}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
