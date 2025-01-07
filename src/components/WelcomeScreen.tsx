import React, { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LayoutDashboard, LogOut, Plus as PlusIcon, Upload, Settings } from 'lucide-react'
import { format, parse } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useProjects } from '../hooks/useProjects'
import { projectService } from '../services/projectService'
import { tagService } from '../services/tagService'
import { epicService } from '../services/epicService'
import type { ImportedProject, ImportedEpic, ImportedTag } from '../types/project'

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { projects, loading, createProject } = useProjects()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCreateProject = async () => {
    const startDate = new Date()
    const newProject = {
      project_name: "Nuevo Proyecto",
      total_estimated_hours: 0,
      total_consumed_hours: 0,
      current_phase: "Planificación",
      total_tasks: 0,
      progress_status: 0,
      start_month: format(startDate, 'MMMM yyyy', { locale: es }),
      months_to_display: 6,
      project_date: startDate.toISOString(),
      user_id: user?.id || ''
    }

    try {
      const createdProject = await createProject(newProject);
      navigate(`/project/${createdProject.id}`);
    } catch (err) {
      console.error('Error al crear proyecto:', err)
    }
  }

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string) as ImportedProject
        
        // Validate required fields
        if (!importedData.projectName) {
          throw new Error('El archivo no contiene un nombre de proyecto válido')
        }

        // Create new project structure for Supabase
        const startDate = new Date()
        
        // First, create the project without relations
        const projectData = {
          project_name: importedData.projectName,
          total_estimated_hours: importedData.totalEstimatedHours || 0,
          total_consumed_hours: importedData.totalConsumedHours || 0,
          current_phase: importedData.currentPhase || 'Planificación',
          total_tasks: importedData.totalTasks || 0,
          progress_status: importedData.progressStatus || 0,
          start_month: importedData.startMonth || format(startDate, 'MMMM yyyy', { locale: es }),
          months_to_display: importedData.monthsToDisplay || 6,
          project_date: startDate.toISOString(),
          user_id: user?.id || ''
        }

        try {
          // Create the project first
          const createdProject = await projectService.createProject(projectData)

          // Then create tags
          const createdTags = await Promise.all(
            (importedData.tags || []).map(async (tag: ImportedTag) => {
              const tagData = {
                name: tag.name,
                color: tag.color,
                project_id: createdProject.id
              }
              return await tagService.createTag(tagData)
            })
          )

          // Create a map of old tag IDs to new tag IDs
          const tagIdMap = new Map()
          importedData.tags.forEach((oldTag: ImportedTag, index: number) => {
            tagIdMap.set(oldTag.id, createdTags[index].id)
          })

          // Then create epics with the new tag IDs
          await Promise.all(
            (importedData.epics || []).map(async (epic: ImportedEpic, index: number) => {
              // Convert dates from Spanish format to ISO string
              const startDate = parse(epic.startDate, "d 'de' MMMM yyyy", new Date(), { locale: es })
              const endDate = parse(epic.endDate, "d 'de' MMMM yyyy", new Date(), { locale: es })
              
              const epicData = {
                name: epic.name,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                status: epic.status,
                tag_ids: epic.tagIds.map((oldId: string) => tagIdMap.get(oldId) || ''),
                order: index,
                project_id: createdProject.id
              }
              return await epicService.createEpic(epicData)
            })
          )

          // Navigate to the new project
          navigate(`/project/${createdProject.id}`)
        } catch (err) {
          console.error('Error al crear el proyecto en Supabase:', err)
          throw new Error('No se pudo crear el proyecto en la base de datos')
        }
      } catch (err) {
        console.error('Error al importar proyecto:', err)
        alert(err instanceof Error ? err.message : 'Error al importar el proyecto')
      }
    }
    reader.readAsText(file)
    // Reset input value to allow importing the same file again
    event.target.value = ''
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 p-6 flex flex-col">
        <div className="flex items-center mb-8">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
            Project Timeline
          </Link>
        </div>
        
        {/* User Info */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm font-medium text-gray-900">{user?.email}</p>
          <p className="text-xs text-gray-500 mt-1">Logged in</p>
        </div>

        <nav className="space-y-4 flex-1">
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-blue-600 bg-blue-50 rounded-xl p-4 hover:bg-blue-100 transition-colors"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link 
            to="/settings" 
            className="flex items-center space-x-3 text-gray-600 hover:bg-gray-50 rounded-xl p-4 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center space-x-2 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="max-w-[1400px] mx-auto p-4" >
          <div className="grid grid-cols-3 gap-8 mb-8">
            {/* Quick Actions Card */}
            <div className="col-span-2 bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300 mb-2">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 gap-8">
                {/* Create Project Button */}
                <button
                  onClick={handleCreateProject}
                  className="group flex flex-col items-start p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-300 border-2 border-blue-100 hover:border-blue-200 mb-4"
                >
                  <div className="p-4 bg-blue-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <PlusIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xl mb-2">Nuevo Proyecto</h3>
                    <p className="text-sm text-gray-600">Comenzar desde cero</p>
                  </div>
                </button>

                {/* Import Project Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportProject}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex flex-col items-start p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all duration-300 w-full border-2 border-purple-100 hover:border-purple-200"
                  >
                    <div className="p-4 bg-purple-500 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-xl mb-2">Importar Proyecto</h3>
                      <p className="text-sm text-gray-600">Desde archivo JSON</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-2xl font-semibold mb-8 text-gray-900">Estadísticas</h2>
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Total Proyectos</p>
                  <p className="text-4xl font-bold text-gray-900">{projects.length}</p>
                </div>
                {/* Add more stats here */}
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-8 text-gray-900">Proyectos Recientes</h2>
            <div className="space-y-4">
              {projects.length > 0 ? (
                projects.map(project => (
                  <Link
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="w-full flex items-center justify-between p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-100 hover:border-gray-200 group"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="p-4 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                        <LayoutDashboard className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">{project.project_name}</h3>
                        <p className="text-sm text-gray-600">{project.current_phase}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">{project.progress_status}%</p>
                        <p className="text-sm text-gray-600">Progreso</p>
                      </div>
                      <div className="w-32 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress_status}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No hay proyectos existentes</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}