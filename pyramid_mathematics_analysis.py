"""
Математический анализ: Почему пирамиды обречены на провал
=========================================================

Этот файл демонстрирует математические доказательства того, почему 
финансовые пирамиды неустойчивы и как создать устойчивую альтернативу.
"""

import numpy as np
import matplotlib.pyplot as plt
from math import factorial
import pandas as pd


class PyramidMathematics:
    """Математический анализ финансовой пирамиды"""
    
    def __init__(self, entry_fee: float = 1000, recruitment_bonus: float = 500):
        self.entry_fee = entry_fee
        self.recruitment_bonus = recruitment_bonus
        
    def calculate_pyramid_growth(self, levels: int, recruits_per_person: int = 3):
        """
        Рассчитать экспоненциальный рост пирамиды
        
        Формула: N(L) = r^L, где:
        - N(L) - количество людей на уровне L
        - r - количество рекрутов на человека
        """
        data = []
        total_people = 1  # Основатель
        total_money_in = self.entry_fee
        total_money_out = 0
        
        for level in range(levels):
            people_at_level = recruits_per_person ** level
            money_from_level = people_at_level * self.entry_fee
            
            # Бонусы получают люди на предыдущем уровне
            if level > 0:
                bonuses_paid = (recruits_per_person ** (level - 1)) * recruits_per_person * self.recruitment_bonus
                total_money_out += bonuses_paid
            
            total_people += people_at_level
            total_money_in += money_from_level
            
            data.append({
                'level': level,
                'people_at_level': people_at_level,
                'total_people': total_people,
                'money_collected': money_from_level,
                'total_money_in': total_money_in,
                'total_money_out': total_money_out,
                'deficit': total_money_out - total_money_in
            })
            
        return pd.DataFrame(data)
    
    def calculate_saturation_point(self, world_population: int = 8_000_000_000, 
                                 recruits_per_person: int = 3):
        """
        Рассчитать, на каком уровне пирамида исчерпает население планеты
        
        Формула: L = log(P) / log(r), где:
        - L - уровень насыщения
        - P - население планеты
        - r - количество рекрутов на человека
        """
        level = np.log(world_population) / np.log(recruits_per_person)
        return int(level)
    
    def visualize_pyramid_collapse(self):
        """Визуализировать коллапс пирамиды"""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # График 1: Экспоненциальный рост участников
        levels = 15
        df = self.calculate_pyramid_growth(levels)
        
        axes[0, 0].semilogy(df['level'], df['people_at_level'], 'r-', linewidth=2)
        axes[0, 0].set_title('Экспоненциальный рост участников пирамиды')
        axes[0, 0].set_xlabel('Уровень')
        axes[0, 0].set_ylabel('Количество людей (лог. шкала)')
        axes[0, 0].grid(True)
        
        # График 2: Дефицит средств
        axes[0, 1].plot(df['level'], df['deficit'], 'b-', linewidth=2)
        axes[0, 1].axhline(y=0, color='k', linestyle='--')
        axes[0, 1].set_title('Растущий дефицит средств')
        axes[0, 1].set_xlabel('Уровень')
        axes[0, 1].set_ylabel('Дефицит ($)')
        axes[0, 1].grid(True)
        
        # График 3: Сравнение с населением Земли
        world_pop = 8_000_000_000
        axes[1, 0].semilogy(df['level'], df['total_people'], 'g-', linewidth=2, label='Участники пирамиды')
        axes[1, 0].axhline(y=world_pop, color='r', linestyle='--', label='Население Земли')
        axes[1, 0].set_title('Пирамида vs Население планеты')
        axes[1, 0].set_xlabel('Уровень')
        axes[1, 0].set_ylabel('Количество людей (лог. шкала)')
        axes[1, 0].legend()
        axes[1, 0].grid(True)
        
        # График 4: Вероятность успеха по уровням
        success_prob = [100]  # Основатель - 100% успех
        for i in range(1, levels):
            # Вероятность успеха падает экспоненциально
            prob = 100 * (0.5 ** i)
            success_prob.append(prob)
            
        axes[1, 1].plot(range(levels), success_prob, 'm-', linewidth=2)
        axes[1, 1].set_title('Вероятность получить прибыль по уровням')
        axes[1, 1].set_xlabel('Уровень')
        axes[1, 1].set_ylabel('Вероятность успеха (%)')
        axes[1, 1].grid(True)
        
        plt.tight_layout()
        plt.savefig('/workspace/pyramid_collapse_analysis.png', dpi=300)
        plt.close()
        
        return df


class SustainableBusinessMath:
    """Математика устойчивого бизнеса"""
    
    def __init__(self):
        self.product_margin = 0.7  # 70% маржа
        self.commission_rate = 0.3  # 30% от маржи на комиссии
        self.operational_costs = 0.2  # 20% операционные расходы
        
    def calculate_sustainability(self, monthly_sales: float, num_partners: int):
        """
        Рассчитать устойчивость бизнес-модели
        
        Формула прибыли: P = S * M * (1 - C - O), где:
        - P - прибыль
        - S - продажи
        - M - маржа продукта
        - C - комиссионные выплаты
        - O - операционные расходы
        """
        gross_margin = monthly_sales * self.product_margin
        commissions = gross_margin * self.commission_rate
        operations = monthly_sales * self.operational_costs
        profit = gross_margin - commissions - operations
        
        return {
            'monthly_sales': monthly_sales,
            'gross_margin': gross_margin,
            'commissions': commissions,
            'operations': operations,
            'profit': profit,
            'profit_margin': (profit / monthly_sales * 100) if monthly_sales > 0 else 0,
            'break_even_sales_per_partner': operations / (num_partners * self.product_margin * (1 - self.commission_rate))
        }
    
    def compare_models(self):
        """Сравнить пирамиду и устойчивый бизнес"""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # Сравнение 1: Источник дохода
        labels = ['Пирамида', 'Устойчивый бизнес']
        pyramid_income = [100, 0]  # 100% от новых участников
        product_income = [0, 100]  # 100% от продаж продуктов
        
        x = np.arange(len(labels))
        width = 0.35
        
        axes[0, 0].bar(x - width/2, pyramid_income, width, label='Доход от рекрутинга', color='red')
        axes[0, 0].bar(x + width/2, product_income, width, label='Доход от продаж', color='green')
        axes[0, 0].set_ylabel('Процент дохода')
        axes[0, 0].set_title('Источники дохода')
        axes[0, 0].set_xticks(x)
        axes[0, 0].set_xticklabels(labels)
        axes[0, 0].legend()
        
        # Сравнение 2: Устойчивость во времени
        months = np.arange(1, 25)
        
        # Пирамида: экспоненциальная потребность в новых участниках
        pyramid_required = 3 ** (months / 3)
        
        # Устойчивый бизнес: линейный рост
        sustainable_growth = 10 * months
        
        axes[0, 1].semilogy(months, pyramid_required, 'r-', linewidth=2, label='Пирамида (новые участники)')
        axes[0, 1].plot(months, sustainable_growth, 'g-', linewidth=2, label='Устойчивый (продажи)')
        axes[0, 1].set_xlabel('Месяцы')
        axes[0, 1].set_ylabel('Требуемый рост')
        axes[0, 1].set_title('Требования к росту для выживания')
        axes[0, 1].legend()
        axes[0, 1].grid(True)
        
        # Сравнение 3: Распределение прибыли
        pyramid_dist = [80, 15, 4, 1, 0]  # Топ получает всё
        sustainable_dist = [20, 20, 20, 20, 20]  # Равномерное распределение
        
        levels = ['Топ', 'Уровень 2', 'Уровень 3', 'Уровень 4', 'Уровень 5']
        
        axes[1, 0].bar(levels, pyramid_dist, color='red', alpha=0.7, label='Пирамида')
        axes[1, 0].bar(levels, sustainable_dist, color='green', alpha=0.7, label='Устойчивый')
        axes[1, 0].set_ylabel('% от общей прибыли')
        axes[1, 0].set_title('Распределение доходов')
        axes[1, 0].legend()
        
        # Сравнение 4: Математическая устойчивость
        criteria = ['Конечные\nресурсы', 'Реальная\nценность', 'Масштаби-\nруемость', 'Законность', 'Долгосроч-\nность']
        pyramid_scores = [0, 0, 0, 0, 0]
        sustainable_scores = [10, 10, 8, 10, 9]
        
        axes[1, 1].bar(criteria, pyramid_scores, color='red', alpha=0.7, label='Пирамида')
        axes[1, 1].bar(criteria, sustainable_scores, color='green', alpha=0.7, label='Устойчивый')
        axes[1, 1].set_ylabel('Оценка (0-10)')
        axes[1, 1].set_title('Критерии устойчивости')
        axes[1, 1].legend()
        
        plt.tight_layout()
        plt.savefig('/workspace/pyramid_vs_sustainable_comparison.png', dpi=300)
        plt.close()


def mathematical_proof_of_unsustainability():
    """Математическое доказательство неустойчивости пирамид"""
    
    print("=" * 80)
    print("МАТЕМАТИЧЕСКОЕ ДОКАЗАТЕЛЬСТВО НЕУСТОЙЧИВОСТИ ФИНАНСОВЫХ ПИРАМИД")
    print("=" * 80)
    
    print("\nТЕОРЕМА: Любая финансовая пирамида математически обречена на крах")
    print("\nДОКАЗАТЕЛЬСТВО:")
    
    print("\n1. ЭКСПОНЕНЦИАЛЬНЫЙ РОСТ")
    print("   Пусть r = количество новых участников, которых должен привести каждый")
    print("   Тогда на уровне n количество участников = r^n")
    print("   При r=3: Уровень 10 = 3^10 = 59,049 человек")
    print("           Уровень 20 = 3^20 = 3,486,784,401 человек")
    
    saturation_level = int(np.log(8_000_000_000) / np.log(3))
    print(f"\n   Уровень насыщения (население Земли): {saturation_level}")
    
    print("\n2. ОТРИЦАТЕЛЬНАЯ СУММА ИГРЫ")
    print("   Сумма всех выплат > Сумма всех взносов")
    print("   Это математически невозможно без новых участников")
    
    print("\n3. ПРИНЦИП PIGEONHOLE (ДИРИХЛЕ)")
    print("   Если выплаты > взносы, то существует подмножество участников")
    print("   с гарантированными убытками. Это подмножество растет экспоненциально.")
    
    print("\n4. ВЕРОЯТНОСТНЫЙ АНАЛИЗ")
    print("   P(успех) = 1/r^(n-1), где n - ваш уровень в пирамиде")
    print("   Для уровня 5 при r=3: P(успех) = 1/81 ≈ 1.2%")
    
    print("\nВЫВОД: Крах пирамиды - это не вопрос 'если', а вопрос 'когда'")
    print("=" * 80)


def main():
    """Основная функция для демонстрации"""
    
    # Анализ пирамиды
    print("\n1. АНАЛИЗ ФИНАНСОВОЙ ПИРАМИДЫ")
    print("-" * 40)
    
    pyramid = PyramidMathematics()
    df = pyramid.visualize_pyramid_collapse()
    
    saturation = pyramid.calculate_saturation_point()
    print(f"Пирамида исчерпает население Земли на уровне: {saturation}")
    print(f"Последние 5 уровней роста:")
    print(df.tail())
    
    # Анализ устойчивого бизнеса
    print("\n2. АНАЛИЗ УСТОЙЧИВОГО БИЗНЕСА")
    print("-" * 40)
    
    sustainable = SustainableBusinessMath()
    analysis = sustainable.calculate_sustainability(
        monthly_sales=100000,
        num_partners=50
    )
    
    print(f"При месячных продажах ${analysis['monthly_sales']:,.0f}:")
    print(f"- Валовая маржа: ${analysis['gross_margin']:,.0f}")
    print(f"- Комиссии партнерам: ${analysis['commissions']:,.0f}")
    print(f"- Операционные расходы: ${analysis['operations']:,.0f}")
    print(f"- Чистая прибыль: ${analysis['profit']:,.0f}")
    print(f"- Маржа прибыли: {analysis['profit_margin']:.1f}%")
    print(f"- Точка безубыточности на партнера: ${analysis['break_even_sales_per_partner']:,.0f}")
    
    # Сравнение моделей
    print("\n3. СРАВНЕНИЕ МОДЕЛЕЙ")
    print("-" * 40)
    sustainable.compare_models()
    
    # Математическое доказательство
    mathematical_proof_of_unsustainability()
    
    print("\n" + "=" * 80)
    print("ЗАКЛЮЧЕНИЕ:")
    print("Математика однозначно показывает, что только бизнес-модели,")
    print("основанные на реальной ценности и продуктах, являются устойчивыми.")
    print("Любая схема, зависящая от постоянного притока новых участников,")
    print("математически обречена на провал.")
    print("=" * 80)


if __name__ == '__main__':
    main()