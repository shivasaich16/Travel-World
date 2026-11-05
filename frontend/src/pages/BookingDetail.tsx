import { useParams, useLocation, Link } from "wouter";
import { getGetBookingQueryKey, useGetBooking, useCancelBooking, useGetBookingAccess } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Clock, Users, CreditCard, Smartphone, Banknote, ArrowLeft, ClipboardCheck, DoorOpen, IdCard, Stethoscope } from "lucide-react";

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

const paymentIcon: Record<string, typeof CreditCard> = {
  card: CreditCard,
  upi: Smartphone,
  offline: Banknote,
};

const paymentLabel: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  offline: "Pay at store (offline)",
};

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: access, isLoading: accessLoading } = useGetBookingAccess();
  const isAuthor = access?.isAuthor === true;
  const { data: booking, isLoading } = useGetBooking(id ?? "", {
    query: { enabled: isAuthor && !!id, queryKey: getGetBookingQueryKey(id ?? "") },
  });
  const cancelBooking = useCancelBooking();

  if (accessLoading || (isAuthor && isLoading)) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!isAuthor) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-2xl text-center">
        <p className="text-lg font-semibold">Appointment details are private</p>
        <p className="mt-2 text-muted-foreground">Only the verified Trav-World author can view personal booking details.</p>
        <Link href="/bookings" className="mt-5 inline-block text-primary font-medium underline">View public booking overview</Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-lg text-muted-foreground">Booking not found.</p>
      </div>
    );
  }

  const PaymentIcon = paymentIcon[booking.paymentMethod];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 max-w-2xl">
      <Link href="/bookings" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-primary">
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      <div className="border border-border/50 rounded-2xl overflow-hidden bg-secondary/30">
        <div className="relative aspect-[16/7]">
          <img src={booking.service.imageUrl} alt={booking.service.name} className="object-cover w-full h-full" />
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1" data-testid="text-booking-service">
                {booking.service.name}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {booking.service.address}, {booking.service.city}
              </p>
            </div>
            <Badge variant={statusVariant[booking.status]} data-testid="badge-booking-status">
              {statusLabel[booking.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{booking.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>{booking.guests} guest(s)</span>
            </div>
            <div className="flex items-center gap-2">
              <PaymentIcon className="h-4 w-4 text-primary" />
              <span>{paymentLabel[booking.paymentMethod]}</span>
            </div>
          </div>

          <div className="booking-detail-grid rounded-xl border border-border/60 bg-background/75 p-4">
            <div><span className="detail-label"><ClipboardCheck className="h-3.5 w-3.5" /> Appointment ID</span><strong>{booking.appointmentId}</strong></div>
            <div><span className="detail-label"><IdCard className="h-3.5 w-3.5" /> Patient ID</span><strong>{booking.patientId}</strong></div>
            {booking.doctorId && <div><span className="detail-label"><Stethoscope className="h-3.5 w-3.5" /> Doctor ID</span><strong>{booking.doctorId}</strong></div>}
            {booking.doctorRoomNo && <div><span className="detail-label"><DoorOpen className="h-3.5 w-3.5" /> Doctor room</span><strong>{booking.doctorRoomNo}</strong></div>}
          </div>

          {booking.paymentMethod === "offline" && booking.status === "pending_at_store" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
              Payment for this booking will be collected in cash when you visit the store.
            </div>
          )}

          {booking.notes && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Notes: </span>
              {booking.notes}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div>
              <p className="text-sm text-muted-foreground">Booked by</p>
              <p className="font-medium">{booking.customerName}</p>
              <p className="text-sm text-muted-foreground">{booking.phone}</p>
            </div>
            <p className="font-serif text-2xl font-semibold">₹{booking.amount}</p>
          </div>

          {booking.status !== "cancelled" && (
            <Button
              variant="destructive"
              className="w-full"
              disabled={cancelBooking.isPending}
              data-testid="button-cancel-booking"
              onClick={() =>
                cancelBooking.mutate(
                  { id: booking.id },
                  {
                    onSuccess: () => {
                      toast({ title: "Booking cancelled" });
                      navigate("/bookings");
                    },
                  },
                )
              }
            >
              {cancelBooking.isPending ? "Cancelling..." : "Cancel booking"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
