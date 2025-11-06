# 💳 Guía de Implementación de Stripe - Arroyo Seco

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Backend - Configuración](#backend---configuración)
3. [Frontend - Integración](#frontend---integración)
4. [Flujo de Pago Completo](#flujo-de-pago-completo)
5. [Webhooks](#webhooks)
6. [Testing](#testing)
7. [Seguridad](#seguridad)
8. [Producción](#producción)

---

## 🚀 Configuración Inicial

### Paso 1: Crear Cuenta en Stripe

1. **Registrarse en Stripe:**
   - Ve a https://dashboard.stripe.com/register
   - Completa el registro
   - Activa tu cuenta (necesitarás info del negocio)

2. **Obtener API Keys:**
   - Ve a **Developers → API keys**
   - Copia:
     - **Publishable key** (pk_test_...)
     - **Secret key** (sk_test_...)

### Paso 2: Instalar Dependencias

```bash
# Backend
cd backend
npm install stripe

# Frontend
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔧 Backend - Configuración

### 1. Agregar Variables de Entorno

**Archivo: `backend/.env`**

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA
STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET

# URL del Frontend (para redirects)
FRONTEND_URL=http://localhost:3000
```

### 2. Crear Servicio de Stripe

**Archivo: `backend/src/services/stripe.service.js`**

```javascript
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {

  /**
   * Crear Payment Intent para una reserva
   * @param {Object} bookingData - Datos de la reserva
   * @returns {Object} Payment Intent
   */
  async createPaymentIntent(bookingData) {
    try {
      const { amount, currency = 'mxn', metadata } = bookingData;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          booking_id: metadata.bookingId,
          property_id: metadata.propertyId,
          guest_id: metadata.guestId,
          ...metadata
        },
        description: `Reserva - ${metadata.propertyTitle}`
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creando Payment Intent:', error);
      throw new Error('Error procesando el pago');
    }
  }

  /**
   * Confirmar un Payment Intent
   * @param {String} paymentIntentId - ID del Payment Intent
   * @returns {Object} Payment Intent confirmado
   */
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw new Error('Error confirmando el pago');
    }
  }

  /**
   * Cancelar un Payment Intent
   * @param {String} paymentIntentId - ID del Payment Intent
   * @returns {Object} Payment Intent cancelado
   */
  async cancelPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error cancelando pago:', error);
      throw new Error('Error cancelando el pago');
    }
  }

  /**
   * Crear un reembolso
   * @param {String} paymentIntentId - ID del Payment Intent
   * @param {Number} amount - Monto a reembolsar (opcional, por defecto todo)
   * @param {String} reason - Razón del reembolso
   * @returns {Object} Refund object
   */
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error creando reembolso:', error);
      throw new Error('Error procesando el reembolso');
    }
  }

  /**
   * Obtener detalles de un pago
   * @param {String} paymentIntentId - ID del Payment Intent
   * @returns {Object} Payment Intent details
   */
  async getPaymentDetails(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      console.error('Error obteniendo detalles del pago:', error);
      throw new Error('Error obteniendo información del pago');
    }
  }

  /**
   * Listar todos los cargos de un cliente
   * @param {String} customerId - ID del cliente en Stripe
   * @returns {Array} Lista de cargos
   */
  async listCharges(customerId) {
    try {
      const charges = await stripe.charges.list({
        customer: customerId,
        limit: 100
      });
      return charges.data;
    } catch (error) {
      console.error('Error listando cargos:', error);
      throw new Error('Error obteniendo historial de pagos');
    }
  }

  /**
   * Crear cliente en Stripe
   * @param {Object} userData - Datos del usuario
   * @returns {Object} Customer object
   */
  async createCustomer(userData) {
    try {
      const customer = await stripe.customers.create({
        email: userData.email,
        name: userData.full_name,
        metadata: {
          user_id: userData.id
        }
      });
      return customer;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw new Error('Error registrando cliente');
    }
  }

  /**
   * Procesar webhook de Stripe
   * @param {String} payload - Raw body del webhook
   * @param {String} signature - Stripe signature header
   * @returns {Object} Event object
   */
  constructWebhookEvent(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return event;
    } catch (error) {
      console.error('Error verificando webhook:', error);
      throw new Error('Webhook signature verification failed');
    }
  }
}

module.exports = new StripeService();
```

### 3. Actualizar Booking Controller

**Archivo: `backend/src/controllers/booking.controller.js`**

Actualizar el método `create`:

```javascript
const stripeService = require('../services/stripe.service');

async create(req, res, next) {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      numberOfGuests,
      specialRequests
    } = req.body;

    // Validar disponibilidad
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // ... validaciones existentes ...

    // Crear la reserva con estado 'pending'
    const booking = await Booking.create({
      property_id: property.id,
      guest_id: req.userId,
      check_in_date: checkIn,
      check_out_date: checkOut,
      total_guests: numberOfGuests,
      total_price: totalPrice,
      payment_status: 'pending',
      booking_status: 'pending',
      special_requests: specialRequests
    });

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripeService.createPaymentIntent({
      amount: totalPrice,
      currency: 'mxn',
      metadata: {
        bookingId: booking.id,
        propertyId: property.id,
        propertyTitle: property.title,
        guestId: req.userId,
        guestEmail: req.user.email,
        guestName: req.user.full_name
      }
    });

    // Guardar el Payment Intent ID en la reserva
    booking.stripe_payment_intent_id = paymentIntent.id;
    await booking.save();

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      booking: {
        id: booking.id,
        property: {
          id: property.id,
          title: property.title,
          location: property.location
        },
        checkIn: booking.check_in_date,
        checkOut: booking.check_out_date,
        totalGuests: booking.total_guests,
        totalPrice: booking.total_price,
        status: booking.booking_status
      },
      payment: {
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    });
  } catch (error) {
    next(error);
  }
}
```

### 4. Crear Endpoint para Webhooks

**Archivo: `backend/src/controllers/webhook.controller.js`**

```javascript
const stripeService = require('../services/stripe.service');
const { Booking, PaymentTransaction } = require('../models');
const emailService = require('../services/email.service');

class WebhookController {
  /**
   * Manejar webhooks de Stripe
   */
  async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;

    try {
      // Verificar el webhook
      const event = stripeService.constructWebhookEvent(payload, sig);

      console.log(`📨 Webhook recibido: ${event.type}`);

      // Manejar diferentes tipos de eventos
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;

        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;

        default:
          console.log(`⚠️ Evento no manejado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error procesando webhook:', error);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  /**
   * Manejar pago exitoso
   */
  async handlePaymentSuccess(paymentIntent) {
    try {
      const bookingId = paymentIntent.metadata.booking_id;

      // Actualizar la reserva
      const booking = await Booking.findByPk(bookingId, {
        include: ['property', 'guest']
      });

      if (!booking) {
        console.error('Reserva no encontrada:', bookingId);
        return;
      }

      // Actualizar estado de la reserva
      booking.payment_status = 'confirmed';
      booking.booking_status = 'confirmed';
      booking.stripe_payment_intent_id = paymentIntent.id;
      await booking.save();

      // Crear registro de transacción
      const platformCommission = booking.total_price * 0.15; // 15% comisión

      await PaymentTransaction.create({
        booking_id: booking.id,
        amount: booking.total_price,
        platform_commission: platformCommission,
        payment_method: 'card',
        status: 'success',
        transaction_date: new Date()
      });

      // Enviar email de confirmación
      await emailService.sendBookingConfirmation(
        booking.guest.email,
        {
          guestName: booking.guest.full_name,
          propertyTitle: booking.property.title,
          checkIn: booking.check_in_date,
          checkOut: booking.check_out_date,
          totalPrice: booking.total_price,
          bookingId: booking.id
        }
      );

      console.log(`✅ Pago procesado exitosamente para reserva #${bookingId}`);
    } catch (error) {
      console.error('Error manejando pago exitoso:', error);
    }
  }

  /**
   * Manejar pago fallido
   */
  async handlePaymentFailed(paymentIntent) {
    try {
      const bookingId = paymentIntent.metadata.booking_id;

      const booking = await Booking.findByPk(bookingId);

      if (booking) {
        booking.payment_status = 'rejected';
        booking.booking_status = 'cancelled';
        await booking.save();

        console.log(`❌ Pago fallido para reserva #${bookingId}`);
      }
    } catch (error) {
      console.error('Error manejando pago fallido:', error);
    }
  }

  /**
   * Manejar reembolso
   */
  async handleRefund(charge) {
    try {
      const paymentIntentId = charge.payment_intent;

      const booking = await Booking.findOne({
        where: { stripe_payment_intent_id: paymentIntentId }
      });

      if (booking) {
        booking.payment_status = 'cancelled';
        await booking.save();

        console.log(`💰 Reembolso procesado para reserva #${booking.id}`);
      }
    } catch (error) {
      console.error('Error manejando reembolso:', error);
    }
  }
}

module.exports = new WebhookController();
```

### 5. Crear Ruta para Webhooks

**Archivo: `backend/src/routes/webhook.routes.js`**

```javascript
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// ⚠️ IMPORTANTE: Esta ruta NO debe usar body-parser JSON
// Stripe necesita el raw body para verificar la firma
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
```

**Agregar en `backend/server.js`:**

```javascript
// ANTES de app.use(express.json())
app.use('/api/webhooks', require('./src/routes/webhook.routes'));

// DESPUÉS el resto de las rutas
app.use(express.json());
app.use('/api/auth', require('./src/routes/auth.routes'));
// ... resto de rutas
```

---

## 🎨 Frontend - Integración

### 1. Configurar Stripe Elements

**Archivo: `frontend/src/components/StripePaymentForm.jsx`**

```jsx
import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const StripePaymentForm = ({ clientSecret, bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/guest/booking-confirmation/${bookingId}`,
        },
      });

      if (submitError) {
        setError(submitError.message);
        toast.error(submitError.message);
      } else {
        toast.success('Pago procesado exitosamente');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError('Error procesando el pago');
      toast.error('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Pagar Ahora'}
      </button>
    </form>
  );
};

export default StripePaymentForm;
```

### 2. Crear Página de Pago

**Archivo: `frontend/src/pages/guest/PaymentPage.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '../../components/StripePaymentForm';
import api from '../../services/api';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data } = await api.get(`/bookings/${bookingId}`);
      setBooking(data.booking);
      setClientSecret(data.payment.clientSecret);
    } catch (error) {
      console.error('Error cargando reserva:', error);
      toast.error('Error cargando información de la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate(`/guest/booking-confirmation/${bookingId}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!booking || !clientSecret) {
    return <div className="text-center py-12">
      <p>No se pudo cargar la información de pago</p>
    </div>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0ea5e9',
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Completar Pago</h1>

        {/* Resumen de la reserva */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold mb-2">{booking.property.title}</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
            <p>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</p>
            <p className="font-semibold text-lg text-gray-900 mt-2">
              Total: ${booking.totalPrice.toFixed(2)} MXN
            </p>
          </div>
        </div>

        {/* Formulario de pago de Stripe */}
        <Elements stripe={stripePromise} options={options}>
          <StripePaymentForm
            clientSecret={clientSecret}
            bookingId={bookingId}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentPage;
```

### 3. Variables de Entorno

**Archivo: `frontend/.env`**

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔄 Flujo de Pago Completo

```
1. Usuario selecciona propiedad y fechas
   ↓
2. Frontend: Crear reserva (POST /api/bookings)
   ↓
3. Backend:
   - Valida disponibilidad
   - Crea reserva con estado 'pending'
   - Crea Payment Intent en Stripe
   - Retorna clientSecret
   ↓
4. Frontend: Muestra formulario de Stripe
   ↓
5. Usuario completa información de pago
   ↓
6. Stripe procesa el pago
   ↓
7. Stripe envía webhook a backend
   ↓
8. Backend (Webhook):
   - Actualiza reserva a 'confirmed'
   - Crea PaymentTransaction
   - Envía email de confirmación
   ↓
9. Frontend: Redirecciona a confirmación
```

---

## 🔔 Webhooks

### Configurar Webhooks en Stripe

1. **Dashboard de Stripe:**
   - Ve a **Developers → Webhooks**
   - Click **Add endpoint**

2. **Endpoint URL:**
   ```
   https://tu-dominio.com/api/webhooks/stripe
   ```

3. **Eventos a escuchar:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

4. **Obtener Webhook Secret:**
   - Copia el `Signing secret` (whsec_...)
   - Agrégalo a tu `.env`

### Testing Local con Stripe CLI

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# O descarga de: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Escuchar webhooks localmente
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Esto te dará un webhook secret temporal
# Agrégalo a tu .env como STRIPE_WEBHOOK_SECRET
```

---

## 🧪 Testing

### Tarjetas de Prueba de Stripe

```
✅ Pago Exitoso:
4242 4242 4242 4242

❌ Pago Declinado:
4000 0000 0000 0002

⚠️ Requiere Autenticación (3D Secure):
4000 0027 6000 3184

💳 Fecha de Expiración: Cualquier fecha futura
🔒 CVC: Cualquier 3 dígitos
📮 ZIP: Cualquier código postal
```

### Probar el Flujo Completo

```bash
# 1. Iniciar backend
cd backend
npm run dev

# 2. En otra terminal, iniciar Stripe CLI
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# 3. En otra terminal, iniciar frontend
cd frontend
npm start

# 4. Crear una reserva y completar el pago con tarjeta de prueba

# 5. Verificar en Stripe CLI que el webhook fue recibido
```

---

## 🔒 Seguridad

### Best Practices

1. **API Keys:**
   ```javascript
   // ✅ CORRECTO - Backend
   const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

   // ❌ INCORRECTO - Frontend
   // NUNCA uses la secret key en el frontend
   ```

2. **Validar Webhooks:**
   ```javascript
   // SIEMPRE verifica la firma
   const event = stripe.webhooks.constructEvent(
     payload,
     signature,
     webhookSecret
   );
   ```

3. **Manejar Errores:**
   ```javascript
   try {
     // Procesar pago
   } catch (error) {
     // NO expongas detalles del error al cliente
     console.error(error);
     res.status(500).json({ error: 'Error procesando pago' });
   }
   ```

4. **Validar Montos:**
   ```javascript
   // Recalcular SIEMPRE el precio en el backend
   // NUNCA confíes en el monto enviado desde el frontend
   ```

---

## 🚀 Producción

### Checklist para Go-Live

- [ ] **Cambiar a API Keys de producción**
  - [ ] Actualizar STRIPE_SECRET_KEY
  - [ ] Actualizar STRIPE_PUBLISHABLE_KEY
  - [ ] Actualizar STRIPE_WEBHOOK_SECRET

- [ ] **Configurar Webhooks de producción**
  - [ ] Agregar endpoint en producción
  - [ ] Verificar que recibe eventos

- [ ] **Completar activación de cuenta**
  - [ ] Info del negocio
  - [ ] Info bancaria para pagos

- [ ] **Testing en producción**
  - [ ] Hacer un pago real pequeño
  - [ ] Verificar webhook
  - [ ] Hacer un reembolso de prueba

- [ ] **Monitoreo**
  - [ ] Configurar alertas en Stripe
  - [ ] Logs de errores
  - [ ] Dashboard de métricas

---

## 📊 Dashboards y Reportes

### Ver Transacciones en Stripe

1. Dashboard → Payments
2. Filtrar por fechas, montos, estado
3. Exportar a CSV/Excel

### Métricas Importantes

- **Tasa de éxito de pagos**
- **Montos procesados**
- **Reembolsos**
- **Disputas/Chargebacks**

---

## 🆘 Troubleshooting

### Error: "No such payment_intent"

```
Causa: El Payment Intent ID no existe o es incorrecto
Solución: Verificar que el ID es correcto y pertenece a tu cuenta
```

### Error: "This payment requires authentication"

```
Causa: La tarjeta requiere 3D Secure
Solución: Implementar confirmPayment en el frontend (ya implementado arriba)
```

### Webhook no recibe eventos

```
Causa: URL incorrecta o firma inválida
Solución:
1. Verificar URL del webhook
2. Verificar STRIPE_WEBHOOK_SECRET
3. Usar Stripe CLI para testing local
```

---

## 📚 Recursos Adicionales

- **Documentación Stripe:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **React Stripe.js:** https://stripe.com/docs/stripe-js/react
- **Webhooks:** https://stripe.com/docs/webhooks

---

## ✅ Resumen

Has completado:
- ✅ Configuración de Stripe
- ✅ Servicio de backend
- ✅ Integración en frontend
- ✅ Webhooks configurados
- ✅ Flujo de pago completo
- ✅ Testing y seguridad

**¡Tu plataforma ya puede procesar pagos con Stripe!** 💳✨

---

**Creado por:** Claude (Anthropic)
**Fecha:** Noviembre 2025
**Versión:** 1.0.0
