/**
 * Database entity types
 * These types mirror the schema structure in schema.ts
 */

// Base types for database entities
export interface User {
  id: string;  // UUID stored as string
  email: string;
  createdAt: Date;
}

export interface OTPCode {
  id: string;  // UUID stored as string
  userId: string;  // Should be string to match UUID in schema
  code: string;
  createdAt: Date;
}

export interface Session {
  id: string;  // UUID stored as string
  userId: string;
  expiresAt: Date;
}

// Insert types - only include fields that need to be provided explicitly
export type InsertUser = {
  email: string;
};

export type InsertOTPCode = {
  userId: string;
  code: string;
};

export type InsertSession = {
  userId: string;
  expiresAt: Date;
};