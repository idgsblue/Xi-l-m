require('dotenv').config();
const sequelize = require('../config/database');
const {
  User,
  AccommodationType,
  Property,
  PropertyImage,
  Service,
  Booking,
  PaymentTransaction
} = require('../models');

async function completeSeed() {
  try {
    console.log('🌱 Iniciando seed completo de la base de datos...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // ========== PASO 1: CREAR USUARIOS ==========
    console.log('👥 PASO 1: Creando usuarios...\n');

    // IMPORTANTE: NO hashear la contraseña aquí, el hook beforeCreate del modelo lo hará automáticamente
    const plainPassword = 'Password123!';

    // Usuario Admin (será el primero, el trigger lo hará admin)
    const admin = await User.create({
      email: 'admin@arroyoseco.com',
      password: plainPassword,
      full_name: 'Administrador Sistema',
      phone: '+52 664 123 4567',
      role: 'admin',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Admin creado:', admin.email, '- Password: Password123!');

    // Usuarios Host
    const host1 = await User.create({
      email: 'carlos.host@example.com',
      password: plainPassword,
      full_name: 'Carlos Rodríguez',
      phone: '+52 664 234 5678',
      role: 'host',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Host 1 creado:', host1.email, '- Password: Password123!');

    const host2 = await User.create({
      email: 'maria.host@example.com',
      password: plainPassword,
      full_name: 'María González',
      phone: '+52 664 345 6789',
      role: 'host',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Host 2 creado:', host2.email, '- Password: Password123!');

    // Usuarios Guest
    const guest1 = await User.create({
      email: 'juan.guest@example.com',
      password: plainPassword,
      full_name: 'Juan Pérez',
      phone: '+52 664 456 7890',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Guest 1 creado:', guest1.email, '- Password: Password123!');

    const guest2 = await User.create({
      email: 'ana.guest@example.com',
      password: plainPassword,
      full_name: 'Ana Martínez',
      phone: '+52 664 567 8901',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Guest 2 creado:', guest2.email, '- Password: Password123!');

    const guest3 = await User.create({
      email: 'pedro.guest@example.com',
      password: plainPassword,
      full_name: 'Pedro Sánchez',
      phone: '+52 664 678 9012',
      role: 'guest',
      status: true,
      email_verified: true
    });
    console.log('  ✓ Guest 3 creado:', guest3.email, '- Password: Password123!');

    // ========== PASO 2: CREAR TIPOS DE ALOJAMIENTO ==========
    console.log('\n🏘️  PASO 2: Creando tipos de alojamiento...\n');

    const casaCompleta = await AccommodationType.create({
      name: 'Casa Completa',
      min_price: 1500.00,
      max_price: 8000.00,
      platform_commission_percentage: 15.00
    });
    console.log('  ✓ Casa Completa');

    const departamento = await AccommodationType.create({
      name: 'Departamento',
      min_price: 800.00,
      max_price: 3000.00,
      platform_commission_percentage: 12.00
    });
    console.log('  ✓ Departamento');

    const cabana = await AccommodationType.create({
      name: 'Cabaña',
      min_price: 1200.00,
      max_price: 5000.00,
      platform_commission_percentage: 13.00
    });
    console.log('  ✓ Cabaña');

    const villaLujo = await AccommodationType.create({
      name: 'Villa de Lujo',
      min_price: 5000.00,
      max_price: 20000.00,
      platform_commission_percentage: 18.00
    });
    console.log('  ✓ Villa de Lujo');

    // ========== PASO 3: OBTENER SERVICIOS ==========
    console.log('\n⚙️  PASO 3: Obteniendo servicios...\n');

    const wifi = await Service.findOne({ where: { name: 'WiFi' } });
    const piscina = await Service.findOne({ where: { name: 'Piscina' } });
    const estacionamiento = await Service.findOne({ where: { name: 'Estacionamiento' } });
    const cocina = await Service.findOne({ where: { name: 'Cocina' } });
    const aireAcondicionado = await Service.findOne({ where: { name: 'Aire Acondicionado' } });
    const tv = await Service.findOne({ where: { name: 'TV' } });
    const lavadora = await Service.findOne({ where: { name: 'Lavadora' } });
    const calefaccion = await Service.findOne({ where: { name: 'Calefacción' } });
    const areaTrabajo = await Service.findOne({ where: { name: 'Área de trabajo' } });
    const admiteMascotas = await Service.findOne({ where: { name: 'Admite mascotas' } });
    const jardin = await Service.findOne({ where: { name: 'Jardín' } });
    const parrilla = await Service.findOne({ where: { name: 'Parrilla' } });

    console.log('  ✓ 12 servicios obtenidos');

    // ========== PASO 4: CREAR PROPIEDADES ==========
    console.log('\n🏠 PASO 4: Creando propiedades...\n');

    // Propiedad 1 - Host 1
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

    await PropertyImage.create({ property_id: property1.id, image_url: '/uploads/property1-main.jpg', is_main: true });
    await PropertyImage.create({ property_id: property1.id, image_url: '/uploads/property1-2.jpg', is_main: false });
    await PropertyImage.create({ property_id: property1.id, image_url: '/uploads/property1-3.jpg', is_main: false });

    await property1.setServices([wifi, estacionamiento, cocina, tv, parrilla]);
    console.log('  ✓ Propiedad 1: Casa Vista al Mar');

    // Propiedad 2 - Host 1
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

    await PropertyImage.create({ property_id: property2.id, image_url: '/uploads/property2-main.jpg', is_main: true });
    await PropertyImage.create({ property_id: property2.id, image_url: '/uploads/property2-2.jpg', is_main: false });

    await property2.setServices([wifi, estacionamiento, cocina, calefaccion, admiteMascotas, jardin, parrilla]);
    console.log('  ✓ Propiedad 2: Cabaña Valle de Guadalupe');

    // Propiedad 3 - Host 2
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

    await PropertyImage.create({ property_id: property3.id, image_url: '/uploads/property3-main.jpg', is_main: true });

    await property3.setServices([wifi, estacionamiento, aireAcondicionado, tv, cocina, areaTrabajo]);
    console.log('  ✓ Propiedad 3: Departamento Centro Tijuana');

    // Propiedad 4 - Host 2
    const property4 = await Property.create({
      host_id: host2.id,
      title: 'Villa de Lujo Playa La Misión',
      description: 'Impresionante villa de lujo con arquitectura contemporánea en La Misión. Ofrece vistas panorámicas al océano.',
      accommodation_type_id: villaLujo.id,
      price_per_night: 5800.00,
      location: 'La Misión, Baja California',
      capacity: 12,
      status: 'published',
      is_advertised: true
    });

    await PropertyImage.create({ property_id: property4.id, image_url: '/uploads/property4-main.jpg', is_main: true });
    await PropertyImage.create({ property_id: property4.id, image_url: '/uploads/property4-2.jpg', is_main: false });

    await property4.setServices([wifi, piscina, estacionamiento, cocina, aireAcondicionado, tv, lavadora, jardin, parrilla]);
    console.log('  ✓ Propiedad 4: Villa de Lujo La Misión');

    // Propiedad 5 - Host 1 (Inactiva)
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

    await PropertyImage.create({ property_id: property5.id, image_url: '/uploads/property5-main.jpg', is_main: true });

    await property5.setServices([wifi, estacionamiento, cocina, jardin, admiteMascotas]);
    console.log('  ✓ Propiedad 5: Cabaña Ecológica El Sauzal');

    // ========== PASO 5: CREAR RESERVAS ==========
    console.log('\n📅 PASO 5: Creando reservas...\n');

    // Reserva 1 - Confirmada
    const booking1 = await Booking.create({
      property_id: property1.id,
      guest_id: guest1.id,
      check_in_date: '2025-12-15',
      check_out_date: '2025-12-20',
      total_guests: 4,
      total_price: 12500.00,
      payment_status: 'confirmed',
      booking_status: 'confirmed',
      stripe_payment_intent_id: 'pi_test_123456'
    });

    await PaymentTransaction.create({
      booking_id: booking1.id,
      amount: 12500.00,
      platform_commission: 1875.00, // 15%
      payment_method: 'card',
      status: 'success'
    });
    console.log('  ✓ Reserva 1: Casa Vista al Mar (Confirmada)');

    // Reserva 2 - En progreso
    const booking2 = await Booking.create({
      property_id: property2.id,
      guest_id: guest2.id,
      check_in_date: '2025-11-01',
      check_out_date: '2025-11-05',
      total_guests: 2,
      total_price: 12800.00,
      payment_status: 'confirmed',
      booking_status: 'in_progress',
      stripe_payment_intent_id: 'pi_test_234567'
    });

    await PaymentTransaction.create({
      booking_id: booking2.id,
      amount: 12800.00,
      platform_commission: 1664.00, // 13%
      payment_method: 'card',
      status: 'success'
    });
    console.log('  ✓ Reserva 2: Cabaña Valle de Guadalupe (En progreso)');

    // Reserva 3 - Completada
    const booking3 = await Booking.create({
      property_id: property3.id,
      guest_id: guest3.id,
      check_in_date: '2025-10-10',
      check_out_date: '2025-10-12',
      total_guests: 2,
      total_price: 2400.00,
      payment_status: 'confirmed',
      booking_status: 'completed',
      stripe_payment_intent_id: 'pi_test_345678'
    });

    await PaymentTransaction.create({
      booking_id: booking3.id,
      amount: 2400.00,
      platform_commission: 288.00, // 12%
      payment_method: 'card',
      status: 'success'
    });
    console.log('  ✓ Reserva 3: Departamento Centro Tijuana (Completada)');

    // Reserva 4 - Pendiente
    const booking4 = await Booking.create({
      property_id: property4.id,
      guest_id: guest1.id,
      check_in_date: '2025-12-25',
      check_out_date: '2025-12-30',
      total_guests: 8,
      total_price: 29000.00,
      payment_status: 'pending',
      booking_status: 'pending',
      stripe_payment_intent_id: 'pi_test_456789'
    });
    console.log('  ✓ Reserva 4: Villa de Lujo La Misión (Pendiente)');

    // Reserva 5 - Cancelada
    const booking5 = await Booking.create({
      property_id: property1.id,
      guest_id: guest2.id,
      check_in_date: '2025-11-20',
      check_out_date: '2025-11-22',
      total_guests: 6,
      total_price: 5000.00,
      payment_status: 'cancelled',
      booking_status: 'cancelled',
      stripe_payment_intent_id: 'pi_test_567890',
      cancellation_reason: 'Cambio de planes',
      cancelled_at: new Date()
    });
    console.log('  ✓ Reserva 5: Casa Vista al Mar (Cancelada)');

    console.log('\n✅ Seed completado exitosamente!\n');
    console.log('📊 Resumen:');
    console.log('   - 6 usuarios (1 admin, 2 hosts, 3 guests)');
    console.log('   - 4 tipos de alojamiento');
    console.log('   - 5 propiedades');
    console.log('   - 12 servicios');
    console.log('   - 5 reservas con diferentes estados');
    console.log('   - 3 transacciones de pago\n');

    console.log('📝 Credenciales de prueba:');
    console.log('   Admin: admin@arroyoseco.com / Password123!');
    console.log('   Host: carlos.host@example.com / Password123!');
    console.log('   Guest: juan.guest@example.com / Password123!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log('👋 Conexión cerrada\n');
  }
}

completeSeed();
