# Diagramas de Secuencia

> **Documento:** FASE 3 — Diseño  
> **Fuente principal:** [`02 api-contract.md`](../fase02/02%20api-contract.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento describe las secuencias de interacción entre componentes para los flujos principales definidos en la especificación funcional.

---

## Convenciones

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as API Worker
    participant WF as Workflow Worker
    participant D1 as D1 Database
    participant R2 as R2 Storage
    participant OAI as OpenAI API
```

---

## Secuencia 1: Crear Proyecto desde I-JSON

```mermaid
sequenceDiagram
    UI->>API: POST /api/v1/proyectos<br/with I-JSON
    API->>API: Validar I-JSON<br/JSON válido?
    alt JSON inválido
        API-->>UI: 400 ValidationError<br/"I-JSON inválido"
    else JSON válido
        API->>D1: INSERT INTO proyectos<br/with nombre, descripcion, i_json, estado='creado'
        D1-->>API: Proyecto creado<br/with proyecto_id
        API->>R2: PUT r2-almacen/dir-api-inmo/{proyecto_id}/{proyecto_id}.json<br/with I-JSON
        R2-->>API: I-JSON almacenado<br/with i_json_url
        API-->>UI: 201 Created<br/with proyecto details
    end
```

---

## Secuencia 2: Ejecutar Workflow de Análisis

```mermaid
sequenceDiagram
    UI->>API: POST /api/v1/proyectos/{proyecto_id}/workflows/ejecutar<br/with confirmar_reejecucion
    API->>API: Validar estado del proyecto<br/estado is 'creado' or 'analisis_con_error'?
    alt Estado inválido
        API-->>UI: 400 ValidationError<br/"Proyecto no está en estado válido"
    else Estado válido
        alt Tiene análisis previos?
            API->>UI: ¿Confirmar reejecución?
            alt Usuario cancela
                UI--xAPI: Usuario cancela
            else Usuario confirma
                API->>D1: INSERT INTO ejecuciones<br/with proyecto_id, estado='iniciada', fecha_inicio=NOW()
                D1-->>API: Ejecución creada<br/with ejecucion_id
                API->>D1: UPDATE proyectos<br/SET estado='procesando_analisis', fecha_analisis_inicio=NOW()
                D1-->>API: Proyecto actualizado
                API-->>UI: 200 OK<br/with ejecucion_id
                API->>WF: Iniciar workflow<br/with proyecto_id, ejecucion_id
                WF->>WF: Crear 9 pasos en estado 'pendiente'
                WF-->>API: Workflow iniciado<br/with ejecucion details
                loop Para cada paso (1-9)
                    WF->>WF: Actualizar estado paso a 'en_ejecucion'
                    WF->>D1: UPDATE pasos<br/SET estado='en_ejecucion', fecha_inicio=NOW()
                    WF->>R2: GET {proyecto_id}.json<br/from R2
                    R2-->>WF: I-JSON obtenido
                    WF->>OAI: POST /v1/chat/completions<br/with prompt + I-JSON
                    alt OpenAI API success
                        OAI-->>WF: Markdown generado
                        WF->>R2: PUT {tipo_paso}.md<br/with Markdown content
                        R2-->>WF: Archivo almacenado<br/with ruta_archivo_r2
                        WF->>D1: UPDATE pasos<br/SET estado='correcto', fecha_fin=NOW(), ruta_archivo_r2
                    else OpenAI API error
                        WF->>R2: APPEND log.txt<br/with error details
                        R2-->>WF: Log actualizado
                        WF->>D1: UPDATE pasos<br/SET estado='error', fecha_fin=NOW(), error_mensaje
                        WF->>D1: UPDATE ejecuciones<br/SET estado='finalizada_con_error', fecha_fin=NOW(), error_mensaje
                        WF->>API: Error en paso {tipo_paso}<br/with error details
                        API-->>UI: Notificar error en paso {tipo_paso}
                end
                alt Todos los pasos completados sin errores
                    WF->>D1: UPDATE proyectos<br/SET estado='analisis_finalizado', fecha_analisis_fin=NOW()
                    WF->>D1: UPDATE ejecuciones<br/SET estado='finalizada_correctamente', fecha_fin=NOW()
                    WF-->>API: Workflow completado<br/with ejecucion details
                    API-->>UI: 200 OK<br/with ejecucion details
                end
        end
    end
```

---

## Secuencia 3: Consultar Resultados de Análisis

```mermaid
sequenceDiagram
    UI->>API: GET /api/v1/proyectos/{proyecto_id}/resultados
    API->>D1: SELECT * FROM proyectos<br/WHERE id = proyecto_id
    D1-->>API: Proyecto encontrado<br/with proyecto details
    API->>D1: SELECT * FROM informes<br/WHERE proyecto_id = proyecto_id<br/ORDER BY tipo
    D1-->>API: Informes encontrados<br/with informe details
    alt Estado del proyecto es 'analisis_finalizado'
        API-->>UI: 200 OK<br/with proyecto + informes list
    else Estado del proyecto no es 'analisis_finalizado'
        API-->>UI: 200 OK<br/with proyecto details<br/without informes
    end
```

---

## Secuencia 4: Obtener Informe Específico

```mermaid
sequenceDiagram
    UI->>API: GET /api/v1/proyectos/{proyecto_id}/resultados/{tipo_informe}
    API->>D1: SELECT * FROM informes<br/WHERE proyecto_id = proyecto_id AND tipo = tipo_informe
    D1-->>API: Informe encontrado<br/with informe details
    alt Informe existe
        API->>R2: GET {tipo_informe}.md<br/from R2
        R2-->>API: Markdown content
        API-->>UI: 200 OK<br/with Markdown content
    else Informe no existe
        API-->>UI: 404 Not Found<br/"Informe no encontrado"
    end
```

---

## Secuencia 5: Manejo de Errores en Workflow

```mermaid
sequenceDiagram
    WF->>WF: Ejecutar paso {tipo_paso}
    WF->>D1: UPDATE pasos<br/SET estado='en_ejecucion', fecha_inicio=NOW()
    WF->>R2: GET {proyecto_id}.json
    R2-->>WF: I-JSON obtenido
    WF->>OAI: POST /v1/chat/completions<br/with prompt + I-JSON
    alt OpenAI API timeout
        OAI--xWF: Timeout
        WF->>R2: APPEND log.txt<br/>"Error: Timeout en OpenAI API"
        R2-->>WF: Log actualizado
        WF->>D1: UPDATE pasos<br/SET estado='error', fecha_fin=NOW(), error_mensaje="Timeout en OpenAI API"
        WF->>D1: UPDATE ejecuciones<br/SET estado='finalizada_con_error', fecha_fin=NOW(), error_mensaje="Timeout en OpenAI API"
        WF->>D1: UPDATE proyectos<br/SET estado='analisis_con_error'
        WF-->>API: Error en paso {tipo_paso}<br/>Workflow detenido
        API-->>UI: Notificar error en paso {tipo_paso}
    else OpenAI API error
        OAI--xWF: Error
        WF->>R2: APPEND log.txt<br/>"Error: {error_details}"
        R2-->>WF: Log actualizado
        WF->>D1: UPDATE pasos<br/SET estado='error', fecha_fin=NOW(), error_mensaje="{error_details}"
        WF->>D1: UPDATE ejecuciones<br/SET estado='finalizada_con_error', fecha_fin=NOW(), error_mensaje="{error_details}"
        WF->>D1: UPDATE proyectos<br/SET estado='analisis_con_error'
        WF-->>API: Error en paso {tipo_paso}<br/>Workflow detenido
        API-->>UI: Notificar error en paso {tipo_paso}
    end
```

---

## Secuencia 6: Reejecución de Workflow

```mermaid
sequenceDiagram
    UI->>API: POST /api/v1/proyectos/{proyecto_id}/workflows/ejecutar<br/with confirmar_reejecucion=true
    API->>D1: SELECT * FROM proyectos<br/WHERE id = proyecto_id
    D1-->>API: Proyecto encontrado<br/with estado='analisis_finalizado'
    API->>D1: SELECT * FROM informes<br/WHERE proyecto_id = proyecto_id
    D1-->>API: Informes encontrados
    API->>R2: DELETE {proyecto_id}/resumen.md
    API->>R2: DELETE {proyecto_id}/datos_clave.md
    API->>R2: DELETE {proyecto_id}/activo_fisico.md
    API->>R2: DELETE {proyecto_id}/activo_estrategico.md
    API->>R2: DELETE {proyecto_id}/activo_financiero.md
    API->>R2: DELETE {proyecto_id}/activo_regulado.md
    API->>R2: DELETE {proyecto_id}/lectura_inversor.md
    API->>R2: DELETE {proyecto_id}/lectura_emprendedor.md
    API->>R2: DELETE {proyecto_id}/lectura_propietario.md
    R2-->>API: Informes eliminados
    API->>D1: DELETE FROM informes<br/WHERE proyecto_id = proyecto_id
    D1-->>API: Informes eliminados
    API->>D1: INSERT INTO ejecuciones<br/with proyecto_id, estado='iniciada', fecha_inicio=NOW()
    D1-->>API: Ejecución creada<br/with ejecucion_id
    API->>D1: UPDATE proyectos<br/SET estado='procesando_analisis', fecha_analisis_inicio=NOW()
    API->>D1: UPDATE proyectos<br/SET fecha_actualizacion=NOW()
    D1-->>API: Proyecto actualizado
    API->>WF: Iniciar workflow<br/with proyecto_id, ejecucion_id
    Note over API: Ejecutar pasos 1-9 (ver Secuencia 2)
    WF-->>API: Workflow completado<br/with ejecucion details
    API-->>UI: 200 OK<br/with ejecucion details
```

---

## Secuencia 7: Listar Proyectos

```mermaid
sequenceDiagram
    UI->>API: GET /api/v1/proyectos?page=1&limit=20&estado=analisis_finalizado
    API->>D1: SELECT * FROM projects<br/WHERE estado='analisis_finalizado'<br/>ORDER BY fecha_creacion DESC<br/>LIMIT 20 OFFSET 0
    D1-->>API: Proyectos encontrados
    D1->>D1: SELECT COUNT(*) FROM projects<br/WHERE estado='analisis_finalizado'
    D1-->>API: Total count
    API-->>UI: 200 OK<br/with proyectos list + pagination
```

---

## Leyenda de Componentes

| Componente | Descripción |
|-----------|-------------|
| **Frontend** | Interfaz web (React) que interactúa con el usuario |
| **API Worker** | Worker de Cloudflare que expone endpoints REST |
| **Workflow Worker** | Cloudflare Workflow que ejecuta el análisis secuencial |
| **D1 Database** | Base de datos SQLite de Cloudflare para persistencia |
| **R2 Storage** | Almacenamiento de objetos de Cloudflare para archivos |
| **OpenAI API** | API de inferencia con IA para generar informes |

---

## Leyenda de Estados

| Estado | Descripción |
|---------|-------------|
| `creado` | Proyecto creado, listo para ejecutar análisis |
| `procesando_analisis` | Análisis en ejecución |
| `analisis_con_error` | Análisis completado con errores |
| `analisis_finalizado` | Análisis completado exitosamente |

---

> **Nota:** Estos diagramas de secuencia están basados en [`01 feature-workflow-analisis.spec.md`](../fase02/01%20feature-workflow-analisis.spec.md), [`02 api-contract.md`](../fase02/02%20api-contract.md) y [`03 domain-model.md`](../fase02/03%20domain-model.md) como fuentes principales.
