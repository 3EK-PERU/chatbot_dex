---
name: incremental-project-builder
description: "Usar cuando el usuario pida construir un proyecto paso a paso, en pequeños incrementos, con aprobacion explicita en cada fase y sin generar todo de una sola vez. Keywords: paso a paso, incremental, pequenos incrementos, esperar aprobacion, no generar todo junto."
---

# Incremental Project Builder

## Objetivo

Guiar la construccion de un proyecto en iteraciones pequenas y controladas.

## Flujo obligatorio por paso

Para cada paso, seguir estrictamente este orden:

1. Explicar que se va a construir en este paso.
2. Explicar por que este paso es necesario dentro de la arquitectura.
3. Mostrar la estructura de carpetas impactada por este paso.
4. Generar unicamente el codigo correspondiente a este paso.
5. Detenerse y esperar la aprobacion explicita del usuario antes de continuar.

## Restricciones

- No generar todo el proyecto en una sola respuesta.
- No adelantarse a pasos futuros sin aprobacion del usuario.
- No mezclar cambios de varios pasos en una misma iteracion.
- Si faltan decisiones de negocio o tecnicas criticas, preguntar antes de codificar.

## Formato de respuesta sugerido

Usar siempre secciones breves y consistentes:

- Paso actual
- Que construiremos
- Por que es necesario
- Estructura de carpetas de este paso
- Codigo de este paso
- Estado: "Esperando tu aprobacion para continuar"

## Criterios de calidad

- Mantener SOLID y separacion por capas cuando aplique.
- Evitar logica en controladores o puntos de entrada.
- Priorizar codigo listo para produccion en cada incremento.
- Mantener cambios pequenos, verificables y reversibles.
