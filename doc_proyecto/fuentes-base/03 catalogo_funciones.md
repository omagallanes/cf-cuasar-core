Cuatro bloques: catálogo de funciones, qué se guarda y dónde (a nivel conceptual), reglas de trazabilidad y depuración y backlog priorizado. La parte de proyectos, operaciones de negocio, formularios y la interfaz de usuario queda para después.

## 1) Catálogo de funciones predeterminadas y metadatos

### Objetivo

Definir las funciones genéricas que el sistema soporta desde el inicio, con sus entradas, salidas, metadatos de historial y persistencia en tablas del proyecto.

### Convención de funcionamiento

* Cada función recibe un contexto de ejecución y un conjunto de valores de entrada.
* Cada función produce una salida estructurada.
* Cada función registra su rastro en el historial por paso.
* Entradas y salidas completas se guardan en D1 en tablas asociadas al proyecto.

### Función F1: Mostrar formulario

* Finalidad

  * Determinar qué formulario se muestra y con qué valores por defecto, en función de la operación y del estado del flujo.
* Entradas que espera

  * Identificador de formulario.
  * Identificador de operación de negocio.
  * Contexto del proyecto y del usuario (identificadores, no permisos).
  * Datos previos disponibles (si el flujo reanuda una ejecución o rellena valores).
* Salidas que genera

  * Definición del formulario a mostrar:

    * lista de campos fijos
    * tipos de campo
    * validaciones
    * valores por defecto
* Metadatos en historial

  * Identificador de formulario mostrado.
  * Versión de la definición de formulario.
  * Tiempo de resolución.
* Qué guarda en tablas del proyecto

  * Si quieres auditoría completa: copia de la definición entregada al cliente para esa ejecución.
  * Si no hace falta: solo el identificador y la versión del formulario.
  * Como has indicado “contenido completo”, lo razonable es guardar al menos el payload devuelto para poder reconstruir exactamente lo que se presentó.

### Función F2: Validar y procesar envío de formulario

* Finalidad

  * Validar que los datos enviados cumplen los campos fijos y preparar una entrada normalizada para el resto de pasos.
* Entradas que espera

  * Identificador de formulario.
  * Datos del formulario (pares campo-valor).
  * Reglas de validación del formulario (por versión).
* Salidas que genera

  * Datos normalizados y validados.
  * Lista de errores de validación si falla.
* Metadatos en historial

  * Resultado de validación: correcto o error.
  * Número de campos recibidos.
  * Número de errores.
* Qué guarda en tablas del proyecto

  * Entrada completa recibida del formulario.
  * Resultado de validación.
  * Entrada normalizada que alimenta los siguientes pasos.
  * Si hay error, se guarda igualmente el intento y el detalle del error.

### Función F3: Ejecutar llamada a API externa

* Finalidad

  * Llamar a OpenAI o a cualquier API de tercero o propia y devolver un resultado estructurado.
* Entradas que espera

  * Configuración de endpoint (identificador, no secretos).
  * Parámetros para la llamada (procedentes del formulario y del contexto).
  * Plantilla de request (si aplica), por ejemplo, mapeos de campos.
  * Política de tiempo máximo y reintentos (si decides soportarlo desde inicio).
* Salidas que genera

  * Respuesta completa de la API.
  * Respuesta normalizada (campos clave extraídos) si la operación lo requiere.
  * Error estructurado si falla.
* Metadatos en historial

  * Identificador del proveedor o del endpoint lógico.
  * Código de estado o estado equivalente.
  * Duración.
  * Tamaño aproximado de request y response.
  * Reintentos realizados, si aplica.
* Qué guarda en tablas del proyecto

  * Request completo enviado (incluido el payload final).
  * Response completa recibida.
  * Si hay normalización, también la salida normalizada.
  * Si hay error, payload de error completo.

### Función F4: Ejecutar escritura y consultas en base de datos

* Finalidad

  * Persistir entradas y salidas, y ejecutar consultas necesarias del flujo.
* Entradas que espera

  * Tipo de operación: insertar, actualizar, seleccionar, borrar.
  * Definición de destino lógico (por ejemplo, “tabla de entradas”, “tabla de salidas”, “tabla de resultados”), no el nombre físico si quieres mantenerlo abstracto.
  * Parámetros de consulta.
* Salidas que genera

  * Confirmación de escritura (identificador del registro y resumen).
  * Resultado de consulta (filas completas o subconjunto definido).
* Metadatos en historial

  * Tipo de operación.
  * Destino lógico.
  * Número de filas afectadas o devueltas.
  * Duración.
* Qué guarda en tablas del proyecto

  * En escrituras: el contenido completo escrito.
  * En consultas: el contenido completo devuelto, si forma parte del resultado de negocio o del paso.
  * En ambos casos: huella de relación para enlazarlo con la ejecución y el paso.

### Función F5: Formatear resultados

* Finalidad

  * Convertir salidas técnicas en una presentación más legible y útil para el usuario.
* Entradas que espera

  * Datos brutos (por ejemplo, respuesta de API, filas de consulta, texto).
  * Plantilla o reglas de formateo (por versión).
* Salidas que genera

  * Resultado formateado para visualización.
  * Opcionalmente, una estructura dual:

    * vista humana (texto o bloques)
    * vista técnica (datos estructurados)
* Metadatos en historial

  * Identificador de plantilla de formateo.
  * Tamaño de entrada y salida.
  * Duración.
* Qué guarda en tablas del proyecto

  * Entrada completa usada para formatear.
  * Salida completa formateada.
  * Si se conserva vista técnica, también se guarda.

## 2) Qué se guarda y dónde, a nivel conceptual

Sin entrar en arquitectura, cierro el mapa de conceptos de almacenamiento en D1:

* Datos de negocio del proyecto

  * Entradas de formularios: contenido completo.
  * Salidas de cada paso: contenido completo.
  * Resultado final: contenido completo.
* Historial de ejecución tipo “pipeline”

  * Un registro por ejecución.
  * Un registro por paso ejecutado dentro de esa ejecución.
  * Estado, tiempos, errores y enlaces a las entradas y salidas de negocio.
* Relación entre ambos

  * Cada paso del pipeline enlaza con:

    * la entrada que consumió
    * la salida que produjo
  * Esto permite reconstruir qué ocurrió sin duplicar contenido, aunque el contenido completo siga existiendo en las tablas del proyecto.

## 3) Reglas de trazabilidad y depuración

Reglas funcionales que aplican a todas las funciones:

* Estados por paso

  * Pendiente
  * En ejecución
  * Correcto
  * Error
* Estados por ejecución

  * Iniciada
  * En ejecución
  * Finalizada correctamente
  * Finalizada con error
* Registro mínimo por paso

  * Identificador de función y versión.
  * Marca de tiempo de inicio y fin.
  * Estado final.
  * Error completo si ocurre.
* Principio de persistencia

  * Se guarda siempre el contenido completo de entrada y salida, incluso en error, para auditoría.
* Correlación

  * Todo registro incluye identificadores para enlazar:

    * proyecto
    * operación de negocio
    * ejecución
    * paso

## 4) Backlog priorizado inicial

Ordenado para que puedas empezar a construir sin entrar aún en interfaz ni en proyectos, pero dejando el núcleo cerrado.

* Definir el formato estándar de “entrada”, “salida” y “contexto” de función
* Definir el formato estándar de registro de paso en pipeline
* Implementar el esqueleto de ejecución lineal (motor) que recorra funciones en orden
* Implementar persistencia de entradas y salidas completas en D1
* Implementar el pipeline:

  * crear ejecución
  * registrar pasos
  * actualizar estados
  * registrar errores
* Implementar F2 (validación de formulario) como primera función útil del motor
* Implementar F3 (llamada a API) con registro completo de request y response
* Implementar F4 (escrituras y consultas) con trazabilidad de filas afectadas y resultados
* Implementar F5 (formateo) con salida dual si te interesa
* Implementar F1 (mostrar formulario) como proveedor de definición de formulario por identificador y versión

