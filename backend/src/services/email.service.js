// backend/src/services/email.service.js

// Mock temporal - sin funcionalidad de email
class EmailService {
  async sendEmail() {
    console.log('Email service deshabilitado temporalmente');
    return { success: true };
  }
  
  async sendVerificationEmail() {
    console.log('Email de verificación deshabilitado');
    return { success: true };
  }
  
  async sendBookingConfirmation() {
    console.log('Email de confirmación deshabilitado');
    return { success: true };
  }
  
  async sendPasswordReset() {
    console.log('Email de reset deshabilitado');
    return { success: true };
  }


// Notificación de aprobación de propiedad
async sendPropertyApprovalNotification(host, property) {
  const subject = `¡Tu propiedad "${property.title}" ha sido aprobada!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">¡Buenas noticias, ${host.full_name}!</h2>
      
      <p>Tu propiedad <strong>"${property.title}"</strong> ha sido aprobada por nuestro equipo de administración.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Próximos pasos:</h3>
        <ol>
          <li>Ingresa a tu panel de propiedades</li>
          <li>Haz clic en "Anunciar" para publicar tu propiedad</li>
          <li>Tu propiedad será visible para todos los huéspedes</li>
        </ol>
      </div>
      
      <p>Una vez que la anuncies, comenzarás a recibir reservas.</p>
      
      <a href="${process.env.FRONTEND_URL}/host/properties" 
         style="display: inline-block; background-color: #4CAF50; color: white; 
                padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                margin: 20px 0;">
        Ver mis propiedades
      </a>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Si tienes alguna pregunta, no dudes en contactarnos.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Este es un correo automático de Arroyo Seco. Por favor no respondas a este mensaje.
      </p>
    </div>
  `;

  await this.sendEmail(host.email, subject, html);
}

// Notificación de rechazo de propiedad
async sendPropertyRejectionNotification(host, property, reason) {
  const subject = `Actualización sobre tu propiedad "${property.title}"`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Actualización sobre tu propiedad</h2>
      
      <p>Hola ${host.full_name},</p>
      
      <p>Lamentablemente, tu propiedad <strong>"${property.title}"</strong> no ha sido aprobada en esta ocasión.</p>
      
      <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">Motivo del rechazo:</h3>
        <p style="color: #856404; margin: 0;">${reason}</p>
      </div>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1976d2;">¿Qué puedes hacer?</h3>
        <ol style="color: #1976d2; margin: 0;">
          <li>Revisa los comentarios de nuestro equipo</li>
          <li>Realiza las correcciones necesarias</li>
          <li>Edita tu propiedad y solicita una nueva revisión</li>
        </ol>
      </div>
      
      <p>Estamos aquí para ayudarte a mejorar tu anuncio y tener éxito en la plataforma.</p>
      
      <a href="${process.env.FRONTEND_URL}/host/properties/${property.id}/edit" 
         style="display: inline-block; background-color: #2196F3; color: white; 
                padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                margin: 20px 0;">
        Editar mi propiedad
      </a>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Si tienes alguna duda sobre el rechazo, puedes contactar a nuestro equipo de soporte.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Este es un correo automático de Arroyo Seco. Por favor no respondas a este mensaje.
      </p>
    </div>
  `;

  await this.sendEmail(host.email, subject, html);
}

// Notificación de que la propiedad fue anunciada
async sendPropertyPublishedNotification(host, property, commissionInfo) {
  const subject = `¡Tu propiedad "${property.title}" ya está publicada!`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">¡Tu propiedad está en línea!</h2>
      
      <p>Hola ${host.full_name},</p>
      
      <p>Tu propiedad <strong>"${property.title}"</strong> ahora está visible para todos los huéspedes en Arroyo Seco.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles de tu anuncio:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Precio por noche:</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">
              $${commissionInfo.pricePerNight.toFixed(2)} MXN
            </td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Comisión de plataforma (${commissionInfo.commissionPercentage}%):</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right; color: #f44336;">
              -$${commissionInfo.platformCommission.toFixed(2)} MXN
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 8px;"><strong>Tus ganancias por noche:</strong></td>
            <td style="padding: 12px 8px; text-align: right; color: #4CAF50; font-size: 18px;">
              <strong>$${commissionInfo.hostEarnings.toFixed(2)} MXN</strong>
            </td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1976d2;">Consejos para recibir más reservas:</h3>
        <ul style="color: #1976d2;">
          <li>Responde rápidamente a las consultas</li>
          <li>Mantén tu calendario actualizado</li>
          <li>Actualiza las fotos regularmente</li>
          <li>Ofrece precios competitivos</li>
        </ul>
      </div>
      
      <a href="${process.env.FRONTEND_URL}/properties/${property.id}" 
         style="display: inline-block; background-color: #4CAF50; color: white; 
                padding: 12px 30px; text-decoration: none; border-radius: 5px; 
                margin: 20px 0;">
        Ver mi anuncio
      </a>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        ¡Mucha suerte con tus reservas!
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
      <p style="color: #999; font-size: 12px;">
        Este es un correo automático de Arroyo Seco. Por favor no respondas a este mensaje.
      </p>
    </div>
  `;

  await this.sendEmail(host.email, subject, html);
}





}

module.exports = new EmailService();