import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import { InsightsService, FinancialInsightsDTO } from '../../services/insights.service';
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

  // Charts
  lineChartData: ChartConfiguration['data'] = { datasets: [], labels: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        min: 0
      }
    }
  };
  lineChartType: ChartType = 'line';

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };
  doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  constructor(
    private analyticsService: AnalyticsService,
    private insightsService: InsightsService
  ) { }

  ngOnInit() {
    this.loadInsights();
    this.loadSpendingTrend();
  }

  loadInsights() {
    const now = new Date();
    this.insightsService.getInsights(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (data) => {
        this.insights = data;
        this.loading = false;
        this.updateDoughnutChart();
      },
      error: (err) => {
        console.error('Error loading insights:', err);
        this.loading = false;
      }
    });
  }

  updateDoughnutChart() {
    if (!this.insights) return;

    // Grouped Breakdown for Chart
    const fixed = this.insights.fixedObligations;
    const discretionary = this.insights.discretionarySpent;
    const savings = this.insights.monthlyIncome - fixed - discretionary;

    this.doughnutChartData = {
      labels: ['Fixed Obligations', 'Discretionary Spending', 'Available/Savings'],
      datasets: [{
        data: [fixed, discretionary, savings > 0 ? savings : 0],
        backgroundColor: ['#e11d48', '#10b981', '#3b82f6'],
        hoverBackgroundColor: ['#be123c', '#059669', '#2563eb'],
        borderWidth: 0
      }]
    };
  }

  loadSpendingTrend() {
    this.analyticsService.getDailySpendingTrend().subscribe({
      next: (data) => {
        this.lineChartData = {
          labels: data.labels,
          datasets: [{
            data: data.data,
            label: 'Daily Spending',
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
          }]
        };
      },
      error: (err) => console.error('Error loading trend:', err)
    });
  }
}
