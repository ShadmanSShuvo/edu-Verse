/**
 * lib/sslcommerz.ts
 * Using native fetch to communicate with SSLCommerz APIs.
 * This avoids dependency issues with older libraries in the Next.js environment.
 */

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID!;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD!;
const IS_LIVE = false; // Set to true for production

const BASE_URL = IS_LIVE 
  ? 'https://securepay.sslcommerz.com' 
  : 'https://sandbox.sslcommerz.com';

export interface SSLCommerzInitData {
  total_amount: number;
  currency: "BDT";
  tran_id: string;
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url: string;
  shipping_method: string;
  product_name: string;
  product_category: string;
  product_profile: string;
  cus_name: string;
  cus_email: string;
  cus_add1: string;
  cus_city: string;
  cus_postcode: string;
  cus_country: string;
  cus_phone: string;
}

export interface SSLCommerzInitResponse {
  status: string;
  GatewayPageURL?: string;
  sessionkey?: string;
  failedreason?: string;
}

export interface SSLCommerzValidateResponse {
  status: string;
  tran_id: string;
  val_id: string;
  amount: string;
  store_amount: string;
  card_type: string;
  card_no: string;
  currency: string;
  bank_tran_id: string;
  card_issuer: string;
  card_brand: string;
}

/**
 * Initiates a payment session with SSLCommerz using native fetch.
 */
export async function initiatePayment(
  data: SSLCommerzInitData
): Promise<SSLCommerzInitResponse> {
  const url = `${BASE_URL}/gwprocess/v4/api.php`;
  
  // Create form data body
  const body = new URLSearchParams();
  body.append('store_id', STORE_ID);
  body.append('store_passwd', STORE_PASSWORD);
  
  // Append all data fields
  Object.entries(data).forEach(([key, value]) => {
    body.append(key, String(value));
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`SSLCommerz API responded with status: ${response.status}`);
  }

  return await response.json() as SSLCommerzInitResponse;
}

/**
 * Validates a payment using val_id.
 */
export async function validatePayment(
  val_id: string
): Promise<SSLCommerzValidateResponse> {
  const url = `${BASE_URL}/validator/api/validationserverAPI.php`;
  
  const params = new URLSearchParams({
    val_id,
    store_id: STORE_ID,
    store_passwd: STORE_PASSWORD,
    format: 'json'
  });

  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`SSLCommerz Validation API responded with status: ${response.status}`);
  }

  return await response.json() as SSLCommerzValidateResponse;
}

