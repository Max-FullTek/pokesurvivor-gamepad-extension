# Guía para desarrolladores

<p><a href="dev.md">English</a> · <strong>Español</strong> · <a href="dev.zh-Hant.md">繁體中文</a></p>

[Guía de uso](../README.es.md)

Compila, prueba y empaqueta la extensión desde el código fuente. Para instalarla y usarla, consulta la guía de uso.

## Compilación y verificación

Requiere Node.js 20+ y npm.

```sh
npm ci
npm test
npm run build
npm run test:built
npm audit
```

Salida: `dist/controller-extension`. La carpeta fuente `extension/` por sí sola no es una extensión completa. Carga la carpeta compilada siguiendo las [instrucciones de instalación](../README.es.md#instalación). Comprime la carpeta compilada para distribuirla; el comando de compilación no crea un ZIP. `dist/` y `node_modules/` están excluidos de Git.

Las pruebas simulan mandos e interacciones DOM y no sustituyen las pruebas con mandos físicos. `npm audit` comprueba vulnerabilidades conocidas de las dependencias y no garantiza la seguridad.

## Estructura del proyecto

| Ruta | Función |
| --- | --- |
| `extension/` | Adaptador del sitio, panel, manifiesto e iconos |
| `js/` y `css/` | Motor, preferencias e interfaz de configuración del mando |
| `assets/controllers/` | Dibujo del mando incluido y su licencia |
| `tools/` | Compilación y ejecución de pruebas de la extensión compilada |
| `tests/` | Pruebas con mandos simulados e interacciones DOM |

## Notas de implementación

- El único permiso declarado es `storage`. Los scripts de contenido se ejecutan en un entorno aislado en las páginas compatibles del juego original.
- Las asignaciones usan la clave `ps.controller.v1` del localStorage del sitio. El estado de activación y el idioma usan `chrome.storage.local`. El sitio puede acceder a su localStorage, que no está cifrado; no debe contener secretos.
- El panel solicita el idioma del juego en la pestaña activa mediante mensajes de la extensión. No se leen ni modifican intencionadamente cookies, historial de navegación, credenciales de cuentas o partidas guardadas.

El inglés es la referencia de ambas guías; las traducciones al español y chino tradicional siguen el mismo contenido.
