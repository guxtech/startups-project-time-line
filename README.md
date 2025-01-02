# Project Timeline

## Descripción
Project Timeline es una aplicación web desarrollada en React para la gestión y planificación de proyectos. Permite a los usuarios crear, gestionar y dar seguimiento a proyectos a través de épicas y líneas de tiempo.

## Características Principales

### Gestión de Proyectos
- Creación de nuevos proyectos
- Importación y exportación de proyectos en formato JSON
- Dashboard con métricas clave del proyecto:
  - Horas estimadas
  - Progreso general
  - Total de tareas
  - Fase actual
  - Gráfico de horas consumidas vs estimadas

### Gestión de Épicas
- Creación y edición de épicas
- Asignación de estados:
  - No Iniciada
  - En Progreso
  - Completada
  - Atrasada
- Organización temporal con fechas de inicio y fin
- Sistema de etiquetas para categorización

### Configuración de Proyecto
- Personalización del nombre del proyecto
- Gestión de la fase actual
- Configuración del período de visualización
- Sistema de etiquetas personalizable
- Actualización de métricas y progreso

### Visualización
- Timeline interactivo de épicas
- Dashboard con métricas en tiempo real
- Exportación de informes en PDF
- Interfaz moderna y responsive

## Estructura del Proyecto

```
src/
  ├── components/
  │   ├── WelcomeScreen.tsx      # Pantalla inicial y listado de proyectos
  │   ├── ProjectDashboard.tsx   # Dashboard principal del proyecto
  │   ├── ProjectSummary.tsx     # Resumen y métricas del proyecto
  │   ├── ProjectSettings.tsx    # Configuración del proyecto
  │   ├── EpicsManager.tsx       # Gestión de épicas
  │   └── Timeline.tsx           # Visualización de la línea de tiempo
  └── App.tsx                    # Configuración de rutas principales
```

## Tecnologías Utilizadas
- React
- React Router para navegación
- Tailwind CSS para estilos
- date-fns para manejo de fechas
- html2canvas y jsPDF para exportación de PDF 