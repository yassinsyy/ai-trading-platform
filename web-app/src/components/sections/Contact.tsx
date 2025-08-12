'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  Headphones,
  Zap,
  Shield
} from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  company: string
  phone: string
  message: string
  type: 'demo' | 'support' | 'partnership' | 'other'
}

export function Contact() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    type: 'demo'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Здесь будет API вызов
    console.log('Отправка формы:', form)
    
    // Имитация отправки
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    // Сброс формы
    setForm({
      name: '',
      email: '',
      company: '',
      phone: '',
      message: '',
      type: 'demo'
    })
  }

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section id="contact" className="py-20 bg-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Готовы начать?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Свяжитесь с нами для демонстрации системы, 
            настройки интеграций или получения поддержки
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Контактная информация */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Свяжитесь с командой
              </h3>
              <p className="text-slate-300 mb-8">
                Наша команда экспертов готова помочь вам настроить 
                ИИ-автопилот для вашего бизнеса на маркетплейсах.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-slate-300">hello@ai-trading.kz</p>
                  <p className="text-sm text-slate-400">Ответ в течение 2 часов</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Телефон</h4>
                  <p className="text-slate-300">+7 (727) 123-45-67</p>
                  <p className="text-sm text-slate-400">Пн-Пт 9:00-18:00</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Офис</h4>
                  <p className="text-slate-300">Алматы, ул. Примерная, 123</p>
                  <p className="text-sm text-slate-400">По предварительной записи</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Время работы</h4>
                  <p className="text-slate-300">Понедельник - Пятница</p>
                  <p className="text-sm text-slate-400">9:00 - 18:00 (GMT+6)</p>
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="pt-6 border-t border-slate-700">
              <h4 className="font-semibold mb-4">Быстрые действия</h4>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Заказать демо
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Чат поддержки
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Headphones className="w-4 h-4 mr-2" />
                  Техническая поддержка
                </Button>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl">Отправить сообщение</CardTitle>
                <CardDescription className="text-slate-400">
                  Заполните форму, и мы свяжемся с вами в ближайшее время
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-slate-300">Имя *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Ваше имя"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-slate-300">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company" className="text-slate-300">Компания</Label>
                      <Input
                        id="company"
                        value={form.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Название компании"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-slate-300">Телефон</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="+7 (___) ___-__-__"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-slate-300">Тип обращения</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {[
                        { value: 'demo', label: 'Демо системы', color: 'bg-blue-600' },
                        { value: 'support', label: 'Поддержка', color: 'bg-green-600' },
                        { value: 'partnership', label: 'Партнерство', color: 'bg-purple-600' },
                        { value: 'other', label: 'Другое', color: 'bg-slate-600' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleInputChange('type', option.value)}
                          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                            form.type === option.value 
                              ? option.color 
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-slate-300">Сообщение *</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white resize-none"
                      placeholder="Опишите ваш запрос или вопрос..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Отправка...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить сообщение
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Дополнительная информация */}
            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <Shield className="w-4 h-4" />
                <span>Ваши данные защищены и не будут переданы третьим лицам</span>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
            <div className="text-slate-400">Активных клиентов</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">98%</div>
            <div className="text-slate-400">Удовлетворенность</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
            <div className="text-slate-400">Поддержка</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-amber-400 mb-2">2ч</div>
            <div className="text-slate-400">Среднее время ответа</div>
          </div>
        </div>
      </div>
    </section>
  )
}
