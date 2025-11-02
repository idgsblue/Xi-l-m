-- Creación de Base de Datos
CREATE DATABASE arroyo_seco_reservations;

-- Cambiar a la base de datos
\c arroyo_seco_reservations;

-- Tabla de Usuarios
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- MEJORA 2
    last_login TIMESTAMP
);

-- Tabla de Tipos de Alojamiento
CREATE TABLE accommodation_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_price DECIMAL(10,2),
    max_price DECIMAL(10,2),
    platform_commission_percentage DECIMAL(5,2)
);

-- Tabla de Propiedades
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    host_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- MEJORA 3
    title VARCHAR(255) NOT NULL,
    description TEXT,
    accommodation_type_id INTEGER REFERENCES accommodation_types(id) ON DELETE SET NULL,  -- MEJORA 3
    price_per_night DECIMAL(10,2) NOT NULL,
    location VARCHAR(255),
    capacity INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('inactive', 'published', 'blocked')),
    is_advertised BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- MEJORA 2
);

-- Tabla de Imágenes de Propiedades
CREATE TABLE property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,  -- MEJORA 3
    image_url VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE
);

-- Tabla de Disponibilidad de Propiedades
CREATE TABLE property_availability (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,  -- MEJORA 3
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    UNIQUE(property_id, date)
);

-- MEJORA 7: Tabla de Servicios
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT
);

-- MEJORA 7: Tabla de Relación Propiedades-Servicios
CREATE TABLE property_service_relations (
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,  -- MEJORA 3
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,  -- MEJORA 3
    PRIMARY KEY (property_id, service_id)
);

-- Tabla de Reservas
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,  -- MEJORA 3
    guest_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- MEJORA 3
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_guests INTEGER NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
    booking_status VARCHAR(20) CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    stripe_payment_intent_id VARCHAR(255),
    cancellation_reason TEXT,  -- MEJORA 6
    cancelled_at TIMESTAMP,  -- MEJORA 6
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- MEJORA 2
    CONSTRAINT check_dates CHECK (check_out_date > check_in_date)  -- MEJORA 4
);

-- Tabla de Transacciones de Pago
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,  -- MEJORA 3
    amount DECIMAL(10,2) NOT NULL,
    platform_commission DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending'))
);

-- Tabla de Reseñas
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,  -- MEJORA 3
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para manejar la validación de email y la recuperación de contraseñas mediante códigos
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


-- Trigger para manejar el primer usuario como admin
CREATE OR REPLACE FUNCTION set_first_user_as_admin()
RETURNS TRIGGER AS $$
DECLARE
    admin_count INTEGER;
BEGIN
    -- Verificar cuántos usuarios admin existen
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'admin';
    
    -- Si es el primer usuario y no hay admins, establecerlo como admin
    IF admin_count = 0 THEN
        NEW.role := 'admin';
        NEW.is_first_user := TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER first_user_admin_trigger
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION set_first_user_as_admin();

-- MEJORA 2: Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para optimización
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_host ON properties(host_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_user_codes_user_id_type ON user_verification_codes(user_id, code_type);


-- MEJORA 5: Índice compuesto para disponibilidad
CREATE INDEX idx_availability_property_date ON property_availability(property_id, date, is_available);

-- MEJORA 7: Índice para servicios
CREATE INDEX idx_property_services ON property_service_relations(property_id);

-- Datos iniciales de ejemplo para servicios (MEJORA 7)
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

-- Comentarios en las tablas para documentación
COMMENT ON TABLE users IS 'Tabla principal de usuarios del sistema (huéspedes, anfitriones y administradores)';
COMMENT ON TABLE properties IS 'Propiedades/alojamientos publicados por los anfitriones';
COMMENT ON TABLE bookings IS 'Registro de todas las reservas realizadas';
COMMENT ON TABLE reviews IS 'Reseñas y calificaciones de los huéspedes';
COMMENT ON TABLE services IS 'Catálogo de servicios disponibles para las propiedades';
COMMENT ON TABLE property_service_relations IS 'Relación muchos a muchos entre propiedades y servicios';