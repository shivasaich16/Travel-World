import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, servicesTable } from "@workspace/db";
import {
  ListCategoriesResponse,
  ListLocationsResponse,
  ListServicesQueryParams,
  ListServicesResponse,
  ListFeaturedServicesResponse,
  GetServiceParams,
  GetServiceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function toServiceResponse(service: typeof servicesTable.$inferSelect) {
  return { ...service, id: String(service.id), price: Number(service.price), rating: Number(service.rating) };
}

const CATEGORIES = [
  { slug: "hotels", name: "Hotels & Stays", description: "Rooms and homestays across India", icon: "hotel" },
  { slug: "doctors", name: "Doctors & Clinics", description: "Book appointments with trusted doctors", icon: "stethoscope" },
  { slug: "restaurants", name: "Restaurants", description: "Reserve tables at top restaurants", icon: "utensils" },
  { slug: "salons", name: "Salons & Spas", description: "Grooming, spa and salon appointments", icon: "scissors" },
  { slug: "cinema", name: "Cinema", description: "Movie tickets at cinemas near you", icon: "film" },
  { slug: "transport", name: "Transport", description: "Cabs, buses and intercity transport", icon: "car" },
] as const;

const LOCATIONS = [
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Goa", state: "Goa" },
];

router.get("/categories", (_req, res): void => {
  res.json(ListCategoriesResponse.parse(CATEGORIES));
});

router.get("/locations", (_req, res): void => {
  res.json(ListLocationsResponse.parse(LOCATIONS));
});

router.get("/services/featured", async (_req, res): Promise<void> => {
  const services = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.trending, true))
    .orderBy(desc(servicesTable.rating))
    .limit(6);

  res.json(ListFeaturedServicesResponse.parse(services.map(toServiceResponse)));
});

router.get("/services", async (req, res): Promise<void> => {
  const parsed = ListServicesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, city, search } = parsed.data;
  const conditions = [];
  if (category) conditions.push(eq(servicesTable.category, category));
  if (city) conditions.push(eq(servicesTable.city, city));
  if (search) {
    conditions.push(
      or(ilike(servicesTable.name, `%${search}%`), ilike(servicesTable.description, `%${search}%`)),
    );
  }

  const services = await db
    .select()
    .from(servicesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(servicesTable.rating));

  res.json(ListServicesResponse.parse(services.map(toServiceResponse)));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, Number(params.data.id)));

  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(GetServiceResponse.parse(toServiceResponse(service)));
});

export default router;
