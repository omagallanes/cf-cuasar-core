A continuación te explico la idea como si tú fueras el cliente y yo el desarrollador que va a construir la solución.

## Qué vas a tener

Vas a disponer de una aplicación web en la que gestionas proyectos y ejecutas, dentro de cada proyecto, una operación de negocio predefinida.

* Cada proyecto representa un “contenedor” de trabajo.
* En cada proyecto se crea una operación de negocio (información provenniente de URL, en fmt JSON) desde un campo en form.
* Esa operación de negocio no se inventa sobre la marcha: ya existe y viene definida como una plantilla fija.
* La operación de negocio ejecuta una cadena de pasos en un orden ya establecido.
* Tú solo aportas datos y parámetros mediante formularios con campos fijos.

## Qué significa “operación de negocio” en tu caso

Una operación de negocio equivale a un proceso automático compuesto por funciones genéricas reutilizables.

* El proceso se compone de varios pasos.
* Cada paso corresponde a una función predeterminada.
* Las funciones no se crean a medida para cada proyecto; se reutilizan con parámetros.
* El orden de los pasos no cambia: la cadena es lineal.

Dicho de forma sencilla: eliges una operación, rellenas los formularios y el sistema ejecuta el proceso paso a paso hasta producir un resultado final.

## Qué hace cada tipo de función

Las funciones se comportan como “piezas” estándar que el sistema encadena.

* Mostrar formulario: la interfaz presenta el formulario que corresponde al paso o al inicio del proceso.
* Ejecutar envío de formulario: el servidor valida lo que has introducido y lo prepara como entrada del proceso.
* Ejecutar llamadas a API: el servidor llama a OpenAI, a servicios de terceros o a una API propia en Cloudflare, según lo que defina la operación.
* Guardar en base de datos y ejecutar consultas: el servidor guarda entradas y salidas y, cuando procede, realiza consultas sobre la base de datos.
* Formatear resultados: el servidor prepara la salida para que se vea clara y ordenada en la interfaz.

## Dónde se crean y gestionan las funciones

Antes de que los usuarios trabajen con proyectos y operaciones de negocio (análisis inmobiliario), el sistema dispone de un espacio de administración donde se definen las funciones disponibles para llevar a cabo las operaciones de negocio.

* En esa zona se registran las funciones estándar que el sistema puede ejecutar.
* Cada función queda definida una sola vez y luego puede reutilizarse en muchas operaciones de negocio.
* La definición de cada función incluye su tipo, los parámetros que espera recibir, el tipo de resultado que produce y los metadatos necesarios para su ejecución y trazabilidad.
* Estas funciones no las crean los usuarios finales durante el uso normal de la aplicación; forman parte de la configuración funcional del sistema.

De esta forma, el sistema mantiene un catálogo de funciones reutilizables que actúan como bloques básicos para construir operaciones de negocio.

## Dónde se crean las operaciones de negocio

Además del catálogo de funciones, el sistema incluye una sección donde se definen las operaciones de negocio.

* Una operación de negocio se crea seleccionando varias funciones del catálogo.
* Durante la creación se establece el orden exacto en que deben ejecutarse esas funciones.
* Ese orden define el flujo completo de la operación.
* Una vez creada, la operación de negocio queda registrada como plantilla reutilizable.

Cuando un usuario crea un proyecto, no diseña el proceso desde cero; simplemente elige una de estas operaciones ya definidas.

De esta forma:

* Las funciones representan los bloques de acción.
* Las operaciones de negocio representan el flujo completo que encadena esos bloques en un orden concreto.

## Qué ocurre cuando tú haces clic

La interfaz sirve para interactuar, pero la lógica y los datos se gestionan en el servidor.

* Tú navegas por la interfaz y eliges un proyecto o creas uno nuevo.
* Seleccionas la operación de negocio del proyecto.
* Rellenas el formulario con los datos y parámetros.
* Al enviar el formulario, el navegador no ejecuta la lógica de negocio: envía la solicitud al servidor.
* El servidor ejecuta los pasos de la operación en el orden definido.
* El servidor devuelve resultados listos para mostrar en pantalla.

Esto asegura que las escrituras en base de datos y las llamadas a API se ejecutan donde corresponde, con control y trazabilidad.

## Qué datos quedan guardados y por qué

Todo lo que entra y sale del proceso queda guardado en la base de datos, asociado al proyecto.

* Entradas completas: todos los datos y parámetros que introduces en formularios.
* Salidas completas: resultados de cada paso y resultado final de la operación.
* Persistencia en D1: incluso si el resultado es grande, se almacena en D1.

La idea es que puedas volver a consultar cualquier ejecución, revisar qué se introdujo, qué devolvió cada paso y qué resultado final se obtuvo.

## Cómo funciona el historial de ejecuciones

Además de guardar los datos “de negocio”, el sistema registra un historial técnico de ejecución para auditoría y depuración.

* Cada vez que ejecutas una operación, el sistema crea un registro de ejecución.

* Por cada paso de la cadena, el sistema guarda:

  * qué función se ejecutó
  * cuándo empezó y cuándo terminó
  * si terminó bien o con error
  * el detalle necesario para reconstruir lo ocurrido

* Ese historial vive en una tabla específica de “pipeline”, separada de las tablas donde se guardan entradas y salidas del proyecto.

Así consigues dos cosas: los datos funcionales del proyecto por un lado y la traza técnica de lo que pasó por otro, sin mezclar conceptos.

## Qué vas a ver en la interfaz

La interfaz se centra en ser clara y operativa.

* Un menú lateral con acceso a:

  * listado de proyectos
  * creación de proyecto
  * edición y borrado de proyecto
  * selección de operación de negocio para cada proyecto

* Dentro del proyecto:

  * formularios para introducir parámetros
  * pantalla de resultado con una presentación legible
  * acceso al historial de ejecuciones para ver qué se ejecutó y en qué estado quedó cada paso

## Qué queda fuera por ahora

No incluyes autenticación ni permisos en esta fase.

* El sistema se centra en flujo, persistencia y trazabilidad.
* Si más adelante necesitas permisos, se puede añadir sin cambiar el concepto base: proyectos, operaciones predefinidas, funciones reutilizables e historial.
