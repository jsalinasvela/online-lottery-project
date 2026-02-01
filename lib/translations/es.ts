/**
 * Spanish translations for user-facing components
 * Admin panel remains in English
 */

export const translations = {
  // Currency configuration
  currency: {
    symbol: 'S/',
    code: 'PEN',
    locale: 'es-PE',
  },
  // Home page
  home: {
    title: '🏆 Sorteo de la Suerte ✨',
    subtitle: '¡Mira cómo crece el premio en tiempo real! 🚀',

    stats: {
      players: 'Jugadores',
      timeLeft: 'Tiempo Restante',
      entries: 'Participaciones',
      untilGoal: 'Hasta Meta',
      ended: 'Finalizado',
    },

    loading: {
      title: 'Cargando datos del sorteo...',
    },

    error: {
      title: 'Error al Cargar el Sorteo',
      retry: 'Reintentar',
    },

    noActiveRaffle: {
      title: 'No Hay Sorteo Activo',
      description: '¡Vuelve pronto para el próximo sorteo emocionante!',
    },

    raffle: {
      activeLabel: 'SORTEO ACTIVO',
      statusLabel: 'Estado',
      choosePackage: 'Elige tu Paquete',
      ticket: 'boleto',
      tickets: 'boletos',
      hot: 'POPULAR',
      select: 'Seleccionar',
    },

    myTickets: {
      title: 'Mis Boletos',
      empty: 'Aún no has comprado boletos',
      emptyHint: 'Selecciona un paquete arriba para comenzar',
      youOwn: 'Tienes',
      active: 'Activo',
      more: 'más',
    },

    recentActivity: {
      title: 'Actividad Reciente',
      live: 'En Vivo',
      empty: 'Aún no hay actividad. ¡Sé el primero en participar!',
      purchased: 'compró',
      justNow: 'Justo ahora',
      minuteAgo: 'minuto atrás',
      minutesAgo: 'minutos atrás',
      hourAgo: 'hora atrás',
      hoursAgo: 'horas atrás',
      dayAgo: 'día atrás',
      daysAgo: 'días atrás',
    },

    howItWorks: {
      title: 'Cómo Funciona',
      step1: {
        title: 'Compra tus Boletos',
        description: 'Elige uno de nuestros paquetes de boletos y únete al sorteo. Mira cómo crece el premio en tiempo real mientras más jugadores participan.',
      },
      step2: {
        title: 'Selección Justa y Transparente',
        description: 'Cada boleto tiene la misma oportunidad de ganar. Cuando se alcanza la meta, se selecciona automáticamente un ganador usando un proceso aleatorio criptográficamente seguro.',
      },
      step3: {
        title: 'Pago Instantáneo',
        description: 'Los ganadores reciben su premio inmediatamente después del sorteo. Revisa la sección de historial para ver ganadores anteriores y sorteos completados.',
      },
    },

    prizeDistribution: {
      title: 'Distribución del Premio',
      prize: 'Premio',
      causeAndOperations: 'Causa solidaria y operación',
      ofPool: 'del pozo',
    },

    footer: {
      copyright: '© 2025 Sorteo en Línea. Todos los derechos reservados.',
      disclaimer: 'Juega responsablemente. Debes ser mayor de 18 años para participar.',
    },

    purchaseError: {
      title: 'Compra Fallida',
    },
  },

  // Winner Banner
  winner: {
    recentWinner: 'Ganador Reciente:',
    won: 'Ganó',
    with: 'con el boleto',
    raffleName: 'Sorteo',
  },

  // Glass Visualization
  glass: {
    of: 'de',
    goal: 'meta',
    ticketsSold: 'vendidos',
    ticket: 'boleto',
    tickets: 'boletos',
  },

  // Payment Modal (Yape)
  payment: {
    title: 'Completa tu pago con Yape',
    totalToPay: 'Total a pagar',
    ticket: 'boleto',
    tickets: 'boletos',

    steps: {
      step1: {
        title: 'Realiza el pago por Yape',
        copy: 'Copiar',
        copied: 'Copiado',
        important: 'Importante:',
        includeCode: 'Incluye el código',
        inYapeMessage: 'en el mensaje de Yape',
      },
      step2: {
        title: 'Toma captura de tu pago',
        description: 'Asegúrate que se vea el monto y la fecha',
      },
      step3: {
        title: 'Envía tu comprobante',
        whatsapp: 'Enviar por WhatsApp',
        email: 'Enviar por Email',
        or: 'o',
      },
    },

    referenceCode: {
      title: 'TU CÓDIGO DE REFERENCIA',
      instruction: 'Inclúyelo en el mensaje de Yape y al enviar tu comprobante',
    },

    privacyNote: '🔒 Tu pago será verificado por nuestro equipo. Recibirás tus boletos una vez confirmado.',
    understood: 'Entendido',
  },

  // User Identification Modal
  identification: {
    title: 'Identifícate para continuar',
    description: 'Necesitamos tu información para enviarte tus boletos cuando ganes',

    form: {
      name: {
        label: 'Nombre Completo',
        placeholder: 'Juan Pérez',
        error: 'Por favor ingresa tu nombre completo',
      },
      email: {
        label: 'Correo Electrónico',
        placeholder: 'tu@email.com',
        error: 'Por favor ingresa un correo electrónico válido',
      },
    },

    privacy: '🔒 Tu información está segura y solo se usa para enviarte tus boletos',
    continue: 'Continuar',
    cancel: 'Cancelar',
  },

  // Toast messages
  toast: {
    welcome: '¡Bienvenido,',
    paymentPending: 'Tu pago está en revisión. Una vez aprobado, recibirás tus boletos y tu aporte se sumará al monto acumulado del sorteo. ¡Te notificaremos pronto!',
  },

  // Time formatting
  time: {
    hours: 'h',
    days: 'd',
  },
};

export type Translations = typeof translations;

export default translations;
