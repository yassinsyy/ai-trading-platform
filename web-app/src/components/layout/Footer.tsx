import Link from 'next/link'
import { BarChart3, Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    product: [
      { name: 'Возможности', href: '#features' },
      { name: 'Дашборд', href: '#dashboard' },
      { name: 'API', href: '/api' },
      { name: 'Документация', href: '/docs' },
    ],
    company: [
      { name: 'О нас', href: '/about' },
      { name: 'Блог', href: '/blog' },
      { name: 'Карьера', href: '/careers' },
      { name: 'Контакты', href: '#contact' },
    ],
    support: [
      { name: 'Помощь', href: '/help' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Статус', href: '/status' },
      { name: 'Поддержка', href: '/support' },
    ],
    legal: [
      { name: 'Политика конфиденциальности', href: '/privacy' },
      { name: 'Условия использования', href: '/terms' },
      { name: 'Лицензии', href: '/licenses' },
    ],
  }

  return (
    <footer className="bg-trading-primary border-t border-trading-accent/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-trading-accent rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-trading-primary" />
              </div>
              <span className="text-xl font-bold text-trading-accent">AI Trading</span>
            </div>
            <p className="text-trading-textSecondary mb-6 max-w-md">
              ИИ-автопилот для торговли на маркетплейсах. Автоматизируйте прайсинг, 
              находите возможности и увеличивайте прибыль с помощью искусственного интеллекта.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-trading-textSecondary hover:text-trading-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-trading-textSecondary hover:text-trading-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-trading-textSecondary hover:text-trading-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Ссылки */}
          <div>
            <h3 className="text-trading-text font-semibold mb-4">Продукт</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-trading-textSecondary hover:text-trading-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-trading-text font-semibold mb-4">Компания</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-trading-textSecondary hover:text-trading-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-trading-text font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-trading-textSecondary hover:text-trading-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="mt-12 pt-8 border-t border-trading-accent/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-trading-accent" />
              <span className="text-trading-textSecondary">support@aitrading.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-trading-accent" />
              <span className="text-trading-textSecondary">+7 (800) 555-0123</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-trading-accent" />
              <span className="text-trading-textSecondary">Москва, Россия</span>
            </div>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="mt-8 pt-8 border-t border-trading-accent/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-trading-textSecondary text-sm">
              © {currentYear} AI Trading Platform. Все права защищены.
            </div>
            <div className="flex space-x-6 text-sm">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-trading-textSecondary hover:text-trading-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
