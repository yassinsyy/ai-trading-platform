// components/Header/Header.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

// Навигационные пункты вынесены в отдельный модуль для поддержки i18n
const NAV_ITEMS = [
  { id: "home", label: "Главная", href: "/" },
  { id: "services", label: "Услуги", href: "/#services" },
  { id: "education", label: "Обучение", href: "/education" },
  { id: "blog", label: "Блог", href: "/blog" },
  { id: "about", label: "О нас", href: "/#about" },
  { id: "team", label: "Команда", href: "/#team" },
  { id: "cases", label: "Кейсы", href: "/#cases" },
  { id: "contact", label: "Контакты", href: "/#contact" },
];

// Десктопная навигация
const DesktopNav: React.FC<{ activeId: string; onNavClick: (id: string) => void }> = ({ activeId, onNavClick }) => (
  <nav className="hidden lg:block" aria-label="Основная навигация">
    <ul className="flex gap-2">
      {NAV_ITEMS.map((item) => (
        <li key={item.id}>
          <a
            href={item.href}
            className={clsx(
              "px-4 py-2 rounded transition",
              activeId === item.id
                ? "bg-[#00F5D4] text-[#181e1d] font-bold"
                : "text-white hover:text-[#00F5D4] hover:bg-white/10"
            )}
            aria-current={activeId === item.id ? "page" : undefined}
            onClick={(e) => {
              if (item.href.startsWith("#") || item.href.startsWith("/#")) {
                e.preventDefault();
                onNavClick(item.id);
                const section = document.getElementById(item.id);
                section?.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);

// Мобильное бургер-меню
const MobileBurger: React.FC<{ open: boolean; setOpen: (v: boolean) => void }> = ({ open, setOpen }) => (
  <button
    type="button"
    aria-label={open ? "Закрыть меню" : "Открыть меню"}
    className="lg:hidden ml-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-[#00F5D4]"
    onClick={() => setOpen(!open)}
  >
    {open ? <X size={28} /> : <Menu size={28} />}
  </button>
);

// Мобильное overlay меню (c фокус трапом)
const MobileMenuOverlay: React.FC<{
  open: boolean;
  setOpen: (v: boolean) => void;
  activeId: string;
  onNavClick: (id: string) => void;
}> = ({ open, setOpen, activeId, onNavClick }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Фокус ловим только внутри overlay
  useEffect(() => {
    if (open && overlayRef.current) {
      const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();

      // Focus trap
      const handleTab = (e: KeyboardEvent) => {
        if (!open) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        if (e.key === "Escape") {
          setOpen(false);
        }
      };
      document.addEventListener("keydown", handleTab);
      return () => document.removeEventListener("keydown", handleTab);
    }
  }, [open, setOpen]);

  // Клик вне overlay — закрытие
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-start justify-end lg:hidden"
      aria-modal="true"
      tabIndex={-1}
      role="dialog"
    >
      <div
        ref={overlayRef}
        className="w-72 h-full bg-[#101419] shadow-xl p-8 flex flex-col"
        tabIndex={0}
      >
        <button
          className="self-end mb-4 text-white"
          aria-label="Закрыть меню"
          onClick={() => setOpen(false)}
        >
          <X size={28} />
        </button>
        <nav aria-label="Мобильное меню">
          <ul className="flex flex-col gap-3">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={clsx(
                    "block px-4 py-2 rounded text-lg transition",
                    activeId === item.id
                      ? "bg-[#00F5D4] text-[#181e1d] font-bold"
                      : "text-white hover:text-[#00F5D4] hover:bg-white/10"
                  )}
                  tabIndex={0}
                  onClick={(e) => {
                    if (item.href.startsWith("#") || item.href.startsWith("/#")) {
                      e.preventDefault();
                      setOpen(false);
                      onNavClick(item.id);
                      setTimeout(() => {
                        const section = document.getElementById(item.id);
                        section?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <button
          className="mt-8 w-full py-3 rounded-xl bg-[#00F5D4] text-[#181e1d] font-semibold shadow hover:bg-[#18eac2] transition"
          aria-label="Связаться"
        >
          Связаться
        </button>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Throttled scroll: определяем активную секцию по прокрутке
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 110;
          let current = "home";
          for (const item of NAV_ITEMS) {
            if (item.href.startsWith("#") || item.href.startsWith("/#")) {
              const section = document.getElementById(item.id);
              if (section && section.offsetTop <= scrollPosition) {
                current = item.id;
              }
            }
          }
          setActiveSection(current);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed z-50 top-0 left-0 w-full bg-[#101419] bg-opacity-95 shadow-lg">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 py-3">
        {/* Logo */}
        <div className="logo">
          <a href="/" aria-label="На главную" className="font-extrabold text-xl tracking-widest text-white hover:opacity-90">
            DIM PARTNERS
          </a>
        </div>
        {/* Desktop Nav */}
        <DesktopNav activeId={activeSection} onNavClick={setActiveSection} />
        {/* CTA */}
        <button
          className="hidden lg:block ml-8 px-6 py-3 rounded-xl bg-[#00F5D4] text-[#181e1d] font-semibold shadow hover:bg-[#18eac2] transition"
          aria-label="Связаться"
        >
          Связаться
        </button>
        {/* Mobile Burger */}
        <MobileBurger open={menuOpen} setOpen={setMenuOpen} />
      </div>
      {/* Mobile Overlay Menu */}
      <MobileMenuOverlay open={menuOpen} setOpen={setMenuOpen} activeId={activeSection} onNavClick={setActiveSection} />
    </header>
  );
};

export default Header; 