# 🔒 Documentación de Seguridad - Arroyo Seco Backend

## Fecha de implementación: 2025
## Versión: 2.0

---

## 📋 Resumen Ejecutivo

Este documento detalla todas las medidas de seguridad implementadas en el backend de Arroyo Seco para proteger contra vulnerabilidades OWASP Top 10 y otros ataques comunes.

---

## 🛡️ Protecciones Implementadas

### 1. ✅ Protección contra Inyección SQL

**Estado:** PROTEGIDO

**Implementación:**
- Uso de Sequelize ORM para todas las consultas a la base de datos
- Queries parametrizadas automáticamente
- Sin concatenación de strings en consultas SQL
- Validación de tipos de datos a nivel de modelo

**Archivos:**
- `src/models/*.model.js` - Definición de modelos con validación
- Todos los controladores usan métodos ORM seguros

**Ejemplo:**
```javascript
// ✅ SEGURO - Sequelize ORM
const user = await User.findOne({ where: { email } });

// ❌ INSEGURO - NO hacer esto
// const query = `SELECT * FROM users WHERE email = '${email}'`;
```

---

### 2. ✅ Protección contra XSS (Cross-Site Scripting)

**Estado:** PROTEGIDO

**Implementación:**
- Middleware de sanitización personalizado
- Eliminación de scripts maliciosos en inputs
- Eliminación de event handlers HTML
- Protección contra prototype pollution
- Headers HTTP de seguridad con Helmet

**Archivos:**
- `src/middleware/sanitization.middleware.js` - Sanitización de inputs
- `src/config/security.config.js` - Configuración de headers CSP

**Sanitización aplicada a:**
- `req.body`
- `req.query`
- `req.params`

**Características:**
- Elimina tags `<script>`, `<iframe>`
- Elimina URLs `javascript:`
- Elimina event handlers (`onclick`, `onerror`, etc.)
- Previene prototype pollution (`__proto__`, `constructor`)

---

### 3. ✅ Protección contra CSRF (Cross-Site Request Forgery)

**Estado:** PROTEGIDO

**Implementación:**
- Configuración CORS estricta con whitelist
- Validación de origen de requests
- Tokens JWT con validación estricta

**Archivos:**
- `src/config/security.config.js` - Configuración CORS
- `src/app.js` - Aplicación de CORS

**Orígenes permitidos:**
- `http://localhost:3000` (desarrollo)
- `https://xilmq.com` (producción)
- `capacitor://localhost` (apps móviles)

---

### 4. ✅ Rate Limiting (Prevención de Fuerza Bruta)

**Estado:** PROTEGIDO

**Implementación:**
- Rate limiters específicos por tipo de endpoint
- Protección contra ataques de fuerza bruta
- Límites configurables por ventana de tiempo

**Archivos:**
- `src/middleware/rateLimiter.middleware.js`

**Límites configurados:**

| Endpoint | Límite | Ventana | Descripción |
|----------|--------|---------|-------------|
| General | 100 req | 15 min | Límite global |
| Login | 5 intentos | 15 min | Prevenir fuerza bruta |
| Registro | 3 registros | 1 hora | Prevenir spam |
| Password Reset | 3 intentos | 1 hora | Prevenir abuso |
| Creación recursos | 10 recursos | 1 hora | Prevenir spam |
| Upload archivos | 20 uploads | 15 min | Prevenir abuso |

**Aplicación:**
```javascript
// Rutas de autenticación
router.post('/login', authLimiter, ...);
router.post('/register', registerLimiter, ...);
router.post('/forgot-password', passwordResetLimiter, ...);

// Rutas de upload
router.post('/upload', uploadLimiter, ...);
```

---

### 5. ✅ Seguridad en Autenticación y JWT

**Estado:** PROTEGIDO

**Implementación:**
- JWT con secretos fuertes (mínimo 32 caracteres)
- Access tokens de corta duración (30 min)
- Refresh tokens de larga duración (7 días)
- Secretos diferentes para access y refresh tokens
- Validación de tokens en cada request
- Verificación de estado de usuario activo

**Archivos:**
- `src/services/jwt.service.js` - Generación y validación JWT
- `src/middleware/auth.middleware.js` - Middleware de autenticación

**Características:**
- Tokens firmados con HS256
- Expiración automática
- Validación de usuario activo
- No se almacenan tokens en BD (stateless)

**Contraseñas:**
- Hash con bcrypt (salt rounds: 10)
- Validación de complejidad:
  - Mínimo 6 caracteres
  - Debe contener letras y números
- No se exponen contraseñas en responses

---

### 6. ✅ Seguridad en Subida de Archivos

**Estado:** PROTEGIDO

**Implementación:**
- Validación estricta de tipos MIME
- Verificación de magic bytes (firmas de archivo)
- Whitelist de extensiones permitidas
- Límites de tamaño de archivo (5MB)
- Sanitización de nombres de archivo
- Prevención de path traversal

**Archivos:**
- `src/middleware/fileUpload.middleware.js`
- `src/routes/upload.routes.js`

**Tipos permitidos:**
- JPEG (.jpg, .jpeg) - Magic bytes: FFD8FFE0/E1/E2
- PNG (.png) - Magic bytes: 89504E47
- GIF (.gif) - Magic bytes: 47494638
- WebP (.webp) - Magic bytes: 52494646

**Validaciones:**
1. Extensión de archivo (whitelist)
2. Tipo MIME (whitelist)
3. Coherencia extensión-MIME
4. Magic bytes del contenido
5. Tamaño máximo (5MB por archivo)
6. Máximo 5 archivos por request

**Protecciones contra:**
- Upload de scripts ejecutables
- MIME type spoofing
- Path traversal attacks
- Archivos maliciosos

---

### 7. ✅ Headers HTTP de Seguridad (Helmet)

**Estado:** PROTEGIDO

**Implementación:**
- Helmet con configuración personalizada
- Content Security Policy (CSP)
- HSTS en producción
- Protección contra clickjacking

**Archivos:**
- `src/config/security.config.js`

**Headers implementados:**

| Header | Valor | Propósito |
|--------|-------|-----------|
| X-Frame-Options | DENY | Prevenir clickjacking |
| X-Content-Type-Options | nosniff | Prevenir MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS básico |
| X-DNS-Prefetch-Control | off | Prevenir fugas DNS |
| Strict-Transport-Security | max-age=31536000 | Forzar HTTPS |
| Content-Security-Policy | (configurado) | Controlar recursos |
| Referrer-Policy | strict-origin | Controlar referer |
| Permissions-Policy | (restrictivo) | Deshabilitar features |

---

### 8. ✅ Protección contra NoSQL Injection

**Estado:** PROTEGIDO

**Implementación:**
- Detección de operadores MongoDB ($, {)
- Sanitización de objetos recursiva
- Validación de patrones de inyección

**Archivos:**
- `src/middleware/sanitization.middleware.js`

**Nota:** Aunque usamos PostgreSQL (SQL), la protección previene inyección en objetos JavaScript.

---

### 9. ✅ Protección contra HTTP Parameter Pollution

**Estado:** PROTEGIDO

**Implementación:**
- Middleware HPP
- Prevención de duplicación de parámetros

**Archivos:**
- `src/app.js` - Uso de `hpp()`

---

### 10. ✅ Límites de Payload

**Estado:** PROTEGIDO

**Implementación:**
- Límite de tamaño de JSON: 10MB
- Límite de URL encoded: 10MB
- Prevención de ataques DoS por payload grande

**Archivos:**
- `src/app.js`

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 📁 Estructura de Archivos de Seguridad

```
backend/
├── src/
│   ├── config/
│   │   └── security.config.js          # Configuración de seguridad (Helmet, CORS)
│   │
│   ├── middleware/
│   │   ├── rateLimiter.middleware.js   # Rate limiting por tipo de endpoint
│   │   ├── sanitization.middleware.js  # Sanitización contra XSS/injection
│   │   ├── fileUpload.middleware.js    # Validación segura de uploads
│   │   ├── auth.middleware.js          # Autenticación JWT
│   │   └── errorHandler.middleware.js  # Manejo seguro de errores
│   │
│   └── app.js                          # Configuración principal con middleware
│
├── .env.example                        # Template con notas de seguridad
└── SECURITY.md                         # Este documento
```

---

## 🚀 Uso y Configuración

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
cp .env.example .env
```

**Variables críticas:**

```env
# Genera secretos fuertes (32+ caracteres)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Configuración de entorno
NODE_ENV=production  # En producción
```

### 2. Instalación de Dependencias

```bash
npm install
```

**Dependencias de seguridad:**
- `helmet` - Headers HTTP seguros
- `express-rate-limit` - Rate limiting
- `hpp` - Protección contra parameter pollution
- `bcrypt` - Hash de contraseñas
- `jsonwebtoken` - Tokens JWT
- `express-validator` - Validación de inputs

### 3. Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
NODE_ENV=production npm start
```

---

## ⚠️ Advertencias de Seguridad

Al iniciar el servidor, verás advertencias si:

1. ❌ Faltan variables de entorno críticas
2. ❌ JWT_SECRET tiene menos de 32 caracteres
3. ❌ JWT_SECRET y REFRESH_SECRET son iguales
4. ⚠️ NODE_ENV no está en modo producción

**Ejemplo de salida:**

```
✅ Modo de producción activado con configuraciones de seguridad reforzadas
```

O en desarrollo:

```
ℹ️  Modo de desarrollo - Algunas protecciones están relajadas
```

---

## 🔍 Testing de Seguridad

### Probar Rate Limiting

```bash
# Intentar 6 logins seguidos (debería bloquear el 6to)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### Probar Sanitización XSS

```bash
# Intentar inyectar script
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"<script>alert(1)</script>",
    "email":"test@test.com",
    "password":"test123"
  }'

# El nombre debería ser sanitizado
```

### Probar Upload de Archivo Malicioso

```bash
# Intentar subir archivo no-imagen
curl -X POST http://localhost:5000/api/upload/single \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@malicious.exe"

# Debería rechazarse por tipo MIME inválido
```

---

## 📊 Checklist de Seguridad OWASP Top 10

| # | Vulnerabilidad | Estado | Protección |
|---|----------------|--------|------------|
| 1 | Injection (SQL, NoSQL) | ✅ | Sequelize ORM + Sanitización |
| 2 | Broken Authentication | ✅ | JWT + bcrypt + Rate limiting |
| 3 | Sensitive Data Exposure | ✅ | HTTPS + Headers + No logs sensibles |
| 4 | XML External Entities | N/A | No usamos XML |
| 5 | Broken Access Control | ✅ | Middleware de roles + Validación |
| 6 | Security Misconfiguration | ✅ | Helmet + Validación de .env |
| 7 | XSS | ✅ | Sanitización + CSP + Headers |
| 8 | Insecure Deserialization | ✅ | Validación de JSON + Límites |
| 9 | Using Components with Known Vulnerabilities | ⚠️ | Actualizar con `npm audit` |
| 10 | Insufficient Logging & Monitoring | ⚠️ | Mejorar logs (TODO) |

---

## 🔄 Mantenimiento de Seguridad

### Actualización de Dependencias

```bash
# Revisar vulnerabilidades
npm audit

# Actualizar dependencias con fixes automáticos
npm audit fix

# Revisar actualizaciones mayores
npm outdated
```

### Rotación de Secretos

**Frecuencia recomendada:** Cada 90 días

1. Generar nuevos secretos JWT
2. Actualizar variables de entorno
3. Reiniciar servidor
4. Los tokens antiguos expirarán automáticamente

### Monitoreo de Logs

Revisar logs periódicamente para detectar:
- Intentos de login fallidos
- Rate limiting activado
- Errores de validación inusuales
- Intentos de inyección

---

## 📞 Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad:

1. **NO** abras un issue público
2. Contacta directamente al equipo
3. Proporciona detalles del problema
4. Espera respuesta en 48 horas

---

## 📝 Changelog de Seguridad

### Versión 2.0 (2025-01-21)

**Mejoras implementadas:**
- ✅ Rate limiting granular por tipo de endpoint
- ✅ Sanitización avanzada contra XSS
- ✅ Validación robusta de uploads con magic bytes
- ✅ Headers HTTP de seguridad con Helmet
- ✅ Protección contra parameter pollution
- ✅ Validación de entorno al inicio
- ✅ Documentación completa de seguridad

**Dependencias añadidas:**
- helmet@8.1.0
- express-rate-limit@8.2.1
- hpp@0.2.3

### Versión 1.0 (Inicial)

- Autenticación JWT básica
- Hash de contraseñas con bcrypt
- Sequelize ORM
- CORS básico

---

## 🎯 Próximas Mejoras (TODO)

### Corto Plazo
- [ ] Implementar sistema de logging robusto (Winston/Pino)
- [ ] Monitoreo de intentos de ataque
- [ ] 2FA (Two-Factor Authentication)
- [ ] Captcha en formularios públicos

### Mediano Plazo
- [ ] WAF (Web Application Firewall)
- [ ] Sistema de alertas de seguridad
- [ ] Auditorías de seguridad automatizadas
- [ ] Penetration testing

### Largo Plazo
- [ ] Bug bounty program
- [ ] Certificaciones de seguridad
- [ ] Compliance GDPR/PCI-DSS

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

**Última actualización:** 2025-01-21
**Mantenido por:** Equipo de Desarrollo Arroyo Seco
**Versión del documento:** 2.0
