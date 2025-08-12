import { ProjectCard } from "./ProjectCard";
import { projectsData } from "./data/projects";
import { Building2, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export function ProjectsSection() {
  // Подсчёт статистики проектов
  const totalProjects = projectsData.length;
  const onTrackProjects = projectsData.filter(p => p.status === 'ontrack').length;
  const riskProjects = projectsData.filter(p => p.status === 'risk').length;
  const delayProjects = 0; // Нет проектов со статусом 'delay' в данных

  const avgProgress = Math.round(projectsData.reduce((sum, p) => sum + p.progress, 0) / totalProjects);

  return (
    <div className="p-6">
      {/* Заголовок */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading font-semibold mb-1 text-white">
              Projects & Operations
            </h1>
            <p className="text-light-gray">
              Операционная деятельность • Август 2024
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-small text-light-gray">Всего проектов</div>
            <div className="font-semibold text-white text-xl">{totalProjects}</div>
          </div>
        </div>
      </div>

      {/* Краткая статистика по проектам */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card p-4">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="w-4 h-4 text-light-gray" />
            <span className="text-small text-light-gray">В срок</span>
          </div>
          <div className="text-xl font-bold text-white">{onTrackProjects}</div>
          <div className="text-small text-light-gray">проектов</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-small text-light-gray">Под риском</span>
          </div>
          <div className="text-xl font-bold text-amber-600">{riskProjects}</div>
          <div className="text-small text-light-gray">проектов</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-small text-light-gray">Отставание</span>
          </div>
          <div className="text-xl font-bold text-red-600">{delayProjects}</div>
          <div className="text-small text-light-gray">проектов</div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Building2 className="w-4 h-4 text-light-gray" />
            <span className="text-small text-light-gray">Средняя готовность</span>
          </div>
          <div className="text-xl font-bold text-white">{avgProgress}%</div>
          <div className="text-small text-light-gray">по портфелю</div>
        </div>
      </div>

      {/* Заголовок списка проектов */}
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