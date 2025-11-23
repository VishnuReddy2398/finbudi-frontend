import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService, Transaction } from '../../services/finance';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  transactions: Transaction[] = [];
  reportType: 'WEEKLY' | 'MONTHLY' | null = null;
  totalIncome = 0;
  totalExpense = 0;

  constructor(private financeService: FinanceService) { }

  generateWeeklyReport() {
    this.reportType = 'WEEKLY';
    this.financeService.getWeeklyReport().subscribe(data => {
      this.transactions = data;
      this.calculateTotals();
    });
  }

  generateMonthlyReport() {
    this.reportType = 'MONTHLY';
    this.financeService.getMonthlyReport().subscribe(data => {
      this.transactions = data;
      this.calculateTotals();
    });
  }

  calculateTotals() {
    this.totalIncome = this.transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    this.totalExpense = this.transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
