import { ProjectCard } from "./ProjectCard";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { projectsData } from "./data/projects";

export function OverviewSection() {
  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-semibold mb-1 text-white">
              Executive Summary
            </h1>
            <p className="text-light-gray">
              Сводка для руководства • Август 2024
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-small text-light-gray">Обновлено</div>
            <div className="font-medium text-white">
              {new Date().toLocaleDateString('ru-RU', { 
                day: 'numeric', 
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Executive Summary KPI и визуализации */}
      <ExecutiveSummary />

      {/* Заголовок проектов */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white font-semibold">
          Детализация по проектам
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-light-gray rounded-full"></div>
            <span className="text-light-gray text-small">В срок</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-light-gray text-small">Риск</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-light-gray text-small">Отставание</span>
          </div>
        </div>
      </div>
      
      {/* Карточки проектов */}
      <div className="space-y-6">
        {projectsData.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}