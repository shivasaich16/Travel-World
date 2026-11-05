import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { servicesTable } from "./services";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  serviceId: integer("service_id")
    .notNull()
    .references(() => servicesTable.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  guests: integer("guests").notNull().default(1),
  notes: text("notes"),
  paymentMethod: text("payment_method", { enum: ["card", "upi", "offline"] }).notNull(),
  status: text("status", { enum: ["confirmed", "pending_at_store", "cancelled"] })
    .notNull()
    .default("confirmed"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
