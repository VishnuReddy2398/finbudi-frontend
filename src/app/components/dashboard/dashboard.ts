import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService, Transaction } from '../../services/finance';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { PieChartComponent } from '../charts/pie-chart.component';
import { StatsWidgetComponent } from '../gamification/stats-widget/stats-widget.component';
import { TelegramLinkDialogComponent } from '../telegram-link-dialog/telegram-link-dialog.component';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PieChartComponent, StatsWidgetComponent, TelegramLinkDialogComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: any[] = [];
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalPlannedIncome: number = 0;
  totalPlannedExpense: number = 0;
  balance: number = 0;

  isSidebarOpen = false;

  // Email verification
  isEmailVerified: boolean = true;
  showVerificationBanner: boolean = false;

  // Telegram integration
  showTelegramDialog: boolean = false;
  telegramLinked: boolean = false;
  telegramUsername: string | null = null;

  // Budget variance data
  budgetVariances: any[] = [];
  overBudgetItems: any[] = [];
  underBudgetItems: any[] = [];
  budgetHealthScore: number = 100;

  // Chart Data
  expenseChartData: any[] = [];
  unplannedChartData: any[] = [];

  // Quick Edit/Delete State
  editingTransaction: Transaction | null = null;
  deletingTransaction: Transaction | null = null;
  showEditModal = false;
  showDeleteModal = false;
  editForm: any = {};

  // Make Math available in template
  Math = Math;

  // Date validation
  maxDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  constructor(
    private financeService: FinanceService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private telegramService: TelegramService
  ) { }

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
    this.loadBudgetVariance();
    this.checkVerificationStatus();
    this.loadTelegramStatus();

    const now = new Date();
    this.loadBudgetPlan(now.getMonth() + 1, now.getFullYear());
  }

  checkVerificationStatus() {
    this.authService.getVerificationStatus().subscribe({
      next: (data: any) => {
        this.isEmailVerified = data.verified;
        this.showVerificationBanner = !data.verified;
      },
      error: (err) => {
        console.error('Error checking verification status:', err);
        // If error, assume verified to not block user
        this.showVerificationBanner = false;
      }
    });
  }

  loadCategories() {
    this.financeService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Load transactions and recalculate totals
  loadTransactions() {
    this.financeService.getTransactions().subscribe({
      next: (data) => {
        this.transactions = data;
        this.calculateTotals();
      },
      error: (err) => console.error('Error loading transactions:', err)
    });
  }



  // This method is missing in the original code, adding a placeholder for calculateTotals
  // based on the context of the change.
  calculateTotals() {
    // Filter transactions for the current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTransactions = this.transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });

    // Actual income and expense for the month
    const actualIncome = monthlyTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const actualExpense = monthlyTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    // Total Income = Planned Income + Actual Income
    this.totalIncome = Number(this.totalPlannedIncome) + actualIncome;
    // Total Expense reflects actual expenses for the month
    this.totalExpense = actualExpense;

    // Balance calculation: (Planned Income - Planned Expenses) - Unplanned Expenses
    if (this.totalPlannedIncome > 0 || this.totalPlannedExpense > 0) {
      const projectedSavings = this.totalPlannedIncome - this.totalPlannedExpense;
      let unplannedExpenses = 0;
      if (this.budgetVariances && this.budgetVariances.length > 0) {
        unplannedExpenses = this.budgetVariances
          .filter(v => v.categoryType === 'EXPENSE' && v.planned === 0)
          .reduce((sum, v) => sum + v.actual, 0);
      }
      this.balance = projectedSavings - unplannedExpenses;
    } else {
      this.balance = this.totalIncome - this.totalExpense;
    }

    // Round values to avoid floating point artifacts
    this.totalIncome = Math.round(this.totalIncome * 100) / 100;
    this.totalExpense = Math.round(this.totalExpense * 100) / 100;
    this.balance = Math.round(this.balance * 100) / 100;
  }

  loadBudgetVariance() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    this.budgetService.getVarianceReport(month, year).subscribe({
      next: (variances) => {
        this.budgetVariances = variances;
        this.overBudgetItems = variances
          .filter((v: any) => v.status === 'OVER_BUDGET')
          .sort((a: any, b: any) => Math.abs(b.variance) - Math.abs(a.variance))
          .slice(0, 3);
        this.underBudgetItems = variances
          .filter((v: any) => v.status === 'UNDER_BUDGET')
          .sort((a: any, b: any) => b.variance - a.variance)
          .slice(0, 3);
        this.calculateBudgetHealth();
        this.prepareChartData(variances);
        this.loadBudgetPlan(month, year);
      },
      error: (err) => console.error('Error loading budget variance:', err)
    });
  }

  prepareChartData(variances: any[]) {
    // Filter out income categories and unplanned expenses (planned == 0)
    // Now using categoryType from backend
    const expenses = variances.filter((v: any) =>
      v.categoryType === 'EXPENSE' &&
      v.actual > 0 &&
      v.planned > 0 // Only show planned categories as per requirement
    );

    // Sort by actual amount descending
    expenses.sort((a: any, b: any) => b.actual - a.actual);

    // Take top 5 and group others
    const topExpenses = expenses.slice(0, 5);
    const otherExpenses = expenses.slice(5);

    // Planned Expenses Colors (Cool/Professional: Blues, Greens, Violets)
    const plannedColors = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#6366F1', '#64748B'];

    this.expenseChartData = topExpenses.map((v: any, index: number) => ({
      label: v.categoryName,
      value: v.actual,
      color: plannedColors[index % plannedColors.length]
    }));

    if (otherExpenses.length > 0) {
      const otherTotal = otherExpenses.reduce((sum: number, v: any) => sum + v.actual, 0);
      this.expenseChartData.push({
        label: 'Others',
        value: otherTotal,
        color: plannedColors[5]
      });
    }

    // Prepare Unplanned Expenses Data (planned == 0)
    const unplanned = variances.filter((v: any) =>
      v.planned === 0 &&
      v.actual > 0 &&
      v.categoryType === 'EXPENSE' // Only include Expenses
    );
    unplanned.sort((a: any, b: any) => b.actual - a.actual);

    // Unplanned Expenses Colors (Warm/Caution: Reds, Oranges, Ambers)
    const unplannedColors = ['#EF4444', '#F59E0B', '#F97316', '#DC2626', '#D97706', '#B91C1C'];

    this.unplannedChartData = unplanned.map((v: any, index: number) => ({
      label: v.categoryName,
      value: v.actual,
      color: unplannedColors[index % unplannedColors.length]
    }));
  }

  loadBudgetPlan(month: number, year: number) {
    this.budgetService.getPlan(month, year).subscribe({
      next: (plan) => {
        this.totalPlannedIncome = plan.totalIncome || 0;
        this.totalPlannedExpense = plan.totalPlannedExpense || 0;
        this.calculateTotals(); // Recalculate totals with planned income
      },
      error: (err) => console.error('Error loading budget plan:', err)
    });
  }

  calculateBudgetHealth() {
    if (this.budgetVariances.length === 0) {
      this.budgetHealthScore = 100;
      return;
    }

    const overBudgetCount = this.budgetVariances.filter((v: any) => v.status === 'OVER_BUDGET').length;
    const totalCategories = this.budgetVariances.length;
    this.budgetHealthScore = Math.round(((totalCategories - overBudgetCount) / totalCategories) * 100);
  }



  // Quick Edit/Delete Methods
  openEditModal(transaction: Transaction) {
    this.editingTransaction = transaction;
    this.editForm = { ...transaction };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTransaction = null;
    this.editForm = {};
  }

  saveEdit() {
    if (!this.editingTransaction?.id) return;

    this.financeService.updateTransaction(this.editingTransaction.id, this.editForm).subscribe({
      next: () => {
        this.loadTransactions();
        this.loadBudgetVariance();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error updating transaction:', err);
        alert('Failed to update transaction');
      }
    });
  }

  openDeleteModal(transaction: Transaction) {
    this.deletingTransaction = transaction;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deletingTransaction = null;
  }

  confirmDelete() {
    if (!this.deletingTransaction?.id) return;

    this.financeService.deleteTransaction(this.deletingTransaction.id).subscribe({
      next: () => {
        this.loadTransactions();
        this.loadBudgetVariance();
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction');
      }
    });
  }

  // Telegram methods
  loadTelegramStatus() {
    this.telegramService.getTelegramStatus().subscribe({
      next: (status) => {
        this.telegramLinked = status.linked;
        this.telegramUsername = status.username;
      },
      error: (err) => {
        console.error('Error loading Telegram status:', err);
      }
    });
  }

  openTelegramDialog() {
    this.showTelegramDialog = true;
  }

  closeTelegramDialog() {
    this.showTelegramDialog = false;
    // Reload status in case user linked their account
    this.loadTelegramStatus();
  }

  unlinkTelegram() {
    if (confirm('Are you sure you want to unlink your Telegram account?')) {
      this.telegramService.unlinkTelegram().subscribe({
        next: () => {
          this.telegramLinked = false;
          this.telegramUsername = null;
          alert('Telegram account unlinked successfully');
        },
        error: (err) => {
          console.error('Error unlinking Telegram:', err);
          alert('Failed to unlink Telegram account');
        }
      });
    }
  }
}
