import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const defaultRole = searchParams.get('role') || 'guest';
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm({
    defaultValues: {
      role: defaultRole
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await registerUser(data);
    
    if (result.success) {
      if (data.role === 'host') {
        navigate('/host/properties/add');
      } else {
        navigate('/');
      }
    } else {
      setError('email', { message: result.error });
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-neutral-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center heading-1">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-secondary-600 hover:text-secondary-500"
          >
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
                Nombre completo
              </label>
              <div className="mt-1">
                <input
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  type="text"
                  autoComplete="name"
                  className="input"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  {...register('email', {
                    required: 'El correo es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo inválido'
                    }
                  })}
                  type="email"
                  autoComplete="email"
                  className="input"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
                Teléfono (opcional)
              </label>
              <div className="mt-1">
                <input
                  {...register('phone', {
                    pattern: {
                      value: /^[0-9-+().\s]+$/,
                      message: 'Formato de teléfono inválido'
                    }
                  })}
                  type="tel"
                  autoComplete="tel"
                  className="input"
                  placeholder="(442) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-neutral-700">
                Edad *
              </label>
              <div className="mt-1">
                <input
                  {...register('age', {
                    required: 'La edad es requerida',
                    min: {
                      value: 13,
                      message: 'Debes tener al menos 13 años para registrarte'
                    },
                    max: {
                      value: 120,
                      message: 'Por favor ingresa una edad válida'
                    },
                    valueAsNumber: true
                  })}
                  type="number"
                  min="13"
                  max="120"
                  className="input"
                  placeholder="Ej: 25"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>
                )}
                {watch('age') >= 13 && watch('age') < 18 && (
                  <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Los usuarios menores de 18 años requieren supervisión de un padre o tutor para realizar reservas.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)/,
                      message: 'La contraseña debe contener letras y números'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 icon-muted" />
                  ) : (
                    <EyeIcon className="h-5 w-5 icon-muted" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
                Confirmar contraseña
              </label>
              <div className="mt-1">
                <input
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden'
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                Tipo de cuenta
              </label>
              <div className="mt-1">
                <select
                  {...register('role')}
                  className="input"
                >
                  <option value="guest">Huésped - Busco alojamiento</option>
                  <option value="host">Anfitrión - Quiero rentar mi propiedad</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>

            <div className="text-xs text-neutral-600 text-center">
              Al registrarte, aceptas nuestros{' '}
              <Link to="/terms" className="text-secondary-600 hover:text-secondary-500">
                Términos y Condiciones
              </Link>{' '}
              y{' '}
              <Link to="/privacy" className="text-secondary-600 hover:text-secondary-500">
                Política de Privacidad
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;