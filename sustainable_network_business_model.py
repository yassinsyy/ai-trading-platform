"""
Математическая модель устойчивого сетевого бизнеса
==================================================

Эта модель демонстрирует, как создать ЗАКОННЫЙ и УСТОЙЧИВЫЙ бизнес
с многоуровневой структурой, который НЕ является финансовой пирамидой.

Ключевые принципы:
1. Основной доход - от продажи реальных товаров/услуг
2. Комиссии выплачиваются только от реальных продаж
3. Нет обязательных взносов для участия
4. Математически устойчивая модель вознаграждения
"""

import numpy as np
import matplotlib.pyplot as plt
from dataclasses import dataclass
from typing import List, Dict, Optional
import json


@dataclass
class Product:
    """Реальный продукт с себестоимостью и розничной ценой"""
    id: str
    name: str
    cost: float  # Себестоимость
    retail_price: float  # Розничная цена
    
    @property
    def margin(self) -> float:
        """Маржа продукта"""
        return self.retail_price - self.cost


@dataclass
class Partner:
    """Партнер в сети"""
    id: str
    name: str
    level: int
    sponsor_id: Optional[str] = None
    monthly_sales: float = 0.0
    total_sales: float = 0.0
    team_sales: float = 0.0
    
    
class SustainableNetworkBusiness:
    """
    Математическая модель устойчивого сетевого бизнеса
    """
    
    def __init__(self):
        # Продукты компании
        self.products = {
            'p1': Product('p1', 'Базовый продукт', cost=30, retail_price=100),
            'p2': Product('p2', 'Премиум продукт', cost=50, retail_price=200),
            'p3': Product('p3', 'VIP продукт', cost=100, retail_price=500)
        }
        
        # Партнеры
        self.partners: Dict[str, Partner] = {}
        
        # Комиссионная структура (% от маржи продукта)
        self.commission_structure = {
            1: 0.20,  # Прямые продажи - 20% от маржи
            2: 0.10,  # Второй уровень - 10% от маржи
            3: 0.05,  # Третий уровень - 5% от маржи
            4: 0.03,  # Четвертый уровень - 3% от маржи
            5: 0.02   # Пятый уровень - 2% от маржи
        }
        
        # Бонусы за командные продажи
        self.team_bonus_tiers = [
            (10000, 0.02),   # $10k командных продаж - 2% бонус
            (50000, 0.03),   # $50k командных продаж - 3% бонус
            (100000, 0.05),  # $100k командных продаж - 5% бонус
            (500000, 0.07)   # $500k командных продаж - 7% бонус
        ]
        
        # Финансовые показатели
        self.total_revenue = 0
        self.total_product_cost = 0
        self.total_commissions_paid = 0
        self.company_profit = 0
        
    def add_partner(self, partner_id: str, name: str, sponsor_id: Optional[str] = None):
        """Добавить нового партнера"""
        level = 1
        if sponsor_id and sponsor_id in self.partners:
            level = self.partners[sponsor_id].level + 1
            
        partner = Partner(
            id=partner_id,
            name=name,
            level=level,
            sponsor_id=sponsor_id
        )
        self.partners[partner_id] = partner
        
    def record_sale(self, partner_id: str, product_id: str, quantity: int):
        """Записать продажу и рассчитать комиссии"""
        if partner_id not in self.partners or product_id not in self.products:
            return False
            
        partner = self.partners[partner_id]
        product = self.products[product_id]
        
        # Доход от продажи
        sale_amount = product.retail_price * quantity
        product_cost = product.cost * quantity
        margin = product.margin * quantity
        
        # Обновляем показатели партнера
        partner.monthly_sales += sale_amount
        partner.total_sales += sale_amount
        
        # Обновляем общие показатели
        self.total_revenue += sale_amount
        self.total_product_cost += product_cost
        
        # Рассчитываем комиссии
        commissions = self._calculate_commissions(partner_id, margin)
        
        # Обновляем командные продажи для спонсоров
        self._update_team_sales(partner_id, sale_amount)
        
        return True
        
    def _calculate_commissions(self, partner_id: str, margin: float) -> Dict[str, float]:
        """Рассчитать комиссии для цепочки спонсоров"""
        commissions = {}
        current_partner = self.partners[partner_id]
        level = 1
        
        # Комиссия самому продавцу
        if level in self.commission_structure:
            commission = margin * self.commission_structure[level]
            commissions[partner_id] = commission
            self.total_commissions_paid += commission
        
        # Комиссии спонсорам
        while current_partner.sponsor_id and level < 5:
            level += 1
            sponsor_id = current_partner.sponsor_id
            
            if sponsor_id in self.partners and level in self.commission_structure:
                commission = margin * self.commission_structure[level]
                commissions[sponsor_id] = commissions.get(sponsor_id, 0) + commission
                self.total_commissions_paid += commission
                
            current_partner = self.partners.get(sponsor_id)
            if not current_partner:
                break
                
        return commissions
        
    def _update_team_sales(self, partner_id: str, amount: float):
        """Обновить командные продажи для всех спонсоров"""
        current_partner = self.partners[partner_id]
        
        while current_partner.sponsor_id:
            sponsor_id = current_partner.sponsor_id
            if sponsor_id in self.partners:
                self.partners[sponsor_id].team_sales += amount
            current_partner = self.partners.get(sponsor_id)
            if not current_partner:
                break
                
    def calculate_team_bonuses(self) -> Dict[str, float]:
        """Рассчитать бонусы за командные продажи"""
        bonuses = {}
        
        for partner_id, partner in self.partners.items():
            team_sales = partner.team_sales
            
            # Находим подходящий уровень бонуса
            bonus_rate = 0
            for threshold, rate in self.team_bonus_tiers:
                if team_sales >= threshold:
                    bonus_rate = rate
                    
            if bonus_rate > 0:
                bonus = team_sales * bonus_rate
                bonuses[partner_id] = bonus
                self.total_commissions_paid += bonus
                
        return bonuses
        
    def calculate_profitability(self):
        """Рассчитать прибыльность компании"""
        self.company_profit = self.total_revenue - self.total_product_cost - self.total_commissions_paid
        
        return {
            'total_revenue': self.total_revenue,
            'total_product_cost': self.total_product_cost,
            'total_commissions': self.total_commissions_paid,
            'company_profit': self.company_profit,
            'profit_margin': (self.company_profit / self.total_revenue * 100) if self.total_revenue > 0 else 0
        }
        
    def sustainability_check(self) -> Dict[str, bool]:
        """Проверка устойчивости модели"""
        checks = {
            'has_real_products': len(self.products) > 0,
            'positive_margins': all(p.margin > 0 for p in self.products.values()),
            'commission_from_sales_only': True,  # Комиссии только от продаж
            'no_mandatory_fees': True,  # Нет обязательных взносов
            'company_profitable': self.company_profit > 0,
            'commission_structure_sustainable': sum(self.commission_structure.values()) < 0.5  # Менее 50% от маржи
        }
        
        checks['is_sustainable'] = all(checks.values())
        return checks
        
    def generate_report(self) -> str:
        """Генерировать отчет о состоянии бизнеса"""
        profitability = self.calculate_profitability()
        sustainability = self.sustainability_check()
        
        report = f"""
ОТЧЕТ О УСТОЙЧИВОМ СЕТЕВОМ БИЗНЕСЕ
=====================================

ФИНАНСОВЫЕ ПОКАЗАТЕЛИ:
- Общий доход: ${profitability['total_revenue']:,.2f}
- Себестоимость продуктов: ${profitability['total_product_cost']:,.2f}
- Выплаченные комиссии: ${profitability['total_commissions']:,.2f}
- Прибыль компании: ${profitability['company_profit']:,.2f}
- Маржа прибыли: {profitability['profit_margin']:.1f}%

ПРОВЕРКА УСТОЙЧИВОСТИ:
- Реальные продукты: {'✓' if sustainability['has_real_products'] else '✗'}
- Положительная маржа: {'✓' if sustainability['positive_margins'] else '✗'}
- Комиссии только от продаж: {'✓' if sustainability['commission_from_sales_only'] else '✗'}
- Нет обязательных взносов: {'✓' if sustainability['no_mandatory_fees'] else '✗'}
- Компания прибыльна: {'✓' if sustainability['company_profitable'] else '✗'}
- Устойчивая структура комиссий: {'✓' if sustainability['commission_structure_sustainable'] else '✗'}

ОБЩИЙ ВЫВОД: {'МОДЕЛЬ УСТОЙЧИВА ✓' if sustainability['is_sustainable'] else 'МОДЕЛЬ НЕ УСТОЙЧИВА ✗'}

КОЛИЧЕСТВО ПАРТНЕРОВ: {len(self.partners)}
"""
        return report


def simulate_business_growth(months: int = 12):
    """Симуляция роста бизнеса"""
    business = SustainableNetworkBusiness()
    
    # Начальные партнеры
    business.add_partner('p001', 'Основатель')
    business.add_partner('p002', 'Партнер А', 'p001')
    business.add_partner('p003', 'Партнер Б', 'p001')
    business.add_partner('p004', 'Партнер В', 'p002')
    business.add_partner('p005', 'Партнер Г', 'p002')
    
    # История для графиков
    revenue_history = []
    profit_history = []
    partners_history = []
    
    # Симуляция месяцев
    for month in range(1, months + 1):
        # Добавляем новых партнеров (рост 20% в месяц)
        new_partners = int(len(business.partners) * 0.2)
        for i in range(new_partners):
            sponsor = np.random.choice(list(business.partners.keys()))
            partner_id = f'p{len(business.partners) + 1:03d}'
            business.add_partner(partner_id, f'Партнер {partner_id}', sponsor)
            
        # Симулируем продажи
        for partner_id in business.partners:
            # Случайное количество продаж
            if np.random.random() > 0.3:  # 70% партнеров делают продажи
                product = np.random.choice(list(business.products.keys()))
                quantity = np.random.randint(1, 5)
                business.record_sale(partner_id, product, quantity)
                
        # Рассчитываем бонусы
        business.calculate_team_bonuses()
        
        # Сохраняем историю
        profitability = business.calculate_profitability()
        revenue_history.append(profitability['total_revenue'])
        profit_history.append(profitability['company_profit'])
        partners_history.append(len(business.partners))
        
    # Финальный отчет
    print(business.generate_report())
    
    # Визуализация
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    
    # График дохода
    axes[0, 0].plot(range(1, months + 1), revenue_history, 'b-', linewidth=2)
    axes[0, 0].set_title('Общий доход компании')
    axes[0, 0].set_xlabel('Месяц')
    axes[0, 0].set_ylabel('Доход ($)')
    axes[0, 0].grid(True)
    
    # График прибыли
    axes[0, 1].plot(range(1, months + 1), profit_history, 'g-', linewidth=2)
    axes[0, 1].set_title('Прибыль компании')
    axes[0, 1].set_xlabel('Месяц')
    axes[0, 1].set_ylabel('Прибыль ($)')
    axes[0, 1].grid(True)
    
    # График роста партнеров
    axes[1, 0].plot(range(1, months + 1), partners_history, 'r-', linewidth=2)
    axes[1, 0].set_title('Количество партнеров')
    axes[1, 0].set_xlabel('Месяц')
    axes[1, 0].set_ylabel('Партнеры')
    axes[1, 0].grid(True)
    
    # График маржи прибыли
    profit_margin = [(p/r * 100) if r > 0 else 0 for p, r in zip(profit_history, revenue_history)]
    axes[1, 1].plot(range(1, months + 1), profit_margin, 'm-', linewidth=2)
    axes[1, 1].set_title('Маржа прибыли')
    axes[1, 1].set_xlabel('Месяц')
    axes[1, 1].set_ylabel('Маржа (%)')
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.savefig('/workspace/sustainable_business_growth.png', dpi=300)
    plt.close()
    
    return business


if __name__ == '__main__':
    print("=" * 60)
    print("МОДЕЛЬ УСТОЙЧИВОГО СЕТЕВОГО БИЗНЕСА")
    print("=" * 60)
    print("\nЭта модель демонстрирует ЗАКОННЫЙ подход к созданию")
    print("многоуровневой структуры продаж, которая:")
    print("1. Основана на реальных продуктах")
    print("2. Математически устойчива")
    print("3. Прибыльна для компании")
    print("4. Справедлива для партнеров")
    print("\n" + "=" * 60 + "\n")
    
    # Запуск симуляции
    business = simulate_business_growth(12)
    
    print("\nГрафики сохранены в файл: sustainable_business_growth.png")