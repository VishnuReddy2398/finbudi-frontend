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

export interface PieChartData {
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

    prepareChartData(variances: BudgetVariance[]): { expenseChartData: PieChartData[], unplannedChartData: PieChartData[] } {
        // Helper function to normalize category name to Title Case
        const toTitleCase = (str: string): string => {
            return str.toLowerCase().split(' ').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        // 1. Merge duplicates by categoryName (case-insensitive)
        const mergedMap = new Map<string, BudgetVariance>();

        variances.forEach(v => {
            // Normalize category name to Title Case for consistent grouping
            const normalizedName = toTitleCase(v.categoryName);
            const existing = mergedMap.get(normalizedName);

            if (existing) {
                existing.planned += v.planned;
                existing.actual += v.actual;
                existing.variance = existing.planned - existing.actual; // Recalculate variance
            } else {
                // Clone and use normalized name
                mergedMap.set(normalizedName, { ...v, categoryName: normalizedName });
            }
        });

        const mergedVariances = Array.from(mergedMap.values());

        const plannedColors = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#6366F1', '#64748B'];
        const unplannedColors = ['#EF4444', '#F59E0B', '#F97316', '#DC2626', '#D97706', '#B91C1C'];

        // Chart 1: Planned Category Expenses (actual spending per category)
        // User requested: filter(v => v.categoryType === 'EXPENSE' && v.actual > 0)
        const expenseChartData = mergedVariances
            .filter(v => v.categoryType === 'EXPENSE' && v.actual > 0)
            .map((v, index) => ({
                label: v.categoryName, // Now normalized to Title Case
                value: v.actual,
                color: plannedColors[index % plannedColors.length]
            }));

        // Chart 2: Unplanned Expenses (spending beyond budget per category)
        // User requested: filter(v => v.categoryType === 'EXPENSE' && v.variance < 0)
        const unplannedChartData = mergedVariances
            .filter(v => v.categoryType === 'EXPENSE' && v.variance < 0)
            .map((v, index) => ({
                label: v.categoryName, // Now normalized to Title Case
                value: Math.abs(v.variance), // Show overspending amount
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
