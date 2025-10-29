const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendBookingConfirmation(booking, guest, property) {
    const mailOptions = {
      from: `"Arroyo Seco" <${process.env.EMAIL_USER}>`,
      to: guest.email,
      subject: 'Confirmación de Reserva - Arroyo Seco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50;">¡Reserva Confirmada!</h1>
          <p>Hola ${guest.name},</p>
          <p>Tu reserva ha sido confirmada con éxito.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #34495e;">Detalles de la Reserva</h2>
            <p><strong>Propiedad:</strong> ${property.name}</p>
            <p><strong>Dirección:</strong> ${property.address}</p>
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut}</p>
            <p><strong>Huéspedes:</strong> ${booking.numberOfGuests}</p>
            <p><strong>Total:</strong> $${booking.totalPrice} MXN</p>
            <p><strong>Código de reserva:</strong> #${booking.id}</p>
          </div>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>¡Esperamos que disfrutes tu estadía!</p>
          
          <hr style="border: 1px solid #e0e0e0; margin: 30px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">
            Este es un correo automático, por favor no responder.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✉️ Email de confirmación enviado a:', guest.email);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  async sendBookingNotificationToHost(booking, host, property, guest) {
    const mailOptions = {
      from: `"Arroyo Seco" <${process.env.EMAIL_USER}>`,
      to: host.email,
      subject: 'Nueva Reserva Recibida - Arroyo Seco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #27ae60;">¡Nueva Reserva!</h1>
          <p>Hola ${host.name},</p>
          <p>Has recibido una nueva reserva para tu propiedad.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #34495e;">Información de la Reserva</h2>
            <p><strong>Propiedad:</strong> ${property.name}</p>
            <p><strong>Huésped:</strong> ${guest.name}</p>
            <p><strong>Email:</strong> ${guest.email}</p>
            <p><strong>Teléfono:</strong> ${guest.phone || 'No proporcionado'}</p>
            <p><strong>Check-in:</strong> ${booking.checkIn}</p>
            <p><strong>Check-out:</strong> ${booking.checkOut}</p>
            <p><strong>Huéspedes:</strong> ${booking.numberOfGuests}</p>
            <p><strong>Total:</strong> $${booking.totalPrice} MXN</p>
          </div>
          
          <p>Ingresa a tu panel de control para ver más detalles.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✉️ Notificación enviada al anfitrión:', host.email);
    } catch (error) {
      console.error('Error enviando notificación:', error);
    }
  }

  async sendPropertyApproval(property, host, approved, reason = null) {
    const status = approved ? 'Aprobada' : 'Rechazada';
    const color = approved ? '#27ae60' : '#e74c3c';
    
    const mailOptions = {
      from: `"Arroyo Seco" <${process.env.EMAIL_USER}>`,
      to: host.email,
      subject: `Propiedad ${status} - Arroyo Seco`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: ${color};">Propiedad ${status}</h1>
          <p>Hola ${host.name},</p>
          <p>Tu propiedad "${property.name}" ha sido ${status.toLowerCase()}.</p>
          
          ${!approved && reason ? `
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Razón:</strong> ${reason}</p>
            </div>
          ` : ''}
          
          ${approved ? `
            <p>¡Tu propiedad ya está visible para los huéspedes!</p>
            <p>Puedes administrarla desde tu panel de control.</p>
          ` : `
            <p>Puedes corregir los problemas mencionados y volver a enviar tu propiedad para aprobación.</p>
          `}
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando email de aprobación:', error);
    }
  }

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"Arroyo Seco" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Recuperación de Contraseña - Arroyo Seco',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Recupera tu Contraseña</h1>
          <p>Hola ${user.name},</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error enviando email de recuperación:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();