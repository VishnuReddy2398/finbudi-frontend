import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
    selectedMonth: number;
    selectedYear: number;
    variances: any[] = [];

    totalPlanned = 0;
    totalActual = 0;
    totalVariance = 0;

    constructor(private budgetService: BudgetService) {
        const now = new Date();
        this.selectedMonth = now.getMonth() + 1;
        this.selectedYear = now.getFullYear();
    }

    ngOnInit() {
        this.loadReport();
    }

    loadReport() {
        this.budgetService.getBudgets(this.selectedMonth, this.selectedYear).subscribe({
            next: (data) => {
                this.variances = data.map(b => ({
                    category: b.categoryName,
                    planned: b.limit,
                    actual: b.spent,
                    variance: b.remaining,
                    status: b.status === 'SAFE' ? 'UNDER_BUDGET' : (b.status === 'EXCEEDED' ? 'OVER_BUDGET' : 'ON_TRACK')
                }));
                this.calculateTotals();
            },
            error: (err) => console.error('Error loading variance report:', err)
        });
    }

    calculateTotals() {
        this.totalPlanned = this.variances.reduce((sum, v) => sum + (v.planned || 0), 0);
        this.totalActual = this.variances.reduce((sum, v) => sum + (v.actual || 0), 0);
        this.totalVariance = this.totalPlanned - this.totalActual;
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'OVER_BUDGET': return 'bg-red-100 text-red-800';
            case 'ON_TRACK': return 'bg-yellow-100 text-yellow-800';
            case 'UNDER_BUDGET': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'OVER_BUDGET': return 'Over';
            case 'ON_TRACK': return 'On Track';
            case 'UNDER_BUDGET': return 'Under';
            default: return status;
        }
    }

    getMonthName(): string {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        return months[this.selectedMonth - 1];
    }
}
