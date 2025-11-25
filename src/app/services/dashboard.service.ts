import { Injectable } from '@angular/core';
import { Transaction } from './finance';

export interface BudgetVariance {
    categoryName: string;
    categoryType: string;
    planned: number;
    actual: number;
    variance: number;
    status: 'UNDER_BUDGET' | 'OVER_BUDGET' | 'ON_TRACK';
    fixed?: boolean;
}

export interface ChartData {
    label: string;
    value: number;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor() { }

    calculateTotals(transactions: Transaction[], budgetVariances: BudgetVariance[], totalPlannedIncome: number, totalPlannedExpense: number) {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        // Actual income for the month
        const actualIncome = monthlyTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + t.amount, 0);

        // Get list of planned category names (case-insensitive)
        const plannedCategories = budgetVariances
            .filter(v => v.planned > 0)
            .map(v => v.categoryName.toLowerCase());

        // Fixed Expenses = Only expenses for PLANNED categories
        const plannedExpenses = monthlyTransactions
            .filter(t => t.type === 'EXPENSE' &&
                t.category &&
                plannedCategories.includes(t.category.name.toLowerCase()))
            .reduce((sum, t) => sum + t.amount, 0);

        // All expenses (for current balance calculation)
        const allExpenses = monthlyTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + t.amount, 0);

        // Unplanned Expenses = All Expenses - Planned Category Expenses
        const unplannedExpenses = allExpenses - plannedExpenses;

        // Current Balance = (Planned Income + Actual Income) - Planned Expenses - Unplanned Expenses
        const plannedBalance = Number(totalPlannedIncome) - Number(totalPlannedExpense);
        const balance = plannedBalance + actualIncome - unplannedExpenses;

        return {
            totalIncome: Math.round((Number(totalPlannedIncome) + actualIncome) * 100) / 100,
            totalExpense: Math.round(plannedExpenses * 100) / 100,
            balance: Math.round(balance * 100) / 100
        };
    }

    prepareChartData(variances: BudgetVariance[]): { expenseChartData: ChartData[], unplannedChartData: ChartData[] } {
        // Filter out income categories and unplanned expenses (planned == 0)
        const expenses = variances.filter(v =>
            v.categoryType === 'EXPENSE' &&
            v.actual > 0 &&
            v.planned > 0
        );

        // Sort by actual amount descending
        expenses.sort((a, b) => b.actual - a.actual);

        // Take top 5 and group others
        const topExpenses = expenses.slice(0, 5);
        const otherExpenses = expenses.slice(5);

        const plannedColors = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#6366F1', '#64748B'];

        const expenseChartData = topExpenses.map((v, index) => ({
            label: v.categoryName,
            value: v.actual,
            color: plannedColors[index % plannedColors.length]
        }));

        if (otherExpenses.length > 0) {
            const otherTotal = otherExpenses.reduce((sum, v) => sum + v.actual, 0);
            expenseChartData.push({
                label: 'Others',
                value: otherTotal,
                color: plannedColors[5]
            });
        }

        // Prepare Unplanned Expenses Data (planned == 0)
        const unplanned = variances.filter(v =>
            v.planned === 0 &&
            v.actual > 0 &&
            v.categoryType === 'EXPENSE'
        );
        unplanned.sort((a, b) => b.actual - a.actual);

        const unplannedColors = ['#EF4444', '#F59E0B', '#F97316', '#DC2626', '#D97706', '#B91C1C'];

        const unplannedChartData = unplanned.map((v, index) => ({
            label: v.categoryName,
            value: v.actual,
            color: unplannedColors[index % unplannedColors.length]
        }));

        return { expenseChartData, unplannedChartData };
    }

    calculateBudgetHealth(variances: BudgetVariance[]): number {
        if (variances.length === 0) {
            return 100;
        }

        const overBudgetCount = variances.filter(v => v.status === 'OVER_BUDGET').length;
        const totalCategories = variances.length;
        return Math.round(((totalCategories - overBudgetCount) / totalCategories) * 100);
    }
}
