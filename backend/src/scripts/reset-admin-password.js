require('dotenv').config();
const sequelize = require('../config/database');
const { User } = require('../models');

async function resetAdminPassword() {
  try {
    console.log('🔐 Reseteando contraseña del administrador...\n');

    await sequelize.authenticate();
    console.log('✅ Conexión establecida\n');

    // Buscar usuario admin
    const admin = await User.findOne({ where: { email: 'admin@arroyoseco.com' } });

    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      process.exit(1);
    }

    console.log('✅ Admin encontrado:', admin.email);
    console.log('   ID:', admin.id);
    console.log('   Nombre:', admin.full_name);
    console.log('   Rol:', admin.role);
    console.log('   Estado:', admin.status ? 'Activo' : 'Inactivo');

    // Actualizar contraseña (el hook beforeUpdate lo hasheará automáticamente)
    const newPassword = 'Admin123!';
    admin.password = newPassword;
    await admin.save();

    console.log('\n✅ Contraseña actualizada exitosamente');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email:', admin.email);
    console.log('   Contraseña:', newPassword);

    console.log('\n✅ ¡Ahora puedes iniciar sesión!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
