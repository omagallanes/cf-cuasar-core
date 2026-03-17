# Flujo de Autenticación con Cloudflare

> **Propósito:** Documentar el proceso de autenticación requerido para desplegar en Cloudflare  
> **Última actualización:** 2026-03-17

---

## ¿Por Qué es Necesaria la Autenticación?

Para desplegar recursos en Cloudflare (Workers, D1, KV, R2, etc.), debes autenticarte con tu cuenta de Cloudflare. Sin autenticación:

- ❌ No puedes ejecutar `wrangler deploy`
- ❌ No puedes crear recursos en Cloudflare
- ❌ No puedes verificar el estado de tus recursos
- ❌ El inventario no puede auditarse contra recursos reales

---

## Métodos de Autenticación

### Método 1: Desarrollo Local (Recomendado para inicio)

**Cuándo usar:** Desarrollo en tu máquina local, pruebas iniciales, primeros despliegues.

#### Paso 1: Verificar Estado Actual

```bash
npx wrangler whoami
```

**Resultado esperado (autenticado):**
```
✔ Logged in as [tu-email] | Account ID: [tu-account-id]
```

**Resultado si NO autenticado:**
```
✘ Not logged in. Run `wrangler login` to authenticate.
```

#### Paso 2: Ejecutar Login (si no estás autenticado)

```bash
npx wrangler login
```

#### Paso 3: Seguir Flujo OAuth en Navegador

1. Se abrirá una ventana del navegador
2. Inicia sesión con tu cuenta de Cloudflare
3. Autoriza a Wrangler a acceder a tu cuenta
4. Serás redirigido de vuelta a la terminal

#### Paso 4: Verificar Éxito

```bash
npx wrangler whoami
```

Debe mostrar tu cuenta y Account ID.

---

### Método 2: CI/CD (GitHub Actions)

**Cuándo usar:** Despliegues automáticos desde GitHub Actions.

#### Paso 1: Obtener Credenciales de Cloudflare

1. Ve a [Cloudflare Dashboard → Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Haz clic en **"Create Token"**
3. Selecciona la plantilla **"Edit Cloudflare Workers"**
4. Configura:
   - **Account Resources:** `Edit` (tu cuenta)
   - **Zone Resources:** `None` (no es necesario para Workers)
5. Haz clic en **"Continue to Summary"**
6. Haz clic en **"Create Token"**
7. **Copia el token inmediatamente** (solo se muestra una vez)

#### Paso 2: Obtener Account ID

1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Tu Account ID aparece en la parte inferior derecha del dashboard
3. O ejecuta: `npx wrangler whoami` (muestra Account ID si estás autenticado)

#### Paso 3: Configurar GitHub Secrets

En tu repositorio de GitHub:

1. Ve a **Settings → Secrets and variables → Actions**
2. Haz clic en **"New repository secret"**
3. Añade estos secrets:

| Nombre del Secret | Valor |
|-------------------|-------|
| `CLOUDFLARE_API_TOKEN` | El token que copiaste en el Paso 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Tu Account ID del Paso 2 |

#### Paso 4: Verificar en Workflow

Tu workflow de GitHub Actions debe usar estos secrets:

```yaml
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

## Renovación de Autenticación

### ¿Cuándo Expira la Autenticación Local?

La autenticación local (`wrangler login`) expira periódicamente por seguridad.

**Señales de que necesitas renovar:**

- `wrangler whoami` muestra "Not logged in"
- `wrangler deploy` falla con error de autenticación
- Ha pasado más de 1 mes desde el último login

### Cómo Renovar

```bash
npx wrangler login
```

(Sigue el mismo flujo OAuth)

---

## Solución de Problemas

### Problema: "Not logged in" después de hacer login

**Causa probable:** El token expiró o se corrompió.

**Solución:**
```bash
# Limpiar credenciales antiguas
npx wrangler logout

# Volver a autenticar
npx wrangler login

# Verificar
npx wrangler whoami
```

### Problema: "Invalid API Token" en CI/CD

**Causas probables:**
1. El token expiró (fue revocado o regenerado)
2. El secret de GitHub está mal copiado
3. El token no tiene permisos suficientes

**Solución:**
1. Verifica el token en [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Si es necesario, crea un nuevo token
3. Actualiza el secret en GitHub
4. Vuelve a ejecutar el workflow

### Problema: "Account ID mismatch"

**Causa probable:** El `CLOUDFLARE_ACCOUNT_ID` no coincide con la cuenta del token.

**Solución:**
1. Verifica tu Account ID en `npx wrangler whoami`
2. Actualiza el secret `CLOUDFLARE_ACCOUNT_ID` en GitHub
3. Asegúrate de que el token fue creado para la misma cuenta

---

## Verificación del Estado de Autenticación

### Comando Rápido

```bash
npx wrangler whoami
```

### Interpretar Resultados

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| `✔ Logged in as [email]` | Autenticado correctamente | ✅ Continuar trabajando |
| `✘ Not logged in` | No autenticado | Ejecutar `wrangler login` |
| `Error: Invalid API Token` | Token inválido o expirado | Renovar token o hacer login |

### Verificar en Workflow de CI/CD

Añade este paso de verificación en tu workflow:

```yaml
- name: Verify Cloudflare Auth
  run: npx wrangler whoami
  env:
    CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

---

## Seguridad de las Credenciales

### NUNCA Hagas Esto

| ❌ Prohibido | Por Qué |
|-------------|---------|
| Commitear `wrangler.toml` con `account_id` hardcodeado | Expone tu cuenta en el repositorio |
| Compartir tokens de API en chat o email | Pueden ser interceptados |
| Usar el mismo token en múltiples proyectos | Si se compromete, afecta a todos |
| Almacenar tokens en archivos de texto plano | Sin encriptación, fácil de robar |

### SÍ Haces Esto

| ✅ Recomendado | Por Qué |
|---------------|---------|
| Usar GitHub Secrets para CI/CD | Encriptados y aislados |
| Usar `wrangler login` para desarrollo local | OAuth seguro, sin tokens manuales |
| Rotar tokens periódicamente | Reduce ventana de exposición |
| Usar tokens con permisos mínimos | Menor impacto si se compromete |

---

## Relación con la Gobernanza

### Regla R17 — Autenticación Requerida (en `reglas_proyecto.md`)

```markdown
### R17 — Autenticación requerida para despliegue

**Prioridad:** Crítica

- Toda operación de despliegue requiere autenticación válida con Cloudflare.
- Desarrollo local: `wrangler login` (OAuth interactivo)
- CI/CD: GitHub Secrets (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
- La autenticación debe verificarse antes de cada deploy (`wrangler whoami`).
```

### En `inventario_recursos.md`

La sección de Wrangler debe incluir:

```markdown
## 5. Wrangler y Despliegue

| Campo | Valor |
|-------|-------|
| **Estado de autenticación** | [Autenticado / No autenticado] |
| **Método** | [wrangler login / GitHub Secrets] |
| **Última verificación** | [YYYY-MM-DD] |
```

---

## Referencias

| Documento | Propósito |
|-----------|-----------|
| [START_HERE.md](../START_HERE.md) | Guía de inicio rápido |
| [reglas_proyecto.md](reglas_proyecto.md) | Regla R17 (Autenticación) |
| [inventario_recursos.md](inventario_recursos.md) | Sección de Wrangler |
| [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) | Documentación oficial |

---

**Nota:** Este documento debe actualizarse si cambian los procedimientos de autenticación de Cloudflare.
