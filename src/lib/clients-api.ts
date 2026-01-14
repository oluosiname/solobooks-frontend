/**
 * Clients API Client
 *
 * Handles all client-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface Address {
  id?: number;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  full_address?: string;
}

export interface ClientData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  business_name: string;
  business_tax_id: string;
  vat_number: string;
  display_name: string;
  full_address: string;
  vat_strategy: string;
  address: Address;
}

export interface ClientListResponse {
  data: ClientData[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export interface ClientResponse {
  data: ClientData;
}

export interface CreateClientRequest {
  client: {
    name: string;
    email: string;
  };
}

export interface UpdateClientRequest {
  client: {
    name?: string;
    email?: string;
    phone_number?: string;
    business_name?: string;
    business_tax_id?: string;
    vat_number?: string;
    vat_strategy?: string;
    address?: {
      street_address?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

// ============================================
// API Client
// ============================================

class ClientsApiClient extends BaseApiClient {
  /**
   * List all clients
   * GET /api/v1/clients
   */
  async listClients(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ClientListResponse> {
    return this.get<ClientListResponse>("/api/v1/clients", params);
  }

  /**
   * Create a client
   * POST /api/v1/clients
   */
  async createClient(data: CreateClientRequest): Promise<ClientResponse> {
    return this.post<ClientResponse>("/api/v1/clients", data);
  }

  /**
   * Get a client
   * GET /api/v1/clients/{id}
   */
  async getClient(id: string | number): Promise<ClientResponse> {
    return this.get<ClientResponse>(`/api/v1/clients/${id}`);
  }

  /**
   * Update a client
   * PUT /api/v1/clients/{id}
   */
  async updateClient(
    id: string | number,
    data: UpdateClientRequest
  ): Promise<ClientResponse> {
    return this.put<ClientResponse>(`/api/v1/clients/${id}`, data);
  }

  /**
   * Delete a client
   * DELETE /api/v1/clients/{id}
   */
  async deleteClient(id: string | number): Promise<void> {
    return this.delete<void>(`/api/v1/clients/${id}`);
  }
}

export const clientsApi = new ClientsApiClient();
