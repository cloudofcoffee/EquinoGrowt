<template>
  <div class="bg-red-100 text-red-700 px-4 py-3 rounded-md border border-red-300 text-sm flex items-start gap-2">
    <i class="fas fa-exclamation-triangle mt-0.5 text-red-600"></i>
    <span>{{ friendlyMessage }}</span>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  computed: {
    friendlyMessage() {
      const errorMap = {
        // Errores de login
        'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
        'auth/user-not-found': 'No existe una cuenta con este correo.',
        'auth/wrong-password': 'La contraseña es incorrecta.',
        'auth/too-many-requests': 'Demasiados intentos fallidos. Inténtalo más tarde.',
        'auth/network-request-failed': 'Error de red. Verificá tu conexión a internet.',

        // Errores de registro
        'auth/email-already-in-use': 'Este correo ya está registrado.',
        'auth/invalid-email': 'El correo ingresado no es válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',

        // Errores generales
        'auth/internal-error': 'Ocurrió un error interno. Intenta nuevamente.',
        'auth/missing-password': 'Falta ingresar la contraseña.',
        'auth/missing-email': 'Falta ingresar el correo electrónico.',
        'auth/invalid-credential': 'Credenciales inválidas.',

        // Errores de autenticación con proveedores externos
        'auth/account-exists-with-different-credential': 'Ya existe una cuenta con este correo, pero con un método de acceso diferente.',
        'auth/popup-closed-by-user': 'Ventana emergente cerrada antes de completar el inicio de sesión.',
        'auth/cancelled-popup-request': 'Se canceló el inicio de sesión porque ya hay una ventana emergente abierta.',
        'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permití las ventanas emergentes para continuar.',
        'auth/operation-not-supported-in-this-environment': 'Esta operación no es compatible con tu navegador o dispositivo.',

        // Otros
        'auth/timeout': 'La operación tardó demasiado. Intentá de nuevo.',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
      };

      // Extrae el código de error del mensaje original
      const match = this.message.match(/\(auth\/[^\)]+\)/);
      const code = match ? match[0].replace(/[()]/g, '') : null;

      return code && errorMap[code]
        ? errorMap[code]
        : 'Ocurrió un error al iniciar sesión. Por favor, intentá nuevamente.';
    },
  },
};
</script>
