require('dotenv').config();
const sequelize = require('../config/database');

async function resetDatabase() {
  try {
    console.log('🗑️  Iniciando limpieza de la base de datos...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Eliminar todas las tablas en el orden correcto (respetando foreign keys)
    console.log('\n📋 Eliminando tablas...');

    const dropQueries = [
      'DROP TABLE IF EXISTS reviews CASCADE;',
      'DROP TABLE IF EXISTS payment_transactions CASCADE;',
      'DROP TABLE IF EXISTS bookings CASCADE;',
      'DROP TABLE IF EXISTS property_service_relations CASCADE;',
      'DROP TABLE IF EXISTS property_availability CASCADE;',
      'DROP TABLE IF EXISTS property_images CASCADE;',
      'DROP TABLE IF EXISTS properties CASCADE;',
      'DROP TABLE IF EXISTS services CASCADE;',
      'DROP TABLE IF EXISTS accommodation_types CASCADE;',
      'DROP TABLE IF EXISTS user_verification_codes CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP FUNCTION IF EXISTS set_first_user_as_admin() CASCADE;',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;'
    ];

    for (const query of dropQueries) {
      await sequelize.query(query);
      console.log(`✓ ${query.split(' ')[4] || 'Function'} eliminada`);
    }

    console.log('\n✅ Todas las tablas han sido eliminadas');
    console.log('\n📝 Ahora ejecuta el archivo SQL para recrear las tablas:');
    console.log('   psql -h 164.90.144.13 -U mariana_dev -d db_arroyoseco_app -f database/db_arroyoseco_app.sql');
    console.log('\n   O ejecuta manualmente las queries del archivo db_arroyoseco_app.sql');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log('\n👋 Conexión cerrada');
  }
}

resetDatabase();
