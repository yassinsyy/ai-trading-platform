import React from 'react';

const BIBlogArticle: React.FC = () => {
  return (
    <section id="bi-benefits" className="bi-blog-article">
      <div className="container">
        <article className="blog-content">
          
          {/* Заголовок статьи */}
          <header className="article-header">
            <h1 className="article-title">📊 Зачем бизнесу нужен BI: честный разговор</h1>
            <div className="article-meta">
              <time dateTime="2025-08-04">4 августа 2025</time>
              <span className="reading-time">⏱️ Время чтения: 10 минут</span>
            </div>
          </header>

          {/* Вступление */}
          <section className="article-intro">
            <p>
              Бизнес умирает не от конкурентов, а от слепоты.
              Когда руководитель принимает решения, не видя всей картины, он играет в рулетку.
            </p>
            
            <p>
              Сегодня компании в Казахстане и по всему миру сталкиваются с одним вызовом: 
              <strong>как управлять на основе фактов, а не интуиции</strong>.
              Ответ — <strong>Business Intelligence (BI)</strong>.
            </p>

            <div className="article-image">
              <img 
                src="placeholder.jpg" 
                alt="Бизнес без BI - корабль в тумане без карты" 
                className="intro-image"
              />
              <p className="image-caption">📸 Метафора: корабль в тумане / бизнес без карты</p>
            </div>
          </section>

          {/* Что такое BI */}
          <section className="bi-definition">
            <h2>Что такое BI простыми словами</h2>
            
            <p>BI — это не красивые графики. Это:</p>
            
            <ul className="bi-features">
              <li>Сбор данных из 1С, Excel, CRM, банков.</li>
              <li>Объединение в одну систему.</li>
              <li>Прозрачные отчёты и визуализации.</li>
              <li>Возможность видеть бизнес целиком: финансы, продажи, маркетинг, запасы, персонал.</li>
            </ul>

            <div className="article-image">
              <img 
                src="placeholder.jpg" 
                alt="Инфографика: Из хаоса Excel в единый BI-дэшборд" 
                className="infographic"
              />
              <p className="image-caption">📸 Инфографика: "Из хаоса Excel → в единый BI-дэшборд"</p>
            </div>
          </section>

          {/* Проблемы без BI */}
          <section className="problems-without-bi">
            <h2>Почему без BI бизнес теряет деньги</h2>
            
            <div className="problems-grid">
              <div className="problem-card">
                <h3>❌ Финансовая слепота</h3>
                <p>Нет реальной картины по маржинальности, cash flow, точкам утечки.</p>
              </div>
              
              <div className="problem-card">
                <h3>❌ Ошибочные решения</h3>
                <p>Инвестиции и маркетинг "на глазок".</p>
              </div>
              
              <div className="problem-card">
                <h3>❌ Хаос в данных</h3>
                <p>Excel, Google Sheets и 1С никогда не сходятся.</p>
              </div>
              
              <div className="problem-card">
                <h3>❌ Медленное реагирование</h3>
                <p>Отчет неделями, конкуренты действуют быстрее.</p>
              </div>
            </div>
          </section>

          {/* BI как инструмент выживания */}
          <section className="bi-survival-tool">
            <h2>BI как инструмент выживания</h2>
            
            <p>
              BI — это не мода, а вопрос выживания бизнеса.
              С его помощью:
            </p>
            
            <ul className="bi-benefits-list">
              <li>✅ Снижение затрат и контроль расходов.</li>
              <li>✅ Быстрое выявление проблемных направлений.</li>
              <li>✅ Управление на основе KPI.</li>
              <li>✅ Рост рентабельности.</li>
            </ul>

            <div className="article-image">
              <img 
                src="placeholder.jpg" 
                alt="Сравнение: До BI и После BI" 
                className="comparison-image"
              />
              <p className="image-caption">📸 Картинка: "До BI / После BI" с наглядным сравнением</p>
            </div>
          </section>

          {/* Доверие к цифрам */}
          <section className="trust-in-numbers">
            <h2>BI и доверие к цифрам</h2>
            
            <blockquote className="quote">
              "Правда в бизнесе — это цифры, которые ты видишь каждый день."
            </blockquote>
            
            <p>BI создает <strong>единый источник правды</strong>:</p>
            
            <ul>
              <li>Все смотрят на одну версию данных.</li>
              <li>Больше никаких "правильных" Excel.</li>
              <li>Решения — на основе фактов, а не эмоций.</li>
            </ul>
          </section>

          {/* Практические выгоды */}
          <section className="practical-benefits">
            <h2>Практические выгоды BI</h2>
            
            <div className="benefits-grid">
              <div className="benefit-card">
                <h3>🔹 Финансы</h3>
                <p>P&L, Cash Flow, Баланс — всё обновляется автоматически.</p>
              </div>
              
              <div className="benefit-card">
                <h3>🔹 Продажи</h3>
                <p>Динамика клиентов, дебиторка, средний чек.</p>
              </div>
              
              <div className="benefit-card">
                <h3>🔹 Маркетинг</h3>
                <p>ROI каналов, эффективность кампаний.</p>
              </div>
              
              <div className="benefit-card">
                <h3>🔹 Производство и запасы</h3>
                <p>Себестоимость, склад, оборачиваемость.</p>
              </div>
              
              <div className="benefit-card">
                <h3>🔹 HR</h3>
                <p>Эффективность сотрудников, текучесть кадров.</p>
              </div>
            </div>

            <div className="article-image">
              <img 
                src="placeholder.jpg" 
                alt="Карточки с иконками по каждому блоку BI" 
                className="benefits-icons"
              />
              <p className="image-caption">📸 Карточки с иконками по каждому блоку</p>
            </div>
          </section>

          {/* BI для Казахстанского бизнеса */}
          <section className="bi-kazakhstan">
            <h2>BI для Казахстанского бизнеса</h2>
            
            <p>
              Наши компании растут быстро, но процессы не успевают.
              BI закрывает эту брешь:
            </p>
            
            <ul>
              <li>Дает владельцу контроль.</li>
              <li>Дисциплинирует команду.</li>
              <li>Снижает зависимость от человеческого фактора.</li>
            </ul>
          </section>

          {/* Кто выигрывает */}
          <section className="who-benefits">
            <h2>Кто выигрывает больше всех</h2>
            
            <div className="beneficiaries-grid">
              <div className="beneficiary-card">
                <h3>👤 Собственники</h3>
                <p>Получают прозрачность.</p>
              </div>
              
              <div className="beneficiary-card">
                <h3>📊 Финансисты</h3>
                <p>Освобождаются от рутины.</p>
              </div>
              
              <div className="beneficiary-card">
                <h3>👥 Менеджеры</h3>
                <p>Управляют по KPI.</p>
              </div>
            </div>
          </section>

          {/* Мифы о BI */}
          <section className="bi-myths">
            <h2>Мифы о BI</h2>
            
            <div className="myths-list">
              <div className="myth-item">
                <h3>❌ "Это дорого"</h3>
                <p>→ Ошибки обходятся дороже.</p>
              </div>
              
              <div className="myth-item">
                <h3>❌ "Слишком сложно"</h3>
                <p>→ Внедрение за недели, а не годы.</p>
              </div>
              
              <div className="myth-item">
                <h3>❌ "У нас и так всё понятно"</h3>
                <p>→ До первого кризиса.</p>
              </div>
            </div>
          </section>

          {/* Культура компании */}
          <section className="company-culture">
            <h2>BI и культура компании</h2>
            
            <p>
              Главная ценность BI — не цифры, а <strong>мышление команды</strong>:
            </p>
            
            <ul>
              <li>Совещания на фактах, а не эмоциях.</li>
              <li>Ответственность и прозрачность.</li>
              <li>Доверие внутри компании.</li>
            </ul>
          </section>

          {/* Заключение */}
          <section className="conclusion">
            <h2>Заключение</h2>
            
            <blockquote className="quote">
              Эдвард Мэрроу говорил:<br />
              <em>"To be believable we must be truthful."</em>
            </blockquote>
            
            <p><strong>BI — это инструмент правды.</strong></p>
            <p>
              Он делает компанию честной перед самой собой и даёт владельцу контроль над будущим.
            </p>
            
            <div className="call-to-action">
              <p>
                👉 BI нужен не тем, кто хочет "красивые графики", а тем, кто хочет управлять бизнесом уверенно.
              </p>
            </div>
          </section>

          {/* CTA секция */}
          <section className="article-cta">
            <div className="cta-content">
              <h3>⚡ Внедряем BI для бизнеса в Казахстане</h3>
              <p>
                От автоматизации управленческой отчетности до комплексных систем KPI.
              </p>
              <button className="cta-button">
                📩 Оставить заявку
              </button>
            </div>
          </section>

        </article>
      </div>
    </section>
  );
};

export default BIBlogArticle; 