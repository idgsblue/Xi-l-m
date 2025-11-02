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
}

module.exports = new EmailService();