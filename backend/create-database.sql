-- Script para crear la base de datos arroyo_seco_app
-- Ejecutar como usuario con privilegios de creación de bases de datos

-- Crear la base de datos si no existe
CREATE DATABASE arroyo_seco_app
    WITH
    OWNER = mariana_dev
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE arroyo_seco_app TO mariana_dev;

-- Comentario
COMMENT ON DATABASE arroyo_seco_app IS 'Base de datos para la aplicación Arroyo Seco';
