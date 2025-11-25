import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FinanceService, Transaction } from '../../services/finance';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService, BudgetVariance, ChartData } from '../../services/dashboard.service';
import { PieChartComponent } from '../charts/pie-chart.component';
import { StatsWidgetComponent } from '../gamification/stats-widget/stats-widget.component';
import { ChallengesWidgetComponent } from '../gamification/challenges-widget/challenges-widget.component';
import { TelegramLinkDialogComponent } from '../telegram-link-dialog/telegram-link-dialog.component';
import { TelegramService } from '../../services/telegram.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PieChartComponent, StatsWidgetComponent, ChallengesWidgetComponent, TelegramLinkDialogComponent],
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
  budgetVariances: BudgetVariance[] = [];
  visibleBudgetVariances: BudgetVariance[] = []; // For UI display (Variable expenses only)
  overBudgetItems: BudgetVariance[] = [];
  underBudgetItems: BudgetVariance[] = [];
  budgetHealthScore: number = 100;

  // Prediction Data
  prediction: any = null;

  // Chart Data
  expenseChartData: ChartData[] = [];
  unplannedChartData: ChartData[] = [];

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
    private telegramService: TelegramService,
    private dashboardService: DashboardService,
    private analyticsService: AnalyticsService
  ) { }

  @ViewChild(ChallengesWidgetComponent) challengesWidget!: ChallengesWidgetComponent;

  openChallengesModal() {
    if (this.challengesWidget) {
      this.challengesWidget.showModal = true;
    }
  }

  ngOnInit() {
    this.loadTransactions();
    this.loadCategories();
    this.loadBudgetVariance();
    this.checkVerificationStatus();
    this.loadTelegramStatus();
    this.loadPrediction();

    const now = new Date();
    this.loadBudgetPlan(now.getMonth() + 1, now.getFullYear());
  }

  loadPrediction() {
    this.analyticsService.getPrediction().subscribe({
      next: (data) => this.prediction = data,
      error: (err) => console.error('Error loading prediction:', err)
    });
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

  calculateTotals() {
    const totals = this.dashboardService.calculateTotals(
      this.transactions,
      this.budgetVariances,
      this.totalPlannedIncome,
      this.totalPlannedExpense
    );
    this.totalIncome = totals.totalIncome;
    this.totalExpense = totals.totalExpense;
    this.balance = totals.balance;
  }

  loadBudgetVariance() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    this.budgetService.getBudgets(month, year).subscribe({
      next: (data) => {
        // Map BudgetDTO to variance structure expected by dashboard
        const variances: BudgetVariance[] = data.map((b: any) => ({
          categoryName: b.categoryName,
          categoryType: 'EXPENSE', // Budgets are usually for expenses
          planned: b.limit,
          actual: b.spent,
          variance: b.remaining,
          status: b.status === 'SAFE' ? 'UNDER_BUDGET' : (b.status === 'EXCEEDED' ? 'OVER_BUDGET' : 'ON_TRACK'),
          fixed: b.fixed
        }));

        this.budgetVariances = variances;

        // Filter for "Variable" expenses (exclude fixed ones based on plan)
        this.visibleBudgetVariances = variances.filter(v => !v.fixed);

        this.overBudgetItems = variances
          .filter(v => v.status === 'OVER_BUDGET')
          .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
          .slice(0, 3);
        this.underBudgetItems = variances
          .filter(v => v.status === 'UNDER_BUDGET')
          .sort((a, b) => b.variance - a.variance)
          .slice(0, 3);

        this.budgetHealthScore = this.dashboardService.calculateBudgetHealth(variances);

        const chartData = this.dashboardService.prepareChartData(variances);
        this.expenseChartData = chartData.expenseChartData;
        this.unplannedChartData = chartData.unplannedChartData;

        this.loadBudgetPlan(month, year);
        // Recalculate totals now that budgetVariances is populated
        this.calculateTotals();
      },
      error: (err) => console.error('Error loading budget variance:', err)
    });
  }

  loadBudgetPlan(month: number, year: number) {
    console.log('=== Loading Budget Plan ===');
    console.log('Month:', month, 'Year:', year);
    this.budgetService.getPlan(month, year).subscribe({
      next: (plan) => {
        console.log('Plan received:', plan);
        this.totalPlannedIncome = plan.totalIncome || 0;
        this.totalPlannedExpense = plan.totalPlannedExpense || 0;
        this.calculateTotals(); // Recalculate totals with planned income
      },
      error: (err) => console.error('Error loading budget plan:', err)
    });
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
