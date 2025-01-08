import { Clock8, ListTodo, BarChart2, Briefcase, Settings, Download, ListPlus } from 'lucide-react';
import type { Project } from '../types/project';
import { HoursChart } from './HoursChart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ProjectSummaryProps {
  project: Project;
  onOpenSettings: () => void;
  onOpenEpics: () => void;
}

export function ProjectSummary({ project, onOpenSettings, onOpenEpics }: ProjectSummaryProps) {
  const exportToPDF = async () => {
    try {
      const summaryElement = document.getElementById('project-summary');
      const timelineElement = document.getElementById('project-timeline');
      
      if (!summaryElement || !timelineElement) return;

      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const summaryCanvas = await html2canvas(summaryElement, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const summaryImgWidth = pdfWidth * 0.9;
      const summaryImgHeight = (summaryCanvas.height * summaryImgWidth) / summaryCanvas.width;
      
      pdf.addImage(
        summaryCanvas.toDataURL('image/png'),
        'PNG',
        pdfWidth * 0.05,
        10,
        summaryImgWidth,
        summaryImgHeight
      );

      const timelineCanvas = await html2canvas(timelineElement, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const timelineImgWidth = pdfWidth * 0.9;
      const timelineImgHeight = (timelineCanvas.height * timelineImgWidth) / timelineCanvas.width;
      
      pdf.addImage(
        timelineCanvas.toDataURL('image/png'),
        'PNG',
        pdfWidth * 0.05,
        summaryImgHeight + 20,
        timelineImgWidth,
        timelineImgHeight
      );

      pdf.save(`${project.project_name}-reporte.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  };

  return (
    <div id="project-summary" className="bg-white rounded-2xl shadow-sm border border-slate-100/50 p-6 transition-all duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {project.project_name}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={exportToPDF}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-800 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            <span className="hidden md:inline font-medium">Exportar PDF</span>
          </button>
          <button
            onClick={onOpenEpics}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 transition-all duration-200"
          >
            <ListPlus className="w-5 h-5" />
            <span className="hidden md:inline font-medium">Épicas</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 transition-all duration-200"
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-45" />
            <span className="hidden md:inline font-medium">Configuración</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex flex-col items-center text-center h-full justify-center">
            <div className="p-3 bg-blue-100/80 rounded-xl mb-3">
              <Clock8 className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-blue-600/90 mb-1">Horas Estimadas</p>
            <p className="text-3xl font-bold text-blue-900">{project.total_estimated_hours}h</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex flex-col items-center text-center h-full justify-center">
            <div className="p-3 bg-emerald-100/80 rounded-xl mb-3">
              <BarChart2 className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-sm font-medium text-emerald-600/90 mb-1">Progreso</p>
            <p className="text-3xl font-bold text-emerald-900">{project.progress_status}%</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-50/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex flex-col items-center text-center h-full justify-center">
            <div className="p-3 bg-violet-100/80 rounded-xl mb-3">
              <ListTodo className="w-6 h-6 text-violet-600" />
            </div>
            <p className="text-sm font-medium text-violet-600/90 mb-1">Tareas Totales</p>
            <p className="text-3xl font-bold text-violet-900">{project.total_tasks}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-50/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
          <div className="flex flex-col items-center text-center h-full justify-center">
            <div className="p-3 bg-amber-100/80 rounded-xl mb-3">
              <Briefcase className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-amber-600/90 mb-1">Fase Actual</p>
            <p className="text-2xl font-bold text-amber-900 leading-tight" title={project.current_phase}>
              {project.current_phase}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-50/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
          <HoursChart 
            consumedHours={project.total_consumed_hours} 
            estimatedHours={project.total_estimated_hours} 
          />
        </div>
      </div>
    </div>
  );
}