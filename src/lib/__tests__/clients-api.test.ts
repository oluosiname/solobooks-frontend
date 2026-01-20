/**
 * Tests for Clients API Client
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clientsApi } from '../clients-api';
import type { ClientListResponse, ClientResponse } from '../clients-api';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Clients API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('listClients', () => {
    it('should fetch list of clients successfully', async () => {
      const mockResponse: ClientListResponse = {
        data: [
          {
            id: 1,
            name: 'Test Client',
            email: 'test@example.com',
            phone_number: '+1234567890',
            business_name: 'Test Business',
            business_tax_id: 'TAX123',
            vat_number: 'VAT123',
            display_name: 'Test Client',
            full_address: '123 Test St, Test City',
            vat_strategy: 'standard',
            address: {
              id: 1,
              street_address: '123 Test St',
              city: 'Test City',
              state: 'Test State',
              postal_code: '12345',
              country: 'Test Country',
              full_address: '123 Test St, Test City',
            },
          },
        ],
        meta: {
          current_page: 1,
          total_pages: 1,
          total_count: 1,
          per_page: 20,
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await clientsApi.listClients();

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('should include auth token when available', async () => {
      localStorageMock.setItem('solobooks_auth_token', 'test-token');

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      });

      await clientsApi.listClients();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle pagination parameters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [], meta: {} }),
      });

      await clientsApi.listClients({ page: 2, per_page: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients?page=2&per_page=10',
        expect.any(Object)
      );
    });
  });

  describe('createClient', () => {
    it('should create a client successfully', async () => {
      const mockResponse: ClientResponse = {
        data: {
          id: 1,
          name: 'New Client',
          email: 'new@example.com',
          phone_number: '+1234567890',
          business_name: 'New Business',
          business_tax_id: 'TAX456',
          vat_number: 'VAT456',
          display_name: 'New Client',
          full_address: '456 New St, New City',
          vat_strategy: 'standard',
          address: {
            id: 1,
            street_address: '456 New St',
            city: 'New City',
            state: 'New State',
            postal_code: '54321',
            country: 'New Country',
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const clientData = {
        client: {
          name: 'New Client',
          email: 'new@example.com',
          phone_number: '+1234567890',
          business_name: 'New Business',
        },
      };

      const result = await clientsApi.createClient(clientData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(clientData),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getClient', () => {
    it('should fetch a single client successfully', async () => {
      const mockResponse: ClientResponse = {
        data: {
          id: 1,
          name: 'Test Client',
          email: 'test@example.com',
          phone_number: '+1234567890',
          business_name: 'Test Business',
          business_tax_id: 'TAX123',
          vat_number: 'VAT123',
          display_name: 'Test Client',
          full_address: '123 Test St, Test City',
          vat_strategy: 'standard',
          address: {
            id: 1,
            street_address: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postal_code: '12345',
            country: 'Test Country',
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await clientsApi.getClient(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients/1',
        expect.objectContaining({
          method: 'GET',
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateClient', () => {
    it('should update a client successfully', async () => {
      const mockResponse: ClientResponse = {
        data: {
          id: 1,
          name: 'Updated Client',
          email: 'updated@example.com',
          phone_number: '+9876543210',
          business_name: 'Updated Business',
          business_tax_id: 'TAX789',
          vat_number: 'VAT789',
          display_name: 'Updated Client',
          full_address: '789 Updated St, Updated City',
          vat_strategy: 'standard',
          address: {
            id: 1,
            street_address: '789 Updated St',
            city: 'Updated City',
            state: 'Updated State',
            postal_code: '98765',
            country: 'Updated Country',
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const updateData = {
        client: {
          name: 'Updated Client',
          email: 'updated@example.com',
        },
      };

      const result = await clientsApi.updateClient(1, updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => ({}),
      });

      const result = await clientsApi.deleteClient(1);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/clients/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );

      expect(result).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        error: {
          code: 'validation_error',
          message: 'Validation failed',
          details: {
            email: ['is invalid'],
          },
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => mockError,
      });

      await expect(clientsApi.listClients()).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(clientsApi.listClients()).rejects.toEqual({
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to the server. Please check your connection.',
        },
      });
    });
  });
});
