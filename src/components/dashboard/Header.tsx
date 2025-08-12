import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Download, FileText, User, Bell } from "lucide-react";

export function Header() {
  return (
    <header className="bg-dark-gray border-b border-light-gray border-opacity-20 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Левая часть: контекстуальная информация */}
        <div className="flex items-center space-x-4">
          <div>
            <div className="text-xs text-light-gray uppercase tracking-wide">
              Управленческая отчётность
            </div>
            <div className="text-sm font-medium text-white">
              Август 2024 • Финальная версия
            </div>
          </div>
        </div>

        {/* Центр: Фильтры */}
        <div className="flex items-center space-x-2">
          <Select defaultValue="almaty">
            <SelectTrigger className="w-28 h-7 text-xs border-light-gray border-opacity-20 bg-dark-gray text-white">
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent className="bg-dark-gray border-light-gray border-opacity-20">
              <SelectItem value="almaty" className="text-white hover:bg-cyan hover:bg-opacity-20">Алматы</SelectItem>
              <SelectItem value="astana" className="text-white hover:bg-cyan hover:bg-opacity-20">Астана</SelectItem>
              <SelectItem value="all" className="text-white hover:bg-cyan hover:bg-opacity-20">Все регионы</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="residential">
            <SelectTrigger className="w-28 h-7 text-xs border-light-gray border-opacity-20 bg-dark-gray text-white">
              <SelectValue placeholder="Направление" />
            </SelectTrigger>
            <SelectContent className="bg-dark-gray border-light-gray border-opacity-20">
              <SelectItem value="residential" className="text-white hover:bg-cyan hover:bg-opacity-20">Жилая</SelectItem>
              <SelectItem value="commercial" className="text-white hover:bg-cyan hover:bg-opacity-20">Коммерческая</SelectItem>
              <SelectItem value="all" className="text-white hover:bg-cyan hover:bg-opacity-20">Все</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="aug2024">
            <SelectTrigger className="w-32 h-7 text-xs border-light-gray border-opacity-20 bg-dark-gray text-white">
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent className="bg-dark-gray border-light-gray border-opacity-20">
              <SelectItem value="aug2024" className="text-white hover:bg-cyan hover:bg-opacity-20">Август 2024</SelectItem>
              <SelectItem value="jul2024" className="text-white hover:bg-cyan hover:bg-opacity-20">Июль 2024</SelectItem>
              <SelectItem value="jun2024" className="text-white hover:bg-cyan hover:bg-opacity-20">Июнь 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Правая часть: Действия + профиль */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs border border-light-gray border-opacity-20 text-light-gray hover:bg-cyan hover:bg-opacity-20 hover:text-cyan">
            <FileText className="w-3 h-3 mr-1" />
            PDF
          </Button>
          
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs border border-light-gray border-opacity-20 text-light-gray hover:bg-cyan hover:bg-opacity-20 hover:text-cyan">
            <Download className="w-3 h-3 mr-1" />
            Excel
          </Button>
          
          <div className="h-5 w-px bg-light-gray bg-opacity-20 mx-1"></div>
          
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-light-gray hover:bg-cyan hover:bg-opacity-20 hover:text-cyan">
            <Bell className="w-3 h-3" />
          </Button>
          
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-light-gray hover:bg-cyan hover:bg-opacity-20 hover:text-cyan">
            <User className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </header>
  );
}