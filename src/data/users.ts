import type { User } from "@/types";

export const mockUser: User = {
  id: "user-1",
  name: "Niklas Braun",
  email: "niklas@braunsons.com",
  businessName: "Braun and Sons",
  phone: "+49 30 12345678",
  address: "Hauptstraße 123, 10115 Berlin, Germany",
  taxId: "DE123456789",
  vatNumber: "DE123456789",
  language: "en",
  currency: "EUR",
  createdAt: "2024-01-15T10:30:00Z",
};

export const users: User[] = [mockUser];
