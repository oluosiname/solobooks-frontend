import type { Profile } from "@/types";

export const mockUser: Profile = {
  id: "user-1",
  fullName: "Niklas Braun",
  businessName: "Braun and Sons",
  phoneNumber: "+49 30 12345678",
  address: {
    streetAddress: "Hauptstraße 123",
    city: "Berlin",
    state: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  taxNumber: "DE123456789",
  createdAt: "2024-01-15T10:30:00Z",
};

export const users: Profile[] = [mockUser];
