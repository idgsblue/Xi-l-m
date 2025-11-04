const { AccommodationType, Property } = require('../models');
const { Op } = require('sequelize');

class AccommodationTypeController {
  // Listar todos los tipos de alojamiento
  async getAll(req, res, next) {
    try {
      const types = await AccommodationType.findAll({
        order: [['name', 'ASC']]
      });

      res.json({ 
        accommodationTypes: types,
        total: types.length 
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener un tipo por ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const type = await AccommodationType.findByPk(id);

      if (!type) {
        return res.status(404).json({ error: 'Tipo de alojamiento no encontrado' });
      }

      // Contar propiedades asociadas
      const propertyCount = await Property.count({
        where: { accommodation_type_id: id }
      });

      res.json({ 
        accommodationType: type,
        propertyCount 
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear nuevo tipo de alojamiento
  async create(req, res, next) {
    try {
      const { name, min_price, max_price, platform_commission_percentage } = req.body;

      // Validar que max_price > min_price
      if (max_price && min_price && parseFloat(max_price) <= parseFloat(min_price)) {
        return res.status(400).json({ 
          error: 'El precio máximo debe ser mayor al precio mínimo' 
        });
      }

      const type = await AccommodationType.create({
        name,
        min_price: min_price || null,
        max_price: max_price || null,
        platform_commission_percentage: platform_commission_percentage || null
      });

      res.status(201).json({
        message: 'Tipo de alojamiento creado exitosamente',
        accommodationType: type
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar tipo de alojamiento
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, min_price, max_price, platform_commission_percentage } = req.body;

      const type = await AccommodationType.findByPk(id);

      if (!type) {
        return res.status(404).json({ error: 'Tipo de alojamiento no encontrado' });
      }

      // Validar que max_price > min_price
      const newMinPrice = min_price !== undefined ? parseFloat(min_price) : parseFloat(type.min_price);
      const newMaxPrice = max_price !== undefined ? parseFloat(max_price) : parseFloat(type.max_price);

      if (newMaxPrice && newMinPrice && newMaxPrice <= newMinPrice) {
        return res.status(400).json({ 
          error: 'El precio máximo debe ser mayor al precio mínimo' 
        });
      }

      // Actualizar solo los campos enviados
      if (name !== undefined) type.name = name;
      if (min_price !== undefined) type.min_price = min_price;
      if (max_price !== undefined) type.max_price = max_price;
      if (platform_commission_percentage !== undefined) {
        type.platform_commission_percentage = platform_commission_percentage;
      }

      await type.save();

      // Verificar si hay propiedades fuera del nuevo rango
      const propertiesOutOfRange = await Property.count({
        where: {
          accommodation_type_id: id,
          [Op.or]: [
            { price_per_night: { [Op.lt]: type.min_price } },
            { price_per_night: { [Op.gt]: type.max_price } }
          ]
        }
      });

      res.json({
        message: 'Tipo de alojamiento actualizado exitosamente',
        accommodationType: type,
        warning: propertiesOutOfRange > 0 ? 
          `Hay ${propertiesOutOfRange} propiedades con precios fuera del nuevo rango` : null
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar tipo de alojamiento
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const type = await AccommodationType.findByPk(id);

      if (!type) {
        return res.status(404).json({ error: 'Tipo de alojamiento no encontrado' });
      }

      // Verificar si hay propiedades asociadas
      const propertyCount = await Property.count({
        where: { accommodation_type_id: id }
      });

      if (propertyCount > 0) {
        return res.status(400).json({ 
          error: `No se puede eliminar. Hay ${propertyCount} propiedades asociadas a este tipo` 
        });
      }

      await type.destroy();

      res.json({ 
        message: 'Tipo de alojamiento eliminado exitosamente' 
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AccommodationTypeController();