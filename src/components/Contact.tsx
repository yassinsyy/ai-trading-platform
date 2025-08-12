import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    console.log('Form submitted:', formData);
    alert('Спасибо за сообщение! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 bg-primary-medium/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-gilroy-bold mb-6">
            <span className="gradient-text">Свяжитесь</span> с нами
          </h2>
          <p className="text-xl text-primary-gray max-w-3xl mx-auto">
            Готовы начать проект? Свяжитесь с нами, и мы обсудим ваши идеи 
            и создадим что-то удивительное вместе.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Контактная форма */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-gilroy-medium text-primary-light mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-primary-dark/50 border border-primary-accent/30 rounded-lg text-primary-white placeholder-primary-gray focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all duration-300"
                  placeholder="Введите ваше имя"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-gilroy-medium text-primary-light mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-primary-dark/50 border border-primary-accent/30 rounded-lg text-primary-white placeholder-primary-gray focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all duration-300"
                  placeholder="Введите ваш email"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-gilroy-medium text-primary-light mb-2">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-primary-dark/50 border border-primary-accent/30 rounded-lg text-primary-white placeholder-primary-gray focus:outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all duration-300 resize-none"
                  placeholder="Расскажите о вашем проекте"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full btn-primary text-lg py-4"
              >
                Отправить сообщение
              </motion.button>
            </form>
          </motion.div>
          
          {/* Контактная информация */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2"
          >
            <div className="space-y-8">
              <div className="card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-gilroy-bold text-primary-light">Email</h3>
                    <p className="text-primary-gray">info@freshproject.com</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-gilroy-bold text-primary-light">Телефон</h3>
                    <p className="text-primary-gray">+7 (999) 123-45-67</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-light/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-gilroy-bold text-primary-light">Адрес</h3>
                    <p className="text-primary-gray">Москва, Россия</p>
                  </div>
                </div>
              </div>

              {/* Социальные сети */}
              <div className="pt-6">
                <h3 className="text-lg font-gilroy-bold text-primary-light mb-4">Мы в соцсетях</h3>
                <div className="flex space-x-4">
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary-dark transition-all duration-300"
                  >
                    📘
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary-dark transition-all duration-300"
                  >
                    📷
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary-dark transition-all duration-300"
                  >
                    🐦
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.1, y: -2 }}
                    className="w-10 h-10 bg-primary-light/20 rounded-full flex items-center justify-center text-primary-light hover:bg-primary-light hover:text-primary-dark transition-all duration-300"
                  >
                    💼
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
