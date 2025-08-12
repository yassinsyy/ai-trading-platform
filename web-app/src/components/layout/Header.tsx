'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, BarChart3, ShoppingCart, Settings } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Offers', href: '/offers' },
    { name: 'Возможности', href: '#features' },
    { name: 'Дашборд', href: '#dashboard' },
    { name: 'Тарифы', href: '#pricing' },
    { name: 'Контакты', href: '#contact' },
  ]

  return (
    <header className="bg-trading-primary/95 backdrop-blur-sm border-b border-trading-accent/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Логотип */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-trading-accent rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-trading-primary" />
              </div>
              <span className="text-xl font-bold text-trading-accent">AI Trading</span>
            </Link>
          </div>

          {/* Десктопная навигация */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-trading-textSecondary hover:text-trading-accent transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Правая часть */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="btn-secondary"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="btn-primary"
            >
              Начать бесплатно
            </Link>
          </div>

          {/* Мобильное меню */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-trading-textSecondary hover:text-trading-accent transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Мобильная навигация */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-trading-secondary/50 rounded-lg mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-trading-textSecondary hover:text-trading-accent transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block px-3 py-2 text-trading-accent hover:text-trading-accent2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 bg-trading-accent text-trading-primary rounded-lg mx-3 text-center font-semibold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Начать бесплатно
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
