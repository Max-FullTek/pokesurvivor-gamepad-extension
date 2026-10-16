<p align="center"><img src="extension/icon-128.png" width="80" height="80" alt="Icono de la extensión de mando"></p>
<h1 align="center">PokéSurvivor Gamepad Extension</h1>
<p align="center"><a href="README.md">English</a> · <strong>Español</strong> · <a href="README.zh-Hant.md">繁體中文</a></p>

<p align="center">Juega a PokéSurvivor con tu mando. Personaliza los controles.</p>

Extensión no oficial para Chrome / Edge y el [juego original](https://pokesurvivor.com/), con asignaciones personalizadas, un asistente de configuración y calibración de sticks. Se mantiene de forma independiente del juego.

[Funciones](#funciones) · [Instalación](#instalación) · [Controles](#controles) · [Privacidad y seguridad](#privacidad-y-seguridad) · [Guía para desarrolladores](docs/dev.es.md) · [Licencia y exención de responsabilidad](#licencia-y-exención-de-responsabilidad)

## Funciones

- Asignaciones independientes para la partida y los menús, con un asistente paso a paso.
- Calibración de ambos sticks, zona muerta ajustable y modos de movimiento.
- Interfaz en inglés, español y chino tradicional; Automático sigue el idioma del juego y usa inglés si no puede detectarlo.
- Interruptor en la barra de extensiones para desactivar el mando sin perder la configuración.

> El idioma solo afecta a esta extensión. Para traducir el juego al chino tradicional se necesita la [extensión de traducción](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext), que se distribuye por separado.

## Instalación

1. Extrae un ZIP de la extensión o [compila el código fuente](docs/dev.es.md). **Download ZIP** de GitHub contiene código fuente y requiere compilación.
2. Abre `chrome://extensions` o `edge://extensions` y activa el **Modo de desarrollador**.
3. Selecciona **Cargar descomprimida** y elige la carpeta compilada `controller-extension` que contiene `manifest.json`. Al compilar desde el código fuente, es `dist/controller-extension`.
4. Abre o recarga [PokéSurvivor](https://pokesurvivor.com/). Conecta un mando y pulsa un botón.
5. En el juego, abre **Ajustes → Controles → En PC → Mando → Configurar mando**. El panel de la barra de extensiones permite activar el mando y elegir el idioma.

Tras actualizar, recarga la extensión desde la página de extensiones y luego la pestaña del juego. Para dejar de usarla, desactiva el interruptor o deshabilita / elimina la extensión en el navegador.

## Controles

| Entrada (posiciones de Xbox) | Acción predeterminada |
| --- | --- |
| Stick izquierdo / cruceta | Mover; navegar por los menús |
| A / B / X / Y | Ataques 3 / 2 / 4 / 1 |
| Stick derecho | Seleccionar ataque en cuatro direcciones |
| LB / RB | Ataque anterior / siguiente |
| Start | Pausa / volver |
| A / B en los menús | Confirmar / volver |
| X al subir de nivel | Cambiar cartas |

Pulsa un botón del dibujo para cambiar su función o utiliza el **Asistente**. Los cambios solo se aplican al **Guardar**; **Cancelar** conserva la configuración anterior. El movimiento y la pulsación de los sticks se configuran por separado. El botón de sistema Guide / Xbox queda excluido.

Solo se admiten mandos con el mapeo `standard` del navegador. El dibujo usa posiciones de Xbox para todos los mandos compatibles. En la web original, el movimiento se convierte en entradas de teclado de ocho direcciones, sin velocidad analógica. Las actualizaciones de la web pueden afectar a la compatibilidad; el soporte nativo reconocido tiene prioridad.

## Privacidad y seguridad

- El único permiso declarado es `storage`. La extensión solo se ejecuta en las páginas compatibles del juego original.
- No se implementan analíticas, telemetría, carga de scripts remotos ni envío de datos en segundo plano. Los enlaces relacionados solo se abren al pulsarlos.
- La extensión lee el mando y mantiene temporalmente las teclas pulsadas para no interrumpir el teclado. No registra texto escrito ni guarda un historial del teclado.
- Las asignaciones se guardan localmente en el sitio del juego; el estado de activación y el idioma se guardan localmente en la extensión. El sitio puede acceder a sus ajustes, que no están cifrados.
- El panel consulta el idioma de la pestaña activa del juego. No se leen ni modifican intencionadamente cookies, historial de navegación, credenciales de cuentas o partidas guardadas.

Usa compilaciones de confianza. Un análisis de dependencias sin alertas no garantiza la seguridad. Para errores normales, utiliza [Issues](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension/issues). No publiques contraseñas, tokens, partidas, rutas personales ni detalles de vulnerabilidades explotables. Si GitHub ofrece **Security → Report a vulnerability** en este repositorio, utiliza ese canal privado; de lo contrario, solicita primero un contacto privado sin revelar los detalles.

Consulta la [guía para desarrolladores](docs/dev.es.md) para compilar el código fuente, ejecutar pruebas y conocer la estructura del proyecto.

## Licencia y exención de responsabilidad

**Código fuente disponible para uso no comercial.** El código conserva los [términos PolyForm Noncommercial 1.0.0](LICENSE-NONCOMMERCIAL.md) y los [avisos de licencia](LICENSE) del proyecto original. La redistribución debe conservar los términos aplicables, avisos obligatorios y atribuciones de terceros. La disponibilidad pública no concede un uso comercial sin restricciones. El dibujo de Controllercons y el icono adaptado de Lucide tienen licencias independientes; consulta [CREDITS.md](CREDITS.md). El LICENSE original conservado también describe licencias históricas y recursos del juego que no se incluyen aquí.

Este proyecto comunitario no es oficial ni está afiliado, aprobado o patrocinado por el autor del juego, Nintendo, Creatures Inc., GAME FREAK, The Pokémon Company, Microsoft u otros proveedores de plataformas / mandos. El código, los gráficos, los nombres y las marcas del juego pertenecen a sus respectivos titulares. Este proyecto no concede licencias sobre marcas o contenido del juego de terceros.

En la medida permitida por la ley aplicable, el software se proporciona **tal cual**, sin garantías de compatibilidad, disponibilidad, seguridad o idoneidad para un fin concreto. Los cambios del navegador o de la web pueden interrumpir su uso. La responsabilidad solo se limita según permitan la ley y las licencias aplicables; estas declaraciones no anulan derechos irrenunciables ni obligaciones de licencia.

Para consultas sobre titularidad o licencias, contacta con el mantenedor a través del repositorio sin publicar información privada. Estas notas resumen el proyecto y no sustituyen las licencias completas. Si una traducción contradice una licencia, prevalece el texto de la licencia.

## Proyectos relacionados

1. [Web del juego original](https://pokesurvivor.com/)
2. [Repositorio del juego original — JPTER78](https://github.com/JPTER78/pokesurvivor)
3. [Extensión de traducción al chino tradicional](https://github.com/q86865511/pokesurvivor-zh-hant/tree/main/pokesurvivor-zh-ext)
4. [Repositorio de esta extensión](https://github.com/Max-FullTek/pokesurvivor-gamepad-extension)
