require('dotenv').config();
const sequelize = require('../config/database');
const {
  User,
  AccommodationType,
  Property,
  PropertyImage,
  PropertyAvailability,
  Service,
  Booking,
  PaymentTransaction,
  Review,
  UserVerificationCode
} = require('../models');

async function seed() {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos (NO usar force en producción)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Modelos sincronizados');

    // ========== CREAR USUARIOS ==========
    console.log('\n👥 Creando usuarios...');

    const admin = await User.create({
      email: 'admin@arroyoseco.com',
      password: 'Admin123!',
      full_name: 'Administrador Principal',
      phone: '+52-664-123-4567',
      role: 'admin',
      status: true,
      email_verified: true
    });
    console.log('✓ Admin creado');

    const host1 = await User.create({
      email: 'carlos.host@example.com',
      password: 'Host123!',
      full_name: 'Carlos Rodríguez',
      phone: '+52-664-234-5678',
      role: 'host',
      status: true,
      email_verified: true
    });
    console.log('✓ Host 1 creado');

    const host2 = await User.create({
      email: 'maria.host@example.com',
      password: 'Host123!',
      full_name: 'María González',
      phone: '+52-664-345-6789',
      role: 'host',
      status: true,
      email_verified: true
    });
    console.log('✓ Host 2 creado');

    const guest1 = await User.create({
      email: 'juan.guest@example.com',
      password: 'Guest123!',
      full_name: 'Juan Pérez',
      phone: '+52-664-456-7890',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('✓ Guest 1 creado');

    const guest2 = await User.create({
      email: 'ana.guest@example.com',
      password: 'Guest123!',
      full_name: 'Ana Martínez',
      phone: '+52-664-567-8901',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('✓ Guest 2 creado');

    const guest3 = await User.create({
      email: 'pedro.guest@example.com',
      password: 'Guest123!',
      full_name: 'Pedro Sánchez',
      phone: '+52-664-678-9012',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('✓ Guest 3 creado');

    // ========== CREAR TIPOS DE ALOJAMIENTO ==========
    console.log('\n🏢 Creando tipos de alojamiento...');

    const casaCompleta = await AccommodationType.create({
      name: 'Casa Completa',
      min_price: 1500.00,
      max_price: 8000.00,
      platform_commission_percentage: 15.00
    });

    const departamento = await AccommodationType.create({
      name: 'Departamento',
      min_price: 800.00,
      max_price: 3000.00,
      platform_commission_percentage: 12.00
    });

    const cabana = await AccommodationType.create({
      name: 'Cabaña',
      min_price: 1000.00,
      max_price: 5000.00,
      platform_commission_percentage: 15.00
    });

    const villa = await AccommodationType.create({
      name: 'Villa de Lujo',
      min_price: 4000.00,
      max_price: 15000.00,
      platform_commission_percentage: 18.00
    });

    console.log('✓ 4 tipos de alojamiento creados');

    // ========== CREAR SERVICIOS ==========
    console.log('\n⚙️ Creando servicios...');

    const wifi = await Service.create({ name: 'WiFi', icon: 'wifi', description: 'Internet inalámbrico de alta velocidad' });
    const piscina = await Service.create({ name: 'Piscina', icon: 'pool', description: 'Piscina privada o compartida' });
    const estacionamiento = await Service.create({ name: 'Estacionamiento', icon: 'car', description: 'Espacio de estacionamiento gratuito' });
    const cocina = await Service.create({ name: 'Cocina', icon: 'kitchen', description: 'Cocina equipada completa' });
    const aireAcondicionado = await Service.create({ name: 'Aire Acondicionado', icon: 'ac_unit', description: 'Climatización en todas las habitaciones' });
    const tv = await Service.create({ name: 'TV', icon: 'tv', description: 'Televisión por cable o streaming' });
    const lavadora = await Service.create({ name: 'Lavadora', icon: 'washing_machine', description: 'Lavadora disponible' });
    const calefaccion = await Service.create({ name: 'Calefacción', icon: 'heat', description: 'Sistema de calefacción' });
    const areaT Trabajo = await Service.create({ name: 'Área de trabajo', icon: 'desk', description: 'Espacio dedicado para trabajar' });
    const mascotas = await Service.create({ name: 'Admite mascotas', icon: 'pets', description: 'Se permiten mascotas' });
    const jardin = await Service.create({ name: 'Jardín', icon: 'garden', description: 'Jardín o patio privado' });
    const parrilla = await Service.create({ name: 'Parrilla', icon: 'bbq', description: 'Asador o parrilla' });

    console.log('✓ 12 servicios creados');

    // ========== CREAR PROPIEDADES ==========
    console.log('\n🏠 Creando propiedades...');

    const property1 = await Property.create({
      host_id: host1.id,
      title: 'Casa Vista al Mar - Playa Rosarito',
      description: 'Hermosa casa frente al mar en Rosarito con vistas espectaculares al océano Pacífico. Perfecta para familias que buscan relajarse y disfrutar de la playa.',
      accommodation_type_id: casaCompleta.id,
      price_per_night: 2500.00,
      location: 'Rosarito, Baja California',
      capacity: 8,
      status: 'published',
      is_advertised: true
    });
    await property1.setServices([wifi, estacionamiento, cocina, tv, parrilla]);
    console.log('✓ Propiedad 1 creada');

    const property2 = await Property.create({
      host_id: host1.id,
      title: 'Cabaña Campestre Valle de Guadalupe',
      description: 'Acogedora cabaña en el corazón del Valle de Guadalupe, rodeada de viñedos. Ideal para parejas o grupos pequeños.',
      accommodation_type_id: cabana.id,
      price_per_night: 3200.00,
      location: 'Valle de Guadalupe, Ensenada',
      capacity: 4,
      status: 'published',
      is_advertised: true
    });
    await property2.setServices([wifi, estacionamiento, cocina, calefaccion, mascotas, jardin, parrilla]);
    console.log('✓ Propiedad 2 creada');

    const property3 = await Property.create({
      host_id: host2.id,
      title: 'Departamento Moderno Centro Tijuana',
      description: 'Departamento contemporáneo en el centro de Tijuana, cerca de restaurantes, bares y zonas comerciales.',
      accommodation_type_id: departamento.id,
      price_per_night: 1200.00,
      location: 'Zona Centro, Tijuana',
      capacity: 3,
      status: 'published',
      is_advertised: false
    });
    await property3.setServices([wifi, estacionamiento, aireAcondicionado, tv, cocina, areaTrabajo]);
    console.log('✓ Propiedad 3 creada');

    const property4 = await Property.create({
      host_id: host2.id,
      title: 'Villa de Lujo Playa La Misión',
      description: 'Impresionante villa de lujo con arquitectura contemporánea en La Misión. Ofrece vistas panorámicas al océano.',
      accommodation_type_id: villa.id,
      price_per_night: 5800.00,
      location: 'La Misión, Baja California',
      capacity: 12,
      status: 'published',
      is_advertised: true
    });
    await property4.setServices([wifi, piscina, estacionamiento, cocina, aireAcondicionado, tv, lavadora, jardin, parrilla]);
    console.log('✓ Propiedad 4 creada');

    const property5 = await Property.create({
      host_id: host1.id,
      title: 'Cabaña Ecológica El Sauzal',
      description: 'Cabaña ecológica construida con materiales sustentables en El Sauzal.',
      accommodation_type_id: cabana.id,
      price_per_night: 1800.00,
      location: 'El Sauzal, Ensenada',
      capacity: 4,
      status: 'published',
      is_advertised: false
    });
    await property5.setServices([wifi, estacionamiento, cocina, mascotas, jardin]);
    console.log('✓ Propiedad 5 creada');

    const property6 = await Property.create({
      host_id: host2.id,
      title: 'Casa en Revisión - Ensenada Centro',
      description: 'Casa amplia en el centro de Ensenada, cerca del malecón y restaurantes.',
      accommodation_type_id: casaCompleta.id,
      price_per_night: 2200.00,
      location: 'Centro, Ensenada',
      capacity: 6,
      status: 'inactive',
      is_advertised: false
    });
    await property6.setServices([wifi, estacionamiento, cocina]);
    console.log('✓ Propiedad 6 creada (inactiva)');

    // ========== CREAR IMÁGENES DE PROPIEDADES ==========
    console.log('\n📸 Creando imágenes de propiedades...');

    await PropertyImage.bulkCreate([
      { property_id: property1.id, image_url: '/uploads/property1-main.jpg', is_main: true },
      { property_id: property1.id, image_url: '/uploads/property1-2.jpg', is_main: false },
      { property_id: property1.id, image_url: '/uploads/property1-3.jpg', is_main: false },
      { property_id: property2.id, image_url: '/uploads/property2-main.jpg', is_main: true },
      { property_id: property2.id, image_url: '/uploads/property2-2.jpg', is_main: false },
      { property_id: property3.id, image_url: '/uploads/property3-main.jpg', is_main: true },
      { property_id: property4.id, image_url: '/uploads/property4-main.jpg', is_main: true },
      { property_id: property4.id, image_url: '/uploads/property4-2.jpg', is_main: false },
      { property_id: property5.id, image_url: '/uploads/property5-main.jpg', is_main: true },
      { property_id: property6.id, image_url: '/uploads/property6-main.jpg', is_main: true }
    ]);
    console.log('✓ Imágenes de propiedades creadas');

    // ========== CREAR RESERVACIONES ==========
    console.log('\n📅 Creando reservaciones...');

    const booking1 = await Booking.create({
      property_id: property1.id,
      guest_id: guest1.id,
      check_in_date: '2025-11-15',
      check_out_date: '2025-11-18',
      total_guests: 6,
      total_price: 7500.00,
      payment_status: 'confirmed',
      booking_status: 'confirmed',
      stripe_payment_intent_id: 'pi_test_1234567890'
    });
    console.log('✓ Reservación 1 creada (confirmada)');

    const booking2 = await Booking.create({
      property_id: property2.id,
      guest_id: guest2.id,
      check_in_date: '2025-12-01',
      check_out_date: '2025-12-03',
      total_guests: 2,
      total_price: 6400.00,
      payment_status: 'confirmed',
      booking_status: 'confirmed',
      stripe_payment_intent_id: 'pi_test_0987654321'
    });
    console.log('✓ Reservación 2 creada (confirmada)');

    const booking3 = await Booking.create({
      property_id: property3.id,
      guest_id: guest3.id,
      check_in_date: '2025-11-20',
      check_out_date: '2025-11-25',
      total_guests: 2,
      total_price: 6000.00,
      payment_status: 'pending',
      booking_status: 'pending'
    });
    console.log('✓ Reservación 3 creada (pendiente)');

    const booking4 = await Booking.create({
      property_id: property4.id,
      guest_id: guest1.id,
      check_in_date: '2025-12-24',
      check_out_date: '2025-12-26',
      total_guests: 10,
      total_price: 11600.00,
      payment_status: 'confirmed',
      booking_status: 'confirmed',
      stripe_payment_intent_id: 'pi_test_5555666677'
    });
    console.log('✓ Reservación 4 creada (confirmada)');

    const booking5 = await Booking.create({
      property_id: property5.id,
      guest_id: guest2.id,
      check_in_date: '2025-10-15',
      check_out_date: '2025-10-17',
      total_guests: 3,
      total_price: 3600.00,
      payment_status: 'confirmed',
      booking_status: 'completed',
      stripe_payment_intent_id: 'pi_test_9999888877'
    });
    console.log('✓ Reservación 5 creada (completada)');

    const booking6 = await Booking.create({
      property_id: property1.id,
      guest_id: guest3.id,
      check_in_date: '2025-09-10',
      check_out_date: '2025-09-13',
      total_guests: 5,
      total_price: 7500.00,
      payment_status: 'cancelled',
      booking_status: 'cancelled',
      stripe_payment_intent_id: 'pi_test_1111222233',
      cancellation_reason: 'Cancelada por motivos personales',
      cancelled_at: new Date('2025-09-05')
    });
    console.log('✓ Reservación 6 creada (cancelada)');

    // ========== CREAR TRANSACCIONES DE PAGO ==========
    console.log('\n💳 Creando transacciones de pago...');

    await PaymentTransaction.bulkCreate([
      { booking_id: booking1.id, amount: 7500.00, platform_commission: 1125.00, payment_method: 'Stripe', status: 'success' },
      { booking_id: booking2.id, amount: 6400.00, platform_commission: 768.00, payment_method: 'Stripe', status: 'success' },
      { booking_id: booking3.id, amount: 6000.00, platform_commission: 720.00, payment_method: 'Stripe', status: 'pending' },
      { booking_id: booking4.id, amount: 11600.00, platform_commission: 2088.00, payment_method: 'Stripe', status: 'success' },
      { booking_id: booking5.id, amount: 3600.00, platform_commission: 540.00, payment_method: 'Stripe', status: 'success' },
      { booking_id: booking6.id, amount: 7500.00, platform_commission: 1125.00, payment_method: 'Stripe', status: 'failed' }
    ]);
    console.log('✓ 6 transacciones de pago creadas');

    // ========== CREAR RESEÑAS ==========
    console.log('\n⭐ Creando reseñas...');

    await Review.bulkCreate([
      { booking_id: booking5.id, rating: 5 },
      { booking_id: booking1.id, rating: 4 }
    ]);
    console.log('✓ 2 reseñas creadas');

    // ========== RESUMEN ==========
    console.log('\n✅ ¡Seed completado exitosamente!');
    console.log('\n📊 RESUMEN DE DATOS CREADOS:');
    console.log('─────────────────────────────────────');
    console.log(`👥 Usuarios: 6 (1 admin, 2 hosts, 3 guests)`);
    console.log(`🏢 Tipos de Alojamiento: 4`);
    console.log(`⚙️ Servicios: 12`);
    console.log(`🏠 Propiedades: 6 (5 publicadas, 1 inactiva)`);
    console.log(`📸 Imágenes: 10`);
    console.log(`📅 Reservaciones: 6`);
    console.log(`💳 Transacciones: 6`);
    console.log(`⭐ Reseñas: 2`);
    console.log('─────────────────────────────────────');

    console.log('\n🔑 CREDENCIALES DE PRUEBA:');
    console.log('─────────────────────────────────────');
    console.log('ADMIN:');
    console.log('  Email: admin@arroyoseco.com');
    console.log('  Password: Admin123!');
    console.log('');
    console.log('HOST 1 (Carlos):');
    console.log('  Email: carlos.host@example.com');
    console.log('  Password: Host123!');
    console.log('');
    console.log('HOST 2 (María):');
    console.log('  Email: maria.host@example.com');
    console.log('  Password: Host123!');
    console.log('');
    console.log('GUEST 1 (Juan):');
    console.log('  Email: juan.guest@example.com');
    console.log('  Password: Guest123!');
    console.log('');
    console.log('GUEST 2 (Ana):');
    console.log('  Email: ana.guest@example.com');
    console.log('  Password: Guest123!');
    console.log('');
    console.log('GUEST 3 (Pedro):');
    console.log('  Email: pedro.guest@example.com');
    console.log('  Password: Guest123!');
    console.log('─────────────────────────────────────');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
    console.log('\n👋 Conexión a la base de datos cerrada');
    process.exit(0);
  }
}

// Ejecutar el seed
seed();
