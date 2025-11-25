import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent implements OnInit {
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();

  // Daily Spend Chart (Line)
  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        data: [],
        label: 'Daily Spend',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        fill: 'origin',
      }
    ],
    labels: []
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  public lineChartType: ChartType = 'line';

  // Category Split Chart (Doughnut)
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'
        ]
      }
    ]
  };

  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  // Top Categories List
  topCategories: any[] = [];

  constructor(private analyticsService: AnalyticsService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // Load Daily Spend
    this.analyticsService.getDailySpend(this.currentMonth, this.currentYear).subscribe(data => {
      this.lineChartData.labels = data.map(d => d.date);
      this.lineChartData.datasets[0].data = data.map(d => d.amount);

      // Force chart update if needed, but binding should handle it
      this.lineChartData = { ...this.lineChartData };
    });

    // Load Category Split
    this.analyticsService.getCategorySplit(this.currentMonth, this.currentYear).subscribe(data => {
      this.doughnutChartData.labels = data.map(d => d.categoryName);
      this.doughnutChartData.datasets[0].data = data.map(d => d.amount);
      this.doughnutChartData = { ...this.doughnutChartData };

      this.topCategories = data.slice(0, 5); // Top 5
    });
  }
}
