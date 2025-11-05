require('dotenv').config();
const sequelize = require('../config/database');

async function truncateAll() {
  try {
    console.log('🗑️  Eliminando todos los datos de las tablas...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Truncar tablas en orden correcto (respetando foreign keys)
    // Sin RESTART IDENTITY para evitar problemas de permisos
    const truncateQueries = [
      'TRUNCATE TABLE reviews CASCADE;',
      'TRUNCATE TABLE payment_transactions CASCADE;',
      'TRUNCATE TABLE bookings CASCADE;',
      'TRUNCATE TABLE property_service_relations CASCADE;',
      'TRUNCATE TABLE property_availability CASCADE;',
      'TRUNCATE TABLE property_images CASCADE;',
      'TRUNCATE TABLE properties CASCADE;',
      'TRUNCATE TABLE accommodation_types CASCADE;',
      'TRUNCATE TABLE user_verification_codes CASCADE;',
      'TRUNCATE TABLE users CASCADE;',
      // No truncamos services porque vienen del schema SQL inicial
    ];

    console.log('📋 Eliminando datos...\n');
    for (const query of truncateQueries) {
      try {
        await sequelize.query(query);
        const tableName = query.match(/TRUNCATE TABLE (\w+)/)?.[1];
        console.log(`  ✓ ${tableName} - datos eliminados`);
      } catch (error) {
        const tableName = query.match(/TRUNCATE TABLE (\w+)/)?.[1];
        console.log(`  ⚠️  ${tableName} - ${error.message}`);
      }
    }

    console.log('\n✅ Datos eliminados correctamente');
    console.log('\n📝 Siguiente paso: Poblar con datos de prueba');
    console.log('   npm run seed:complete\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('👋 Conexión cerrada\n');
  }
}

truncateAll();
