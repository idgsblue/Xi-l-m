require('dotenv').config();
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

async function recreateDatabase() {
  try {
    console.log('🔄 Recreando base de datos desde cero...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // ========== PASO 1: ELIMINAR TABLAS EXISTENTES ==========
    console.log('🗑️  PASO 1: Eliminando tablas existentes...');

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
      const tableName = query.match(/DROP \w+ IF EXISTS (\w+)/)?.[1] || 'Item';
      console.log(`  ✓ ${tableName} eliminado`);
    }

    console.log('\n✅ Tablas eliminadas correctamente\n');

    // ========== PASO 2: RECREAR TABLAS ==========
    console.log('📋 PASO 2: Recreando tablas...\n');

    // Tabla de Usuarios
    await sequelize.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) CHECK (role IN ('guest', 'host', 'admin')),
        is_first_user BOOLEAN DEFAULT FALSE,
        status BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('  ✓ Tabla users creada');

    // Tabla de Tipos de Alojamiento
    await sequelize.query(`
      CREATE TABLE accommodation_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        min_price DECIMAL(10,2),
        max_price DECIMAL(10,2),
        platform_commission_percentage DECIMAL(5,2)
      );
    `);
    console.log('  ✓ Tabla accommodation_types creada');

    // Tabla de Propiedades
    await sequelize.query(`
      CREATE TABLE properties (
        id SERIAL PRIMARY KEY,
        host_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        accommodation_type_id INTEGER REFERENCES accommodation_types(id) ON DELETE SET NULL,
        price_per_night DECIMAL(10,2) NOT NULL,
        location VARCHAR(255),
        capacity INTEGER NOT NULL,
        status VARCHAR(20) CHECK (status IN ('inactive', 'published', 'blocked')),
        is_advertised BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Tabla properties creada');

    // Tabla de Imágenes de Propiedades
    await sequelize.query(`
      CREATE TABLE property_images (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        is_main BOOLEAN DEFAULT FALSE
      );
    `);
    console.log('  ✓ Tabla property_images creada');

    // Tabla de Disponibilidad de Propiedades
    await sequelize.query(`
      CREATE TABLE property_availability (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        UNIQUE(property_id, date)
      );
    `);
    console.log('  ✓ Tabla property_availability creada');

    // Tabla de Servicios
    await sequelize.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        icon VARCHAR(50),
        description TEXT
      );
    `);
    console.log('  ✓ Tabla services creada');

    // Tabla de Relación Propiedades-Servicios
    await sequelize.query(`
      CREATE TABLE property_service_relations (
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
        PRIMARY KEY (property_id, service_id)
      );
    `);
    console.log('  ✓ Tabla property_service_relations creada');

    // Tabla de Reservas
    await sequelize.query(`
      CREATE TABLE bookings (
        id SERIAL PRIMARY KEY,
        property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
        guest_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        check_in_date DATE NOT NULL,
        check_out_date DATE NOT NULL,
        total_guests INTEGER NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
        booking_status VARCHAR(20) CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
        stripe_payment_intent_id VARCHAR(255),
        cancellation_reason TEXT,
        cancelled_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT check_dates CHECK (check_out_date > check_in_date)
      );
    `);
    console.log('  ✓ Tabla bookings creada');

    // Tabla de Transacciones de Pago
    await sequelize.query(`
      CREATE TABLE payment_transactions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
        amount DECIMAL(10,2) NOT NULL,
        platform_commission DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending'))
      );
    `);
    console.log('  ✓ Tabla payment_transactions creada');

    // Tabla de Reseñas
    await sequelize.query(`
      CREATE TABLE reviews (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ Tabla reviews creada');

    // Tabla para validación de email y recuperación de contraseñas
    await sequelize.query(`
      CREATE TABLE user_verification_codes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        code_type VARCHAR(50) NOT NULL CHECK (code_type IN ('email_verification', 'password_reset')),
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, code_type)
      );
    `);
    console.log('  ✓ Tabla user_verification_codes creada');

    // ========== PASO 3: CREAR TRIGGERS ==========
    console.log('\n⚙️  PASO 3: Creando triggers...\n');

    // Trigger para primer usuario como admin
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION set_first_user_as_admin()
      RETURNS TRIGGER AS $$
      DECLARE
        admin_count INTEGER;
      BEGIN
        SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
        IF admin_count = 0 THEN
          NEW.role := 'admin';
          NEW.is_first_user := TRUE;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await sequelize.query(`
      CREATE TRIGGER first_user_admin_trigger
      BEFORE INSERT ON users
      FOR EACH ROW
      EXECUTE FUNCTION set_first_user_as_admin();
    `);
    console.log('  ✓ Trigger first_user_admin_trigger creado');

    // Trigger para updated_at
    await sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await sequelize.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('  ✓ Trigger update_users_updated_at creado');

    await sequelize.query(`
      CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('  ✓ Trigger update_properties_updated_at creado');

    await sequelize.query(`
      CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('  ✓ Trigger update_bookings_updated_at creado');

    // ========== PASO 4: CREAR ÍNDICES ==========
    console.log('\n📇 PASO 4: Creando índices...\n');

    await sequelize.query('CREATE INDEX idx_users_email ON users(email);');
    console.log('  ✓ Índice idx_users_email creado');

    await sequelize.query('CREATE INDEX idx_properties_host ON properties(host_id);');
    console.log('  ✓ Índice idx_properties_host creado');

    await sequelize.query('CREATE INDEX idx_bookings_property ON bookings(property_id);');
    console.log('  ✓ Índice idx_bookings_property creado');

    await sequelize.query('CREATE INDEX idx_bookings_guest ON bookings(guest_id);');
    console.log('  ✓ Índice idx_bookings_guest creado');

    await sequelize.query('CREATE INDEX idx_user_codes_user_id_type ON user_verification_codes(user_id, code_type);');
    console.log('  ✓ Índice idx_user_codes_user_id_type creado');

    await sequelize.query('CREATE INDEX idx_availability_property_date ON property_availability(property_id, date, is_available);');
    console.log('  ✓ Índice idx_availability_property_date creado');

    await sequelize.query('CREATE INDEX idx_property_services ON property_service_relations(property_id);');
    console.log('  ✓ Índice idx_property_services creado');

    // ========== PASO 5: INSERTAR SERVICIOS INICIALES ==========
    console.log('\n⚙️  PASO 5: Insertando servicios iniciales...\n');

    await sequelize.query(`
      INSERT INTO services (name, icon, description) VALUES
      ('WiFi', 'wifi', 'Internet inalámbrico de alta velocidad'),
      ('Piscina', 'pool', 'Piscina privada o compartida'),
      ('Estacionamiento', 'car', 'Espacio de estacionamiento gratuito'),
      ('Cocina', 'kitchen', 'Cocina equipada completa'),
      ('Aire Acondicionado', 'ac_unit', 'Climatización en todas las habitaciones'),
      ('TV', 'tv', 'Televisión por cable o streaming'),
      ('Lavadora', 'washing_machine', 'Lavadora disponible'),
      ('Calefacción', 'heat', 'Sistema de calefacción'),
      ('Área de trabajo', 'desk', 'Espacio dedicado para trabajar'),
      ('Admite mascotas', 'pets', 'Se permiten mascotas'),
      ('Jardín', 'garden', 'Jardín o patio privado'),
      ('Parrilla', 'bbq', 'Asador o parrilla');
    `);
    console.log('  ✓ 12 servicios insertados');

    console.log('\n✅ ¡Base de datos recreada exitosamente!\n');
    console.log('📝 Siguiente paso: Ejecutar el seed para poblar con datos de prueba');
    console.log('   npm run seed:complete\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log('👋 Conexión cerrada\n');
  }
}

recreateDatabase();
