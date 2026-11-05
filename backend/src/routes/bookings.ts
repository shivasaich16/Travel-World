import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, servicesTable, bookingsTable } from "@workspace/db";
import {
  ListBookingsResponse,
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingParams,
  GetBookingResponse,
  CancelBookingParams,
  CancelBookingResponse,
  GetBookingsSummaryResponse,
  GetPublicBookingHistoryResponse,
  GetBookingAccessResponse,
} from "@workspace/api-zod";
import { isTravWorldAuthor, requireTravWorldAuthor } from "../middlewares/requireTravWorldAuthor";

const router: IRouter = Router();

async function toBookingResponse(booking: typeof bookingsTable.$inferSelect) {
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, booking.serviceId));
  const bookingId = String(booking.id);
  const isDoctorBooking = service?.category === "doctors";
  return {
    ...booking,
    id: bookingId,
    appointmentId: `APT-${bookingId.padStart(6, "0")}`,
    patientId: `PAT-${bookingId.padStart(6, "0")}`,
    doctorId: isDoctorBooking ? `DOC-${String(booking.serviceId).padStart(4, "0")}` : undefined,
    doctorRoomNo: isDoctorBooking ? `Room ${String((booking.serviceId % 12) + 1).padStart(2, "0")}` : undefined,
    amount: Number(booking.amount),
    createdAt: booking.createdAt.toISOString(),
    email: booking.email ?? undefined,
    notes: booking.notes ?? undefined,
    service: service
      ? { ...service, id: String(service.id), price: Number(service.price), rating: Number(service.rating) }
      : service,
  };
}

router.get("/bookings/access", async (req, res): Promise<void> => {
  res.json(GetBookingAccessResponse.parse({ isAuthor: await isTravWorldAuthor(req) }));
});

router.get("/bookings/public-history", async (_req, res): Promise<void> => {
  const [totals, months, categories, statuses] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(bookingsTable),
    db
      .select({
        month: sql<string>`to_char(${bookingsTable.createdAt}, 'YYYY-MM')`,
        count: sql<number>`count(*)::int`,
      })
      .from(bookingsTable)
      .groupBy(sql`to_char(${bookingsTable.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${bookingsTable.createdAt}, 'YYYY-MM') DESC`)
      .limit(12),
    db
      .select({
        category: servicesTable.categoryLabel,
        count: sql<number>`count(*)::int`,
      })
      .from(bookingsTable)
      .innerJoin(servicesTable, eq(bookingsTable.serviceId, servicesTable.id))
      .groupBy(servicesTable.categoryLabel)
      .orderBy(sql`count(*) DESC`),
    db
      .select({
        status: bookingsTable.status,
        count: sql<number>`count(*)::int`,
      })
      .from(bookingsTable)
      .groupBy(bookingsTable.status),
  ]);

  const history = {
    totalBookings: Number(totals[0]?.count ?? 0),
    byMonth: months.reverse(),
    byCategory: categories,
    byStatus: statuses,
  };
  res.json(GetPublicBookingHistoryResponse.parse(history));
});

router.get("/bookings", requireTravWorldAuthor, async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  const withServices = await Promise.all(bookings.map(toBookingResponse));
  res.json(ListBookingsResponse.parse(withServices));
});

router.get("/bookings/summary", async (_req, res): Promise<void> => {
  const bookings = await db.select().from(bookingsTable);

  const summary = {
    totalBookings: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    pendingAtStore: bookings.filter((b) => b.status === "pending_at_store").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    byPaymentMethod: {
      card: bookings.filter((b) => b.paymentMethod === "card").length,
      upi: bookings.filter((b) => b.paymentMethod === "upi").length,
      offline: bookings.filter((b) => b.paymentMethod === "offline").length,
    },
  };

  res.json(GetBookingsSummaryResponse.parse(summary));
});

router.post("/bookings", requireTravWorldAuthor, async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { serviceId, paymentMethod, date, ...rest } = parsed.data;

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, Number(serviceId)));
  if (!service) {
    res.status(400).json({ error: "Service not found" });
    return;
  }

  const status = paymentMethod === "offline" ? "pending_at_store" : "confirmed";
  const dateString = date instanceof Date ? date.toISOString().split("T")[0] : String(date);

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      ...rest,
      date: dateString,
      serviceId: service.id,
      paymentMethod,
      status,
      amount: service.price,
    })
    .returning();

  res.status(201).json(CreateBookingResponse.parse(await toBookingResponse(booking)));
});

router.get("/bookings/:id", requireTravWorldAuthor, async (req, res): Promise<void> => {
  const params = GetBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(params.data.id)));

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(GetBookingResponse.parse(await toBookingResponse(booking)));
});

router.post("/bookings/:id/cancel", requireTravWorldAuthor, async (req, res): Promise<void> => {
  const params = CancelBookingParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [booking] = await db
    .update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, Number(params.data.id)))
    .returning();

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json(CancelBookingResponse.parse(await toBookingResponse(booking)));
});

export default router;
