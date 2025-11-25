import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { FinanceService } from '../../services/finance';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class BudgetComponent implements OnInit {
  budgets: any[] = [];
  categories: any[] = [];
  overallStatus: any = { totalBudget: 0, totalSpent: 0, remaining: 0 };

  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();

  // Safe to Spend Calculator
  daysRemaining: number = 0;
  safeDailySpend: number = 0;

  // Modal
  showSetBudget = false;
  selectedCategory: number | null = null;
  budgetAmount: number = 0;

  constructor(
    private budgetService: BudgetService,
    private financeService: FinanceService
  ) { }

  ngOnInit(): void {
    this.calculateDaysRemaining();
    this.loadCategories();
    this.loadBudgets();
  }

  calculateDaysRemaining() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.daysRemaining = lastDay.getDate() - now.getDate();
  }

  loadCategories() {
    this.financeService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  loadBudgets() {
    this.budgetService.getBudgets(this.currentMonth, this.currentYear).subscribe(data => {
      this.budgets = data;
      this.calculateSafeToSpend();
    });

    this.budgetService.getOverallStatus(this.currentMonth, this.currentYear).subscribe(data => {
      this.overallStatus = data;
      this.calculateSafeToSpend();
    });
  }

  calculateSafeToSpend() {
    if (this.daysRemaining > 0 && this.overallStatus.remaining > 0) {
      this.safeDailySpend = this.overallStatus.remaining / this.daysRemaining;
    } else {
      this.safeDailySpend = 0;
    }
  }

  openSetBudget() {
    this.showSetBudget = true;
    this.selectedCategory = null;
    this.budgetAmount = 0;
  }

  saveBudget() {
    if (this.selectedCategory && this.budgetAmount > 0) {
      this.budgetService.setBudget(this.selectedCategory, this.budgetAmount, this.currentMonth, this.currentYear)
        .subscribe(() => {
          this.showSetBudget = false;
          this.loadBudgets();
        });
    }
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }
}
