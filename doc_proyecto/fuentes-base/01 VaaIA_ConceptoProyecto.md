# Concepto de proyecto

## 1. Nombre provisional del producto

**VaaIA: València Análisis de activos con IA**

## 2. Problema que se quiere resolver

Asesores inmobiliarios de la empresa inmobiliaria encuentran inmuebles que “parecen interesantes” en portales inmobiliarios españoles. Usando una web-app de forma rápida, estructurada y rigurosa, pueden realizar análisis sobre el inmueble (copiando en la web-app su URL) para evaluar su potencial de negocio: si el activo tiene sentido real, si está infrautilizado, si soporta un uso económico razonable, si conviene mantenerlo, transformarlo o descartarlo, y si una posible reconversión o cambio de uso parece defendible en València ciudad. Hoy esa evaluación suele ser fragmentaria, manual, poco comparable y muy dependiente de intuición o narrativa comercial del anuncio.

## 3. Usuario objetivo

**Usuario principal**

* Empleados de la empresa con rango o función de **asesoría**, que analizan activos inmobiliarios en **València ciudad** con lógica de negocio o inversión.
* Son los usuarios principales del sistema en esta fase del proyecto.
* Trabajan como decisores o analistas internos sobre inmuebles detectados en portales inmobiliarios y necesitan una herramienta que les permita ejecutar y consultar análisis estructurados de forma consistente.

**Otros roles internos relacionados**

* **Administrador del sistema**
* **Comercial**
* Otros perfiles internos de la empresa que puedan necesitar consultar, revisar o gestionar proyectos y resultados, aunque no sean el usuario analítico principal.

**Perfiles de interesado / cliente potencial analizados por el sistema**

La herramienta no analiza solo el inmueble en abstracto, sino que genera lectura y evaluación para tres posibles perfiles de interesado o cliente potencial de la inmobiliaria:

* **Inversor**
* **Emprendedor / operador**
* **Propietario**

**Usuario inicial más viable para MVP**

Aunque el usuario operativo principal del MVP es interno, los análisis están orientados a servir a casos en los que el asesor necesita trabajar para perfiles como:

* **Propietario** con un local o activo ya en cartera que el asesor sospecha está infrautilizado.
* **Inversor** al que el asesor puede proporcionar oportunidades filtradas para profundizar.
* **Operador** que necesita saber si el espacio sirve realmente para una actividad o cambio de uso.

## 4. Propuesta de valor

Una **herramienta online** que convierte un anuncio inmobiliario en un **análisis estructurado y evaluable del activo desde diversos ángulos**.

Primero, mediante **cuatro planos analíticos**:

* **Activo físico**
* **Activo estratégico**
* **Activo financiero**
* **Activo regulado**

Después, mediante una **lectura específica según el perfil decisor**:

* **Inversor**
* **Emprendedor / operador**
* **Propietario**

El valor diferencial no está en listar inmuebles ni en realizar una tasación clásica, sino en **traducir fichas heterogéneas en decisiones accionables** sobre:

* Uso
* Inversión
* Explotación
* Optimización patrimonial

Con foco en:

* **Local comercial**
* **Reconversión / cambio de uso**
* **Pisos utilizados como oficinas**

Todo ello dentro del ámbito de **València ciudad**.

## 5. Solución propuesta

Una **web-app analítica** apoyada en metodología y orquestación de **IA mediante roles y prompts**, que trabaja sobre un archivo **JSON** con la información completa y estructurada del inmueble en el portal inmobiliario (de ahora en adelante **I-JSON**), extraído del anuncio inmobiliario.

El sistema genera:

* Un bloque previo de lectura rápida:

  * **Resumen**
  * **Datos clave**
* Un **Primer trabajo analítico**:

  * activo físico
  * activo estratégico
  * activo financiero
  * activo regulado
* Un **Segundo trabajo analítico**:

  * lectura para inversor
  * lectura para emprendedor / operador
  * lectura para propietario

La app no necesita empezar como producto transaccional ni como marketplace. Su MVP puede centrarse en convertir anuncios en análisis estructurados, comparables y útiles para decisión, usando solo información del I-JSON y ejecuión de isntrucciones de análisis predefinidas contra OpenAI API y salidas derivadas del propio análisis.

En esta fase, el producto debe entenderse principalmente como **herramienta interna de trabajo para la empresa**. La posibilidad de evolucionar hacia una **herramienta para cliente final** existe, pero queda **en desarrollo** y no constituye el foco operativo inmediato del MVP.

## 6. Escenario de uso principal (Funcionalidades clave del MVP)

Un usuario selecciona un anuncio inmobiliario de València ciudad.

Un usuario selecciona **«Nuevo proyecto»** en el área **«Proyectos»** del menú lateral.

1. A través de un **formulario**, el usuario pega el contenido **I-JSON** del anuncio inmobiliario.
2. A partir de ese **I-JSON**, el sistema crea **automáticamente el proyecto**.
3. Los **campos del proyecto** se rellenan utilizando la información contenida en el **I-JSON**.
4. El **I-JSON completo** se copia en un campo de tabla del proyecto.
5. El **I-JSON** se guarda en la base de datos **D1 de Cloudflare**.
6. La información del proyecto se presenta al usuario en el **formulario de la interfaz (UI)** dentro de la sección **«Proyectos»**.

El identificador único del proyecto será el **ID de la tabla de Proyectos (PYT)**.

La **UI** tendrá un sistema de **pestañas**, horizontales o verticales, todavía por determinar.

La primera pestaña mostrará los **datos del proyecto**:

* **ID**
* **nombre**
* **descripción**
* **fechas**
* **estado**
* **asesor responsable**

A continuación, el usuario, desde el formulario, ejecuta un botón que lanza un **workflow de Cloudflare**.

El workflow ejecuta varios pasos mediante `step.do()` (método que ejecuta cada paso del flujo).

El workflow debe ejecutar siempre **todos los análisis**.
No habrá ejecuciones parciales por módulos ni relanzamiento de un único análisis.

**Pasos**

1. Ejecución de la **API de OpenAI** para generar el informe **Resumen** del inmueble.

2. Ejecución de la **API de OpenAI** para generar el informe **Datos clave** del inmueble.

3. Ejecución del **Primer trabajo analítico**, compuesto por:

   * Análisis físico mediante **API de OpenAI**.
   * Análisis estratégico mediante **API de OpenAI**.
   * Análisis financiero mediante **API de OpenAI**.
   * Análisis regulatorio mediante **API de OpenAI**.

4. Ejecución del **Segundo trabajo analítico** según el perfil deseado:

   * Análisis para **inversor** mediante **API de OpenAI**.
   * Análisis para **emprendedor / operador** mediante **API de OpenAI**.
   * Análisis para **propietario** mediante **API de OpenAI**.

Cada paso genera un **informe individual en formato Markdown**, que no se limita a describir el anuncio, sino que responde al **análisis específico correspondiente a cada paso**.

Como resultado operativo del MVP:

* El sistema trabaja **bajo demanda sobre anuncios concretos**.
* No se prioriza en esta fase la ingestión semiautomática masiva de múltiples anuncios.
* El objetivo técnico del flujo es que **todas las ejecuciones de OpenAI API se completen sin errores** y que cada resultado se genere correctamente como archivo Markdown independiente.

Además:

* Cada resultado Markdown generado por cada paso del workflow deberá **guardarse en R2**.
* El usuario podrá **visualizar en pantalla**, desde el formulario del proyecto, todos los archivos Markdown resultantes para su consulta.
* La revisión inicial de resultados será **humana**, mediante lectura en interfaz de los Markdown generados.
* En esta fase **no procede** todavía trabajar escenarios comparativos avanzados entre alternativas patrimoniales o de explotación como requisito de MVP.

Se añade además la siguiente lógica operativa y técnica del workflow:

* La **UI** debe informar al usuario, en todo momento, de lo que está haciendo el sistema.
* Debe mostrar el **avance de los pasos** del workflow.
* Debe informar también de **cualquier error** que se produzca.
* Si se produce un error, el proceso debe **detenerse** e informar de ello al usuario.
* Cada error, normalmente procedente de la **API de OpenAI**, obligará a **detener el proceso**.
* El error deberá mostrarse al usuario como un **error tipificado en pantalla**.
* El estado del **PYT** pasará a **«análisis con error»**.
* Si no se produce error y el proceso completa todos los pasos, el estado del proyecto deberá pasar a **«análisis finalizado»**.

En relación con el almacenamiento en **R2**:

* No se guardarán metadatos específicos por archivo Markdown.
* En **R2** se creará una **carpeta exclusiva para cada PYT**.
* Dentro de esa carpeta se guardarán:

  * el archivo **JSON**
  * los archivos **Markdown**
  * y un **log** para registrar fallos cuando se produzcan errores
* Cada archivo **Markdown** tendrá un nombre, todavía por definir.

En relación con una nueva ejecución del proceso:

* No habrá **versionado de prompts**.
* No habrá **versionado de resultados**.
* Los **prompts de la API de OpenAI** ya estarán definidos para cada `step.do()`.
* Si el usuario vuelve a ejecutar el proceso, se le preguntará si desea hacerlo, ya que la nueva ejecución **sustituirá lo existente**.
* En ese caso, se borrarán todos los archivos **Markdown**, pero no el **JSON**, y se volverán a ejecutar todos los `step.do()`.
* Si la nueva ejecución se debe a un error previo, se hará lo mismo, pero **sin preguntar al usuario**.

Además, se considera **muy conveniente** incorporar:

* trazabilidad entre el contenido del **I-JSON** y cada salida analítica
* detección de errores
* registro de errores en logs
* control de estado del **PYT**

## 7. Gestión de estados y atributos comunes

Los estados iniciales del proyecto serán:

* **creado**
* **procesando análisis**
* **análisis con error**
* **análisis finalizado**

Más adelante podrán definirse otros estados, pero serán siempre **posteriores al análisis**.

Los estados deberán mantenerse en una **tabla de atributos**.

La tabla de atributos y sus valores asociados serán de uso común para toda la aplicación.

**Tablas:**

* **atributos**
* **valores**

Esto implica que la gestión de estado del proyecto no debe resolverse como una lista rígida incrustada en un único módulo, sino como una estructura común reutilizable por la aplicación.

## 8. Qué NO incluir en el MVP

* Marketplace de inmuebles.
* CRM comercial completo.
* Automatización avanzada con todos los municipios del área metropolitana.
* Integraciones amplias con portales, scoring masivo o scraping a gran escala.
* Simulación financiera exhaustiva o tasación formal.
* Cobertura normativa profunda de todos los supuestos sectoriales desde el día 1.
* SaaS multiproyecto complejo con paneles avanzados de gestión interna.

Además, en esta fase tampoco debe incluirse como prioridad:

* automatización masiva de captura de múltiples anuncios
* producto orientado plenamente a cliente final
* comparadores complejos de escenarios como núcleo del MVP
* funcionalidades ajenas a la cadena principal de creación de proyecto, ejecución de análisis y consulta de resultados Markdown

Y tampoco debe incluirse en esta fase:

* ejecución parcial por módulos del workflow
* relanzamiento aislado de un único análisis
* versionado de prompts
* versionado de resultados analíticos

## 9. Revisión humana y posición actual del producto

En la primera fase sí habrá **revisión humana** de los resultados.

El usuario, desde el formulario del proyecto, podrá:

* visualizar en pantalla todos los **Markdown resultantes**
* revisarlos manualmente
* usarlos como soporte de consulta interna

Esto implica que, en esta fase:

* la app funciona principalmente como **herramienta interna para empleados de la empresa**
* la lectura y evaluación humana de los resultados forma parte natural del uso del sistema
* no se persigue aún una experiencia cerrada y final para cliente final externo

La línea de evolución hacia **herramienta para cliente final** existe, pero sigue en desarrollo y no debe distorsionar las prioridades actuales del MVP.

La frontera funcional exacta entre esta fase interna y la futura herramienta para cliente final será la correspondiente al **MVP que se desarrollará inicialmente**.

## 10. Riesgos o incógnitas

* **Calidad del input**: el sistema depende de lo que el anuncio realmente contiene.
* **Riesgo normativo**: muchas oportunidades aparentes dependen de validación urbanística y municipal.
* **Complejidad del plano regulado**: puede elevar mucho el coste del MVP si se sobredimensiona.
* **Ambigüedad del valor para cada perfil**: hay que validar cuál genera más tracción inicial.
* **Riesgo de sobrepromesa**: si el producto parece “resolver” la viabilidad completa cuando en realidad ofrece una lectura preliminar.
* **Mantenimiento de roles/prompts**: la arquitectura requiere disciplina para no duplicar análisis ni degradar calidad.

Además, en esta fase deben tenerse presentes estas incógnitas adicionales:

* **Robustez de la cadena técnica end-to-end**: el sistema depende de que toda la secuencia I-JSON → proyecto → workflow → OpenAI API → Markdown → R2 funcione sin fallos.
* **Calidad de ejecución de roles/prompts**: aunque el sistema genere salidas, habrá que verificar si todas mantienen suficiente consistencia analítica.
* **Dependencia de la estructura del I-JSON**: si el contenido pegado en el formulario llega incompleto, ambiguo o mal estructurado, la calidad del análisis se resentirá.
* **Frontera de responsabilidad del sistema**: el producto no debe presentarse como resolución definitiva de viabilidad jurídica, económica o urbanística.
* **Desfase entre análisis interno y producto futuro para cliente final**: la evolución de herramienta interna a producto externo requerirá una redefinición posterior de UX, narrativa y control de expectativas.
* **Gestión de errores en workflow**: la UX y la arquitectura deben resolver bien la detención del proceso, la tipificación del error, el registro en logs y el estado del proyecto.
* **Trazabilidad entre entradas y salidas**: hay que diseñar cómo se relaciona el I-JSON con cada Markdown y con el estado del PYT.
* **Política de sustitución de resultados**: al no existir versionado, toda reejeución sobrescribe resultados anteriores, lo que exige controlar bien la confirmación al usuario y la limpieza previa de archivos Markdown.

## 11. Supuestos realizados

* El producto inicial se enfoca en **València ciudad**, no en toda el área metropolitana, porque ese es el alcance normativo operativo más razonable para arrancar.
* El foco de MVP se centra en:

  * **local comercial**
  * **reconversión / cambio de uso**
  * **uso comercial**
  * **pisos como oficinas cuando proceda**
* El entregable inicial no será un “plan de negocio completo”, sino una **cadena de análisis estructurados** que puede servir después como base para capas más avanzadas.
* El producto se concibe primero como **motor analítico doc-first**, no como plataforma inmobiliaria de captación o intermediación.
* La validación rápida debe apoyarse en **casos reales de anuncios** y en utilidad percibida por usuarios piloto, no en volumen masivo desde el inicio.

Se añaden además estos supuestos ya aclarados durante la definición:

* El **usuario principal real del MVP** no es el cliente final externo, sino el **empleado interno con función de asesoría** dentro de la empresa.
* Otros roles internos como **admin sist**, **comercial** y perfiles adicionales pueden intervenir en el sistema, aunque no sean el núcleo del uso analítico.
* El sistema se centra en **análisis bajo demanda sobre anuncios concretos**, no en procesamiento masivo.
* El criterio principal de validación temprana será **la correcta ejecución técnica del flujo completo** y el almacenamiento/consulta de resultados.
* La visualización de resultados se hará mediante **Markdown en pantalla**, no mediante formatos más complejos o procesos de edición documental adicionales.
* La frontera funcional actual debe leerse siempre a la luz del concepto completo del proyecto: motor analítico interno, basado en I-JSON, workflows y OpenAI API, con expansión futura posible pero no prioritaria en esta fase.

Se añaden además estos supuestos operativos y técnicos ya definidos:

* El **workflow** del MVP ejecutará siempre la cadena completa de análisis.
* La lógica de control de proceso debe ser **secuencial, trazable y detenible ante error**.
* El **ID de la tabla de Proyectos (PYT)** será el identificador único del proyecto.
* En **R2** existirá una carpeta exclusiva por proyecto/PYT.
* El **JSON** del proyecto se conserva entre reejeuciones.
* Los **Markdown** sí se sustituyen si se vuelve a lanzar el proceso.
* La aplicación deberá contemplar desde el MVP una lógica de **logs**, **estado**, **trazabilidad** y **sobrescritura controlada** de resultados.
* La frontera funcional actual del producto es exactamente la del **MVP inicialmente desarrollable**, sin extender todavía la responsabilidad del sistema más allá de ese alcance.
