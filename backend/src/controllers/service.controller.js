
const { Service } = require('../models');

class ServiceController {
  // Obtener todos los servicios
  async getAll(req, res) {
    try {
      const services = await Service.findAll({
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        services
      });
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener los servicios'
      });
    }
  }

  // Obtener servicio por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const service = await Service.findByPk(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Servicio no encontrado'
        });
      }

      res.json({
        success: true,
        service
      });
    } catch (error) {
      console.error('Error al obtener servicio:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el servicio'
      });
    }
  }
}

module.exports = new ServiceController();