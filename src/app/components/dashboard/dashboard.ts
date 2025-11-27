import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router'; // Added Router
import { FinanceService, Transaction } from '../../services/finance';
import { BudgetService } from '../../services/budget.service';
import { AuthService } from '../../services/auth.service';
import { DashboardService, BudgetVariance, PieChartData } from '../../services/dashboard.service';
import { PieChartComponent } from '../charts/pie-chart.component';
import { StatsWidgetComponent } from '../gamification/stats-widget/stats-widget.component';
import { ChallengesWidgetComponent } from '../gamification/challenges-widget/challenges-widget.component';
import { TelegramLinkDialogComponent } from '../telegram-link-dialog/telegram-link-dialog.component';
import { TelegramService } from '../../services/telegram.service';
import { AnalyticsService } from '../../services/analytics.service';
import { PlanningService, MonthlyPlan } from '../../services/planning.service'; // Added PlanningService and MonthlyPlan
import { CarryForwardDialogComponent } from '../carry-forward-dialog/carry-forward-dialog.component'; // Added CarryForwardDialogComponent
import { GamificationService } from '../../services/gamification.service'; // Added GamificationService
import { GoalService } from '../../services/goal.service'; // Added GoalService

// Define local interface for Chart.js data
interface BarChartData {
  labels: string[];
  datasets: any[];
}

import { BaseChartDirective } from 'ng2-charts'; // Import BaseChartDirective

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PieChartComponent, ChallengesWidgetComponent, TelegramLinkDialogComponent, CarryForwardDialogComponent, BaseChartDirective], // Add BaseChartDirective
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];

  get recentTransactions(): Transaction[] {
    return this.transactions.slice(0, 5);
  }

  categories: any[] = [];
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalPlannedIncome: number = 0;
  totalPlannedExpense: number = 0;
  totalUnplannedExpense: number = 0;
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
  expenseChartData: PieChartData[] = [];
  unplannedChartData: PieChartData[] = [];
  balanceChartData: PieChartData[] = [];

  // Quick Edit/Delete State
  editingTransaction: Transaction | null = null;
  deletingTransaction: Transaction | null = null;
  showEditModal = false;
  showDeleteModal = false;
  editForm: any = {};
  isSavingEdit = false; // Prevent double-clicks on edit save
  isDeletingTransaction = false; // Prevent double-clicks on delete
  isLoadingDashboard = false; // Show loading on initial load

  // Make Math available in template
  Math = Math;

  // Date validation
  maxDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Carry Forward Logic
  showCarryForwardDialog = false;
  previousPlan: MonthlyPlan | null = null;

  // Gamification
  streak: number = 0;
  points: number = 0;

  constructor(
    private financeService: FinanceService,
    private budgetService: BudgetService,
    private authService: AuthService,
    private telegramService: TelegramService,
    private dashboardService: DashboardService,
    private analyticsService: AnalyticsService,
    private planningService: PlanningService,
    private gamificationService: GamificationService, // Injected
    private goalService: GoalService, // Injected
    private router: Router
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
    this.checkPlanningStatus();

    const now = new Date();
    this.loadBudgetPlan(now.getMonth() + 1, now.getFullYear());
    this.loadGamificationStats();
    this.loadGoals();
  }

  checkPlanningStatus() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check current month plan
    this.planningService.getPlan(currentMonth, currentYear).subscribe({
      next: (plan) => {
        // Backend returns an empty plan object if none exists.
        // Check if it has an ID or items to confirm it's a real plan.
        if (plan && plan.id && plan.totalIncome > 0) {
          // Plan exists, stay on dashboard
        } else {
          // No real plan for current month, check previous month
          this.checkPreviousMonth(currentMonth, currentYear);
        }
      },
      error: () => {
        // Error case (fallback), check previous month
        this.checkPreviousMonth(currentMonth, currentYear);
      }
    });
  }

  checkPreviousMonth(currentMonth: number, currentYear: number) {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    this.planningService.getPlan(prevMonth, prevYear).subscribe({
      next: (prevPlan) => {
        if (prevPlan && prevPlan.id && prevPlan.totalIncome > 0) {
          // Previous plan exists, show carry forward dialog
          this.previousPlan = prevPlan;
          this.showCarryForwardDialog = true;
        } else {
          // No previous plan either -> NEW USER -> Redirect to Wizard
          this.router.navigate(['/planning-wizard']);
        }
      },
      error: () => {
        // No previous plan either -> NEW USER -> Redirect to Wizard
        this.router.navigate(['/planning-wizard']);
      }
    });
  }

  handleCarryForward() {
    if (this.previousPlan) {
      const now = new Date();
      const newPlan: any = {
        ...this.previousPlan,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        carryForward: true
      };

      this.planningService.savePlan(newPlan).subscribe({
        next: () => {
          this.showCarryForwardDialog = false;
          this.loadBudgetVariance(); // Reload budget data
          alert('Plan carried forward successfully! 🚀');
        },
        error: (err) => console.error('Error carrying forward plan:', err)
      });
    }
  }

  handleModifyPlan() {
    this.router.navigate(['/planning-wizard']);
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

  loadGamificationStats() {
    this.gamificationService.getStats().subscribe({
      next: (stats) => {
        this.streak = stats.currentStreak;
        this.points = stats.totalPoints;
      },
      error: (err) => console.error('Error loading stats:', err)
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

  // Savings Rate
  savingsRate: number = 0;
  savingsRateTrend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';

  // New Chart Data
  budgetVsActualChartData: BarChartData = { labels: [], datasets: [] };
  sixMonthTrendChartData: BarChartData = { labels: [], datasets: [] };

  // ... existing code ...

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

    // Update Balance Chart Data (Expenses vs Balance)
    this.balanceChartData = [
      { label: 'Expenses', value: this.totalExpense, color: '#F87171' }, // Red
      { label: 'Balance', value: this.balance > 0 ? this.balance : 0, color: '#60A5FA' }  // Blue
    ];

    // Calculate Savings Rate
    // Calculate Savings Rate - Delegated to calculateSavings()
    this.calculateSavings();

    if (this.previousPlan && this.previousPlan.totalIncome > 0) {
      const prevExpense = this.previousPlan.items
        .filter(i => i.type === 'EXPENSE')
        .reduce((sum, i) => sum + i.plannedAmount, 0);

      const prevSavingsRate = Math.round(((this.previousPlan.totalIncome - prevExpense) / this.previousPlan.totalIncome) * 100);

      if (this.savingsRate > prevSavingsRate) this.savingsRateTrend = 'UP';
      else if (this.savingsRate < prevSavingsRate) this.savingsRateTrend = 'DOWN';
      else this.savingsRateTrend = 'STABLE';
    }

    // Load 6-Month Trend Data
    this.loadSixMonthTrend();
  }

  // New Savings Calculation Logic
  totalMonthlySavings: number = 0;
  goals: any[] = [];

  loadGoals() {
    this.goalService.getGoals().subscribe({
      next: (goals) => {
        this.goals = goals;
        this.calculateSavings();
      },
      error: (err) => console.error('Error loading goals:', err)
    });
  }

  calculateSavings() {
    // 1. Goal Contributions
    const goalContributions = this.goals
      .filter(g => g.status === 'ACTIVE')
      .reduce((sum, g) => sum + (g.monthlyContribution || 0), 0);

    // 2. Planned Savings from Budget (Categories like "Savings", "SIP", "Invest")
    // We need to access the current plan items. 
    // Since we don't store the full plan object in a property accessible here easily (only totals),
    // we might need to rely on budgetVariances which has category names.
    // However, budgetVariances are based on Budgets, which should match Plan Items.

    const savingsKeywords = ['saving', 'sip', 'invest', 'mutual fund', 'ppf', 'fd', 'deposit'];

    const plannedSavings = this.budgetVariances
      .filter(v => {
        const name = v.categoryName.toLowerCase();
        return savingsKeywords.some(keyword => name.includes(keyword));
      })
      .reduce((sum, v) => sum + v.planned, 0);

    this.totalMonthlySavings = goalContributions + plannedSavings;

    // Recalculate Savings Rate based on this new Total Savings
    if (this.totalIncome > 0) {
      this.savingsRate = Math.round((this.totalMonthlySavings / this.totalIncome) * 100);
    }
  }

  loadSixMonthTrend() {
    this.analyticsService.getSixMonthTrend().subscribe({
      next: (data) => {
        const labels = data.map(d => d.month);
        const expenseData = data.map(d => d.expense);

        this.sixMonthTrendChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Spending Trend',
              data: expenseData,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        };
      },
      error: (err) => console.error('Error loading trend data:', err)
    });
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

        // Calculate Total Unplanned Expense
        this.totalUnplannedExpense = this.unplannedChartData.reduce((sum, item) => sum + item.value, 0);

        // Prepare Budget vs Actual Chart Data (Variable Expenses Only)
        this.prepareBudgetVsActualChart();

        this.loadBudgetPlan(month, year);
        // Recalculate totals now that budgetVariances is populated
        this.calculateTotals();
        this.calculateSavings(); // Recalculate savings with new budget data
      },
      error: (err) => console.error('Error loading budget variance:', err)
    });
  }

  prepareBudgetVsActualChart() {
    // Aggregate by category name to handle potential duplicates (e.g. same name different IDs)
    const aggregated = new Map<string, { planned: number, actual: number }>();

    this.visibleBudgetVariances.forEach(v => {
      const current = aggregated.get(v.categoryName) || { planned: 0, actual: 0 };
      aggregated.set(v.categoryName, {
        planned: current.planned + v.planned,
        actual: current.actual + v.actual
      });
    });

    const labels = Array.from(aggregated.keys());
    const plannedData = Array.from(aggregated.values()).map(d => d.planned);
    const actualData = Array.from(aggregated.values()).map(d => d.actual);

    this.budgetVsActualChartData = {
      labels: labels,
      datasets: [
        {
          label: 'Planned',
          data: plannedData,
          backgroundColor: '#94a3b8', // Slate 400
          borderRadius: 4
        },
        {
          label: 'Actual',
          data: actualData,
          backgroundColor: '#3b82f6', // Blue 500
          borderRadius: 4
        }
      ]
    };
  }

  loadBudgetPlan(month: number, year: number) {
    console.log('=== Loading Budget Plan ===');
    console.log('Month:', month, 'Year:', year);
    this.budgetService.getPlan(month, year).subscribe({
      next: (plan) => {
        console.log('Plan received:', plan);
        this.totalPlannedIncome = plan.totalIncome || 0;
        this.totalPlannedExpense = plan.totalExpense || 0;
        this.calculateTotals(); // Recalculate totals with planned income
      },
      error: (err) => console.error('Error loading budget plan:', err)
    });
  }

  // Quick Edit/Delete Methods
  openEditModal(transaction: Transaction) {
    this.editingTransaction = transaction;
    this.editForm = { ...transaction };
    // Pre-fill category name for the input field
    this.editForm.categoryName = transaction.categoryName || '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingTransaction = null;
    this.editForm = {};
  }

  saveEdit() {
    if (!this.editingTransaction?.id || this.isSavingEdit) return; // Prevent double-clicks

    this.isSavingEdit = true;

    // Resolve Category Name to Object
    const name = this.editForm.categoryName;
    if (name) {
      const existingCategory = this.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (existingCategory) {
        this.editForm.category = existingCategory;
        this.editForm.categoryId = existingCategory.id;
      } else {
        // New Category - Backend should handle creation or mapping
        this.editForm.category = { name: name };
        this.editForm.categoryId = undefined;
      }
    }

    this.financeService.updateTransaction(this.editingTransaction.id, this.editForm).subscribe({
      next: () => {
        this.loadTransactions();
        this.loadBudgetVariance();
        this.closeEditModal();
        this.isSavingEdit = false;
      },
      error: (err) => {
        console.error('Error updating transaction:', err);
        alert('Failed to update transaction');
        this.isSavingEdit = false;
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
    if (!this.deletingTransaction?.id || this.isDeletingTransaction) return; // Prevent double-clicks

    this.isDeletingTransaction = true;

    this.financeService.deleteTransaction(this.deletingTransaction.id).subscribe({
      next: () => {
        this.loadTransactions();
        this.loadBudgetVariance();
        this.closeDeleteModal();
        this.isDeletingTransaction = false;
      },
      error: (err) => {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction');
        this.isDeletingTransaction = false;
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
  // Helper methods for Transaction List Display
  getDisplayType(transaction: Transaction): string {
    if (transaction.type === 'INCOME') return 'INCOME';

    const name = (transaction.categoryName || '').toLowerCase();

    // Check for Debt (EMI, Loan)
    if (name.includes('emi') || name.includes('loan')) {
      return 'DEBT';
    }

    // Check for Savings (SIP, Invest, etc.)
    const savingsKeywords = ['saving', 'sip', 'invest', 'mutual fund', 'ppf', 'fd', 'deposit', 'goal'];
    if (savingsKeywords.some(k => name.includes(k))) {
      return 'SAVINGS';
    }

    return 'EXPENSE';
  }

  getTypeClass(transaction: Transaction): string {
    const type = this.getDisplayType(transaction);
    switch (type) {
      case 'INCOME': return 'bg-emerald-100 text-emerald-700';
      case 'DEBT': return 'bg-orange-100 text-orange-700';
      case 'SAVINGS': return 'bg-blue-100 text-blue-700';
      default: return 'bg-rose-100 text-rose-700'; // EXPENSE
    }
  }
}
