import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { InsightsService, FinancialInsightsDTO } from '../../services/insights.service';
import { GoalService, Goal } from '../../services/goal.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  // New Insights Data
  insights: FinancialInsightsDTO | null = null;
  loading = true;
  goals: Goal[] = [];

  // Metrics
  avgMonthlySavings: number = 0;
  avgDailySpending: number = 0;
  savingsRate: number = 0;
  budgetAdherence: number = 0;

  // Charts
  lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } }
    },
    elements: { line: { tension: 0.4 } }
  };
  lineChartType: ChartType = 'line';

  barChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    }
  };
  barChartType: ChartType = 'bar';

  constructor(
    private analyticsService: AnalyticsService,
    private insightsService: InsightsService,
    private goalService: GoalService
  ) { }

  ngOnInit() {
    this.loadInsights();
    this.loadSpendingTrend();
    this.loadSixMonthTrend();
    this.loadGoals();
  }

  loadInsights() {
    const now = new Date();
    this.insightsService.getInsights(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (data) => {
        this.insights = data;
        this.calculateMetrics();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading insights:', err);
        this.loading = false;
      }
    });
  }

  loadGoals() {
    this.goalService.getGoals().subscribe({
      next: (data) => this.goals = data,
      error: (err) => console.error('Error loading goals:', err)
    });
  }

  // Savings Breakdown
  savingsInvested: number = 0;
  unspentBalance: number = 0;

  // Percentage Change Logic
  savingsPercentageChange: number = 0;
  expensePercentageChange: number = 0;
  adherencePercentageChange: number = 0;
  hasPreviousMonthData: boolean = false;

  calculateMetrics() {
    if (!this.insights) return;

    // 1. Avg Monthly Savings (Using current month's available/savings as proxy)
    const fixed = this.insights.fixedObligations;
    const discretionary = this.insights.discretionarySpent;

    // Savings Invested (SIP/Goals) comes from backend now
    this.savingsInvested = this.insights.savingsInvested || 0;

    // Unspent Balance = Income - Fixed - Discretionary - Invested
    // Note: availableNow in backend is already (Income - Fixed - Discretionary - Invested)
    this.unspentBalance = this.insights.availableNow > 0 ? this.insights.availableNow : 0;

    // STRICT SAVINGS DEFINITION: Only Invested Amount
    this.avgMonthlySavings = this.savingsInvested;

    // 2. Avg Daily Spending
    const daysPassed = new Date().getDate();
    const totalSpent = fixed + discretionary; // Or just discretionary? Usually daily spending implies discretionary.
    // Let's use discretionary for "Daily Spending" as fixed is usually rent/bills.
    this.avgDailySpending = daysPassed > 0 ? Math.round(discretionary / daysPassed) : 0;

    // 3. Savings Rate (Invested / Income)
    if (this.insights.monthlyIncome > 0) {
      this.savingsRate = (this.savingsInvested / this.insights.monthlyIncome) * 100;
    } else {
      this.savingsRate = 0;
    }

    // 4. Budget Adherence (Actual / Budget) * 100
    const totalBudget = this.insights.discretionaryBudget + this.insights.fixedObligations; // Total Planned
    const totalActual = this.insights.discretionarySpent + this.insights.fixedObligations;

    if (totalBudget > 0) {
      this.budgetAdherence = Math.round((totalActual / totalBudget) * 100);
    } else {
      this.budgetAdherence = 0;
    }
  }

  loadSpendingTrend() {
    this.analyticsService.getDailySpendingTrend().subscribe({
      next: (data) => {
        // Aggregate by Day of Week for "Average Daily Spending Pattern"
        const dayMap = new Map<number, number>(); // 0=Sun, 1=Mon...
        const dayCounts = new Map<number, number>();

        data.labels.forEach((dateStr: string, index: number) => {
          // dateStr is "dd MMM"
          const date = new Date(dateStr + ' ' + new Date().getFullYear());
          const day = date.getDay();
          const amount = data.data[index];

          dayMap.set(day, (dayMap.get(day) || 0) + amount);
          dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
        });

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const avgData = days.map((_, i) => {
          const total = dayMap.get(i) || 0;
          const count = dayCounts.get(i) || 1;
          return Math.round(total / count);
        });

        // Rotate to start from Mon
        const monSunLabels = [...days.slice(1), days[0]];
        const monSunData = [...avgData.slice(1), avgData[0]];

        this.barChartData = {
          labels: monSunLabels,
          datasets: [{
            data: monSunData,
            backgroundColor: '#8b5cf6',
            borderRadius: 4,
            barThickness: 20
          }]
        };
      },
      error: (err) => console.error('Error loading trend:', err)
    });
  }

  loadSixMonthTrend() {
    this.analyticsService.getSixMonthTrend().subscribe({
      next: (data) => {
        // Data is [{month, income, expense, debt, savings}, ...]

        const labels = data.map(d => d.month);
        const incomeData = data.map(d => d.income);
        const expenseData = data.map(d => d.expense);
        const debtData = data.map(d => d.debt || 0);
        const savingsData = data.map(d => d.savings || 0);

        // Calculate Percentage Changes
        if (data.length >= 2) {
          const current = data[data.length - 1];
          const previous = data[data.length - 2];

          // Check if previous month has ANY data
          const hasData = (previous.income > 0 || previous.expense > 0 || previous.savings > 0);

          if (hasData) {
            this.hasPreviousMonthData = true;

            // Savings Change
            const prevSavings = previous.savings || 0;
            if (prevSavings > 0) {
              this.savingsPercentageChange = (((current.savings || 0) - prevSavings) / prevSavings) * 100;
            } else {
              this.savingsPercentageChange = (current.savings || 0) > 0 ? 100 : 0;
            }

            // Expense Change (Expenses ONLY, excluding Debt)
            // This tracks daily spending / lifestyle inflation better
            const currExpense = current.expense || 0;
            const prevExpense = previous.expense || 0;

            if (prevExpense > 0) {
              this.expensePercentageChange = ((currExpense - prevExpense) / prevExpense) * 100;
            } else {
              this.expensePercentageChange = currExpense > 0 ? 100 : 0;
            }

            // Adherence Change
            // Using Expense Change as proxy for now
            this.adherencePercentageChange = this.expensePercentageChange;

          } else {
            this.hasPreviousMonthData = false;
            this.resetPercentages();
          }
        } else {
          this.hasPreviousMonthData = false;
          this.resetPercentages();
        }

        this.lineChartData = {
          labels: labels,
          datasets: [
            {
              label: 'Income',
              data: incomeData,
              borderColor: '#10b981', // Emerald
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true
            },
            {
              label: 'Expenses',
              data: expenseData,
              borderColor: '#f43f5e', // Rose
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              fill: true
            },
            {
              label: 'Debt (EMI)',
              data: debtData,
              borderColor: '#f97316', // Orange
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              fill: true
            },
            {
              label: 'Savings (SIP/Goals)',
              data: savingsData,
              borderColor: '#3b82f6', // Blue
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true
            }
          ]
        };
      },
      error: (err) => console.error('Error loading 6-month trend:', err)
    });
  }

  resetPercentages() {
    this.savingsPercentageChange = 0;
    this.expensePercentageChange = 0;
    this.adherencePercentageChange = 0;
  }
}
