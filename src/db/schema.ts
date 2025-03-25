import { 
  pgTable, 
  text, 
  timestamp,
  uuid,
  index
} from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull()
}, (table) => [
  index("email_idx").on(table.email)
]);

export const otpCodeTable = pgTable("otp_code", {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  code: text("code").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date"
  }).defaultNow().notNull()
}, (table) => [
  index("otp_user_id_idx").on(table.userId)
]);

export const sessionTable = pgTable("session", {
  // Change from uuid to text to support SHA-256 hash storage
  id: text('id').primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date"
  }).notNull()
}, (table) => [
  index("session_user_id_idx").on(table.userId),
  index("session_expires_at_idx").on(table.expiresAt)
]);