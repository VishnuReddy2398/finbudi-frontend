import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Transaction } from '../../services/finance';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent {
  transactions: Transaction[] = [];
  reportType: 'WEEKLY' | 'MONTHLY' | null = null;
  totalIncome = 0;
  totalExpense = 0;

  // For Export
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();

  constructor(
    private financeService: FinanceService,
    private exportService: ExportService
  ) { }

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

  downloadPdf() {
    this.exportService.downloadPdf(this.selectedMonth, this.selectedYear).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${this.selectedMonth}_${this.selectedYear}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadExcel() {
    this.exportService.downloadExcel(this.selectedMonth, this.selectedYear).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${this.selectedMonth}_${this.selectedYear}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
