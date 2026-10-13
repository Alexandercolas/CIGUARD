# CIGUARD — sitio institucional

Sitio estático en HTML, CSS y JavaScript, sin dependencias de producción ni compilación. Incluye búsqueda, filtros, fichas de productos, navegación móvil, preguntas frecuentes y páginas de privacidad y términos.

## Identidad y recursos

Conserva Fraunces/Inter y la paleta oficial: `#3A3A37`, `#6C6B64`, `#EFE9DC`, `#1C1C1A`, `#B8934A`. El logo, todos los favicons y `downloads/TECLAZO_RD_Setup_v1.0.0.exe` se mantienen sin modificaciones del repositorio original.

## Portafolio

Se mantienen Ozama Chess, MultiLinks, Teclazo RD, Núcleo CRM y RAVIA14, sus enlaces y estados originales. Las fichas se gestionan en `products` de `js/main.js`. Los estados no verifican la disponibilidad de los servicios externos.

## Ejecución y despliegue

Servir la raíz con un servidor HTTP, por ejemplo `python -m http.server 8000`, y abrir `http://localhost:8000`. Se puede desplegar la raíz en Vercel como sitio estático. `vercel.json` configura cabeceras básicas. El dominio de los metadatos, robots y sitemap es `https://ciguard.vercel.app/`.

## Contacto

`CONTACT_EMAIL` en `js/main.js` permanece vacío porque no se ha proporcionado una dirección receptora. El formulario informa que el canal está pendiente y no envía ni almacena mensajes. Una vez configurado, prepara un enlace `mailto:`; la entrega depende de la aplicación de correo del visitante. No hay backend ni recepción automática.

## Situación legal

La documentación original indica que el registro ante ONAPI y la constitución formal siguen pendientes. Los textos de privacidad y términos son informativos iniciales y requieren revisión antes de operar servicios comerciales.
