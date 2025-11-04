const { bucket } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class UploadController {
  // Subir una sola imagen
  async uploadSingle(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió ninguna imagen' });
      }

      // Generar nombre único
      const fileName = `properties/${uuidv4()}-${req.file.originalname}`;
      const file = bucket.file(fileName);

      // Subir archivo a Firebase Storage
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          }
        },
        public: true,
      });

      // Generar URL pública
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

      res.json({
        message: 'Imagen subida exitosamente',
        url: publicUrl,
        fileName: fileName
      });

    } catch (error) {
      console.error('Error al subir imagen:', error);
      next(error);
    }
  }

  // Subir múltiples imágenes
  async uploadMultiple(req, res, next) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No se enviaron imágenes' });
      }

      const uploadPromises = req.files.map(async (file) => {
        const fileName = `properties/${uuidv4()}-${file.originalname}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
            metadata: {
              firebaseStorageDownloadTokens: uuidv4(),
            }
          },
          public: true,
        });

        return {
          url: `https://storage.googleapis.com/${bucket.name}/${fileName}`,
          fileName: fileName
        };
      });

      const results = await Promise.all(uploadPromises);

      res.json({
        message: 'Imágenes subidas exitosamente',
        images: results
      });

    } catch (error) {
      console.error('Error al subir imágenes:', error);
      next(error);
    }
  }

  // Eliminar imagen
  async deleteImage(req, res, next) {
    try {
      const { fileName } = req.body;

      if (!fileName) {
        return res.status(400).json({ error: 'Se requiere el nombre del archivo' });
      }

      await bucket.file(fileName).delete();

      res.json({ message: 'Imagen eliminada exitosamente' });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      
      // Si el archivo no existe, no es un error crítico
      if (error.code === 404) {
        return res.status(404).json({ error: 'Imagen no encontrada' });
      }
      
      next(error);
    }
  }
}

module.exports = new UploadController();