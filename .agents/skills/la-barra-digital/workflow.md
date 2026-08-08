# Flujo de Trabajo y Evaluación de Cambios: La Barra Digital

Este documento define el protocolo obligatorio que debe seguir cualquier agente de IA antes, durante y después de realizar modificaciones al proyecto.

---

## 1. Protocolo Obligatorio de 10 Pasos

Queda estrictamente prohibido reescribir archivos masivamente sin haber completado los siguientes pasos:

1. **Inspeccionar primero:** Leer y analizar los archivos relacionados usando las herramientas de lectura del espacio de trabajo.
2. **Entender el contexto:** Comprender cómo encaja el cambio en la arquitectura global del menú y la base de datos.
3. **Identificar el problema real:** Distinguir entre un error funcional, una deficiencia estético-identitaria o una ineficiencia técnica.
4. **Explicar el problema:** Comunicar con claridad la causa raíz detectada.
5. **Proponer la solución:** Presentar una propuesta técnica o de diseño limpia, simple y directa.
6. **Evaluar el impacto y riesgos:** Analizar posibles efectos secundarios en responsive, velocidad, Firestore o seguridad.
7. **Implementar:** Escribir el código en submódulos pequeños y limpios.
8. **Probar:** Validar que el código compile correctamente (`npm run typecheck` / `build`).
9. **Revisar visualmente:** Verificar que respete la paleta cromática (Rojo/Amarillo/Café/Negro) y la presencia del producto.
10. **Revisar funcionalmente e informar:** Confirmar la conversión del flujo de compra y explicar de forma concisa los cambios realizados.

---

## 2. Filtro de Evaluación de Nuevas Funcionalidades

Antes de comenzar a desarrollar una funcionalidad nueva o sugerida, el agente debe responder internamente a las siguientes 6 preguntas:

```text
1. ¿Qué problema resuelve exactamente?
2. ¿Para quién es el beneficio (cliente, restaurante o ninguno)?
3. ¿Cómo mejora la conversión o la experiencia de compra?
4. ¿Qué complejidad técnica y mantenimiento agrega?
5. ¿Qué parte del sistema actual podría romper o ralentizar?
6. ¿Existe una solución más simple utilizando el stack existente?
```

> **Regla de Cierre:** Si la nueva funcionalidad no aporta suficiente valor real al cliente o al restaurante, el agente debe **recomendar abiertamente NO implementarla**.

---

## 3. Filosofía de Cambios Responsables

* **No asumir que algo deba reemplazarse solo por poder hacerse diferente.**
* Preservar las características que ya funcionan correctamente.
* Evitar la sobreingeniería y las abstracciones innecesarias.
