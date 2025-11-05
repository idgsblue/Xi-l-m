require('dotenv').config();
const sequelize = require('../config/database');

async function checkData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Consultas para verificar cada tabla
    const queries = [
      { name: 'Usuarios', query: 'SELECT COUNT(*) FROM users;' },
      { name: 'Tipos de Alojamiento', query: 'SELECT COUNT(*) FROM accommodation_types;' },
      { name: 'Propiedades', query: 'SELECT COUNT(*) FROM properties;' },
      { name: 'Imágenes de Propiedades', query: 'SELECT COUNT(*) FROM property_images;' },
      { name: 'Servicios', query: 'SELECT COUNT(*) FROM services;' },
      { name: 'Relaciones Propiedad-Servicio', query: 'SELECT COUNT(*) FROM property_service_relations;' },
      { name: 'Reservas', query: 'SELECT COUNT(*) FROM bookings;' },
      { name: 'Transacciones de Pago', query: 'SELECT COUNT(*) FROM payment_transactions;' },
      { name: 'Reseñas', query: 'SELECT COUNT(*) FROM reviews;' }
    ];

    console.log('📊 Conteo de registros por tabla:\n');

    for (const { name, query } of queries) {
      try {
        const [results] = await sequelize.query(query);
        const count = results[0].count;
        console.log(`  ${name}: ${count} registros`);
      } catch (error) {
        console.log(`  ${name}: Error - ${error.message}`);
      }
    }

    // Detalles de usuarios
    console.log('\n👥 Detalles de Usuarios:\n');
    const [users] = await sequelize.query(
      'SELECT id, email, full_name, role, status FROM users ORDER BY id;'
    );

    users.forEach(user => {
      console.log(`  [${user.id}] ${user.full_name} (${user.email}) - Rol: ${user.role} - Activo: ${user.status}`);
    });

    // Detalles de propiedades
    console.log('\n🏠 Detalles de Propiedades:\n');
    const [properties] = await sequelize.query(`
      SELECT p.id, p.title, p.location, p.price_per_night, p.status, u.full_name as host_name
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      ORDER BY p.id;
    `);

    properties.forEach(prop => {
      console.log(`  [${prop.id}] ${prop.title} - ${prop.location}`);
      console.log(`       Host: ${prop.host_name} | Precio: $${prop.price_per_night}/noche | Estado: ${prop.status}`);
    });

    // Detalles de reservas
    console.log('\n📅 Detalles de Reservas:\n');
    const [bookings] = await sequelize.query(`
      SELECT b.id, p.title as property_title, u.full_name as guest_name,
             b.check_in_date, b.check_out_date, b.booking_status, b.payment_status
      FROM bookings b
      LEFT JOIN properties p ON b.property_id = p.id
      LEFT JOIN users u ON b.guest_id = u.id
      ORDER BY b.id;
    `);

    if (bookings.length > 0) {
      bookings.forEach(booking => {
        console.log(`  [${booking.id}] ${booking.property_title}`);
        console.log(`       Huésped: ${booking.guest_name}`);
        console.log(`       Fechas: ${booking.check_in_date} → ${booking.check_out_date}`);
        console.log(`       Estado: ${booking.booking_status} | Pago: ${booking.payment_status}\n`);
      });
    } else {
      console.log('  No hay reservas registradas');
    }

    console.log('\n✅ Verificación completada\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log('👋 Conexión cerrada\n');
  }
}

checkData();
