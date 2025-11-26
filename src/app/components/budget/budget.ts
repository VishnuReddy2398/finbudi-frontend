import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsightsService, FinancialInsightsDTO } from '../../services/insights.service';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './budget.html',
  styleUrls: ['./budget.css']
})
export class BudgetComponent implements OnInit {
  insights: FinancialInsightsDTO | null = null;
  loading = true;
  showFixedDetails = false;

  constructor(
    private insightsService: InsightsService,
    private budgetService: BudgetService
  ) { }

  ngOnInit() {
    this.loadBudgetData();
  }

  loadBudgetData() {
    const now = new Date();
    this.insightsService.getInsights(now.getMonth() + 1, now.getFullYear()).subscribe({
      next: (data) => {
        this.insights = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading budget data:', err);
        this.loading = false;
      }
    });
  }

  toggleFixedDetails() {
    this.showFixedDetails = !this.showFixedDetails;
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }
}
