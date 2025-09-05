
# Ajustes Estéticos v1 (SweepsTouch – Tablet)

Estos cambios aplican **solo a nivel de presentación**, dejando lista la estructura para:
- **Omitir temporalmente** la *botonera dorada (CTA)*, **conservando el espacio** para colocarla más adelante sin que se mueva el resto.
- Mantener el **panel derecho** tal como estaba (con su modal/enlace).
- Asegurar **alto pantalla completa (100vh)** en tablets y evitar el doble scroll.
- Mostrar el **logo de la tienda** desde la BD (si `store.image` viene en la respuesta).

## Cambios puntuales
1. **`src/component/left-pannel.tsx`**
   - Nuevo prop opcional `showCTA?: boolean` (por defecto `false`).
   - Todas las instancias de `CallToActionButton` quedan condicionadas a `showCTA`. Si está en `false`, se pinta un `Box` de **120px** de alto como **espaciador** para que el layout coincida con el mock sin la botonera.
2. **`src/component/tablet.tsx`**
   - Se pasa `showCTA={false}` al `<LeftPanel />`.
   - Se forzó `height: "100vh"` y `overflow: "hidden"` en el contenedor principal para eliminar scrolls extra.
3. **`src/component/right-pannel.tsx`**
   - Si existe `store.image`, se renderiza **arriba del bloque del nombre** un `Image` con el logo de la tienda (ajuste común solicitado: _“arriba de Contact Us se debe cargar el logo de la tienda”_).
4. **`src/app/page.tsx`**
   - `height: "100vh"` en el wrapper del loader.

## Cómo reactivar la botonera dorada
- Cambia a `showCTA={true}` en `src/component/tablet.tsx` o pásalo desde tu contenedor.
- No se pierde el espaciado del layout.

## Notas
- No se tocaron flujos de API ni lógica de negocio.
- Si ves la **botonera duplicada** en builds previas, ahora queda **una sola** (y oculta por defecto) al centralizar su render en `LeftPanel` mediante `showCTA`.

