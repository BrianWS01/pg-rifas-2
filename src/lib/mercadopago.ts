import { MercadoPagoConfig, Payment } from 'mercadopago';

// Get access token from environment (Server-side only)
const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken && process.env.NODE_ENV === 'production') {
  console.warn('MP_ACCESS_TOKEN is missing in environment variables.');
}

// Inicializar a configuração do Mercado Pago (com timeout e options se necessário)
export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken || 'APP_USR-DUMMY',
  options: { timeout: 5000 }
});

// Inicializar os controllers
export const paymentClient = new Payment(mpConfig);
