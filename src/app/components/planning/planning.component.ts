import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

interface PlanItem {
  categoryName: string;
  plannedAmount: number;
  type: 'INCOME' | 'EXPENSE';
  fixed: boolean;
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {
  currentMonth: number;
  currentYear: number;

  incomeItems: PlanItem[] = [];
  fixedExpenseItems: PlanItem[] = [];
  variableExpenseItems: PlanItem[] = [];

  totalIncome = 0;
  totalFixedExpense = 0;
  totalVariableExpense = 0;
  availableForGoals = 0;

  newIncome = { categoryName: '', plannedAmount: 0 };
  newFixedExpense = { categoryName: '', plannedAmount: 0 };
  newVariableExpense = { categoryName: '', plannedAmount: 0 };

  customFixedCategory = '';
  customVariableCategory = '';

  // Predefined categories
  fixedExpenseCategories = ['Rent', 'EMI', 'Insurance', 'Subscriptions'];
  variableExpenseCategories = ['Food', 'Travel', 'Bills', 'Entertainment', 'Shopping'];

  constructor(private budgetService: BudgetService) {
    const now = new Date();
    this.currentMonth = now.getMonth() + 1;
    this.currentYear = now.getFullYear();
  }

  ngOnInit() {
    this.loadPlan();
  }

  loadPlan() {
    this.budgetService.getPlan(this.currentMonth, this.currentYear).subscribe({
      next: (plan) => {
        if (plan.items && plan.items.length > 0) {
          this.incomeItems = plan.items.filter((item: PlanItem) => item.type === 'INCOME');
          this.fixedExpenseItems = plan.items.filter((item: PlanItem) => item.type === 'EXPENSE' && item.fixed);
          this.variableExpenseItems = plan.items.filter((item: PlanItem) => item.type === 'EXPENSE' && !item.fixed);
        }
        this.calculateTotals();
      },
      error: (err) => console.error('Error loading plan:', err)
    });
  }

  addIncome() {
    if (this.newIncome.categoryName && this.newIncome.plannedAmount > 0) {
      this.incomeItems.push({
        categoryName: this.newIncome.categoryName,
        plannedAmount: this.newIncome.plannedAmount,
        type: 'INCOME',
        fixed: false
      });
      this.newIncome = { categoryName: '', plannedAmount: 0 };
      this.calculateTotals();
    }
  }

  addFixedExpense() {
    const category = this.newFixedExpense.categoryName === 'custom' ? this.customFixedCategory : this.newFixedExpense.categoryName;

    if (category && this.newFixedExpense.plannedAmount > 0) {
      this.fixedExpenseItems.push({
        categoryName: category,
        plannedAmount: this.newFixedExpense.plannedAmount,
        type: 'EXPENSE',
        fixed: true
      });
      this.newFixedExpense = { categoryName: '', plannedAmount: 0 };
      this.customFixedCategory = '';
      this.calculateTotals();
    }
  }

  addVariableExpense() {
    const category = this.newVariableExpense.categoryName === 'custom' ? this.customVariableCategory : this.newVariableExpense.categoryName;

    if (category && this.newVariableExpense.plannedAmount > 0) {
      this.variableExpenseItems.push({
        categoryName: category,
        plannedAmount: this.newVariableExpense.plannedAmount,
        type: 'EXPENSE',
        fixed: false
      });
      this.newVariableExpense = { categoryName: '', plannedAmount: 0 };
      this.customVariableCategory = '';
      this.calculateTotals();
    }
  }

  removeItem(list: PlanItem[], index: number) {
    list.splice(index, 1);
    this.calculateTotals();
  }

  calculateTotals() {
    this.totalIncome = this.incomeItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    this.totalFixedExpense = this.fixedExpenseItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    this.totalVariableExpense = this.variableExpenseItems.reduce((sum, item) => sum + item.plannedAmount, 0);
    this.availableForGoals = this.totalIncome - this.totalFixedExpense - this.totalVariableExpense;
  }

  savePlan() {
    const allItems = [...this.incomeItems, ...this.fixedExpenseItems, ...this.variableExpenseItems];

    this.budgetService.savePlan(this.currentMonth, this.currentYear, allItems).subscribe({
      next: (response) => {
        alert('Budget plan saved successfully!');
        this.loadPlan();
      },
      error: (err) => {
        console.error('Error saving plan:', err);
        alert('Failed to save budget plan');
      }
    });
  }

  getMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[this.currentMonth - 1];
  }
}
