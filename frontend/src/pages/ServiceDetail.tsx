import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useGetService, useCreateBooking, useGetBookingAccess } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Star, CreditCard, Smartphone, Banknote, AlertTriangle } from "lucide-react";

type PaymentMethod = "card" | "upi" | "offline";

export function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: service, isLoading } = useGetService(id ?? "");
  const { data: bookingAccess } = useGetBookingAccess();
  const createBooking = useCreateBooking();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [showOfflineConfirm, setShowOfflineConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-12 grid md:grid-cols-2 gap-12">
        <Skeleton className="h-96 rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-lg text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const isFormValid = customerName.trim() && phone.trim() && date && time;

  function submitBooking() {
    createBooking.mutate(
      {
        data: {
          serviceId: service!.id,
          customerName,
          phone,
          email: email || undefined,
          date,
          time,
          guests,
          notes: notes || undefined,
          paymentMethod,
        },
      },
      {
        onSuccess: (booking) => {
          toast({
            title: paymentMethod === "offline" ? "Booking reserved" : "Booking confirmed",
            description:
              paymentMethod === "offline"
                ? "Please pay in cash when you visit the store."
                : "Your payment was processed and the booking is confirmed.",
          });
          navigate(`/bookings/${booking.id}`);
        },
        onError: () => {
          toast({
            title: "Something went wrong",
            description: "We couldn't complete your booking. Please try again.",
            variant: "destructive",
          });
        },
      },
    );
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    if (paymentMethod === "offline") {
      setShowOfflineConfirm(true);
      return;
    }

    submitBooking();
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
            <img src={service.imageUrl} alt={service.name} className="object-cover w-full h-full" />
          </div>
          <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium text-secondary-foreground">
            {service.categoryLabel}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mt-4 mb-2" data-testid="text-service-name">
            {service.name}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {service.rating.toFixed(1)} ({service.reviewCount} reviews)
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {service.address}, {service.city}, {service.state}
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>
          <p className="font-serif text-2xl font-semibold">₹{service.price}</p>
        </div>

        {bookingAccess?.isAuthor ? (
        <div className="bg-secondary/40 border border-border/50 rounded-2xl p-6 md:p-8 self-start">
          <h2 className="font-serif text-2xl font-bold mb-6">Reserve your spot</h2>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="customerName">Full name</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  data-testid="input-customer-name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required data-testid="input-phone" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="input-email" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required data-testid="input-date" />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required data-testid="input-time" />
              </div>
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="guests">Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  data-testid="input-guests"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-notes" />
            </div>

            <div className="space-y-2 pt-2">
              <Label>Payment method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="grid grid-cols-1 gap-2"
              >
                <label
                  htmlFor="pm-card"
                  className="flex items-center gap-3 border border-border/60 rounded-lg p-3 cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value="card" id="pm-card" data-testid="radio-payment-card" />
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Card</span>
                </label>
                <label
                  htmlFor="pm-upi"
                  className="flex items-center gap-3 border border-border/60 rounded-lg p-3 cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value="upi" id="pm-upi" data-testid="radio-payment-upi" />
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">UPI</span>
                </label>
                <label
                  htmlFor="pm-offline"
                  className="flex items-center gap-3 border border-border/60 rounded-lg p-3 cursor-pointer hover-elevate"
                >
                  <RadioGroupItem value="offline" id="pm-offline" data-testid="radio-payment-offline" />
                  <Banknote className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pay at store (offline)</span>
                </label>
              </RadioGroup>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-4"
              disabled={!isFormValid || createBooking.isPending}
              data-testid="button-confirm-booking"
            >
              {createBooking.isPending ? "Booking..." : `Confirm booking · ₹${service.price}`}
            </Button>
          </form>
        </div>
        ) : (
          <aside className="rounded-2xl border border-border/60 bg-secondary/35 p-6 md:p-8 self-start">
            <h2 className="font-serif text-2xl font-bold mb-3">Explore this experience</h2>
            <p className="text-muted-foreground leading-relaxed">
              Trav-World is currently in public, view-only mode. Booking records and changes are reserved for the verified author account.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              You can browse the full catalog without signing in. Author booking tools are available after the owner account is configured.
            </p>
          </aside>
        )}
      </div>

      <AlertDialog open={showOfflineConfirm} onOpenChange={setShowOfflineConfirm}>
        <AlertDialogContent data-testid="dialog-offline-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Pay at store
            </AlertDialogTitle>
            <AlertDialogDescription>
              You've chosen to pay offline. If you visit the store, payment will be collected in cash at that
              time — no online payment will be taken now. Do you want to proceed with this booking?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-offline">Cancel</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-confirm-offline"
              onClick={() => {
                setShowOfflineConfirm(false);
                submitBooking();
              }}
            >
              Yes, proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
