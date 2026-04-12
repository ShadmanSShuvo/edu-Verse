import { z } from "zod";

/**
 * Zod schema for the 'orders' table.
 * Includes new fields for robust SSLCommerz integration.
 */
export const orderSchema = z.object({
  order_id: z.number(),
  user_id: z.number(),
  course_id: z.number().nullable(), // For single-course orders
  amount: z.number().nullable(),
  currency: z.string().default("BDT"),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "CANCELLED"]).default("PENDING"),
  ssl_tran_id: z.string().nullable(),
  ssl_session_key: z.string().nullable(),
  placed_at: z.date().or(z.string()),
  updated_at: z.date().or(z.string()),
});

export type Order = z.infer<typeof orderSchema>;

/**
 * Zod schema for the 'payment' table.
 * Includes val_id, bank_tran_id, and raw gateway response storage.
 */
export const paymentSchema = z.object({
  payment_id: z.number(),
  order_id: z.number(),
  amount: z.number().or(z.string()),
  status: z.string(),
  method: z.string().nullable(),
  time: z.date().or(z.string()),
  transaction_id: z.string().nullable(),
  ssl_val_id: z.string().nullable(),
  bank_tran_id: z.string().nullable(),
  gateway_response: z.record(z.any()).nullable(), // Raw JSONB from webhook
});

export type Payment = z.infer<typeof paymentSchema>;

/**
 * Input validation for SSLCommerz Webhooks (IPN / Success).
 */
export const sslCommerzWebhookSchema = z.object({
  status: z.string(),
  tran_id: z.string(),
  val_id: z.string().optional(),
  amount: z.string().optional(),
  store_amount: z.string().optional(),
  bank_tran_id: z.string().optional(),
  card_type: z.string().optional(),
  currency: z.string().optional(),
  verify_sign: z.string().optional(),
  verify_key: z.string().optional(),
}).passthrough(); // Keep all other fields for auditing
