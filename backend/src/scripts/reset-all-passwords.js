require('dotenv').config();
const sequelize = require('../config/database');
const { User } = require('../models');

async function resetAllPasswords() {
  try {
    console.log('🔐 Reseteando contraseñas de todos los usuarios...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Definir contraseñas simples para cada tipo de usuario
    const passwordUpdates = [
      { email: 'admin@arroyoseco.com', password: 'Admin123!', role: 'Admin' },
      { email: 'carlos.host@example.com', password: 'Host123!', role: 'Host' },
      { email: 'maria.host@example.com', password: 'Host123!', role: 'Host' },
      { email: 'juan.guest@example.com', password: 'Guest123!', role: 'Guest' },
      { email: 'ana.guest@example.com', password: 'Guest123!', role: 'Guest' },
      { email: 'pedro.guest@example.com', password: 'Guest123!', role: 'Guest' }
    ];

    console.log('📝 Actualizando contraseñas...\n');

    for (const update of passwordUpdates) {
      const user = await User.findOne({ where: { email: update.email } });

      if (user) {
        user.password = update.password;
        await user.save();
        console.log(`✅ ${update.role.padEnd(7)} - ${update.email.padEnd(30)} -> ${update.password}`);
      } else {
        console.log(`⚠️  ${update.role.padEnd(7)} - ${update.email.padEnd(30)} -> No encontrado`);
      }
    }

    console.log('\n✅ Contraseñas actualizadas exitosamente');
    console.log('\n📋 Resumen de credenciales:\n');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ ADMIN                                                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email:    admin@arroyoseco.com                              │');
    console.log('│ Password: Admin123!                                         │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ HOSTS                                                       │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email:    carlos.host@example.com                           │');
    console.log('│ Email:    maria.host@example.com                            │');
    console.log('│ Password: Host123!                                          │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ GUESTS                                                      │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ Email:    juan.guest@example.com                            │');
    console.log('│ Email:    ana.guest@example.com                             │');
    console.log('│ Email:    pedro.guest@example.com                           │');
    console.log('│ Password: Guest123!                                         │');
    console.log('└─────────────────────────────────────────────────────────────┘');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAllPasswords();
