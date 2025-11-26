import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanningService, MonthlyPlan, PlanItem } from '../../services/planning.service';

@Component({
    selector: 'app-planning-wizard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './planning-wizard.component.html',
    styleUrls: ['./planning-wizard.component.css']
})
export class PlanningWizardComponent implements OnInit {
    currentStep = 1;
    totalSteps = 5;

    // Plan Data
    income: number = 0;
    debtItems: PlanItem[] = [];
    essentialItems: PlanItem[] = [];
    discretionaryItems: PlanItem[] = [];

    // Predefined Categories
    predefinedCategories: any;

    // Custom Category Inputs
    customDebtName: string = '';
    customDebtAmount: number | null = null;
    customEssentialName: string = '';
    customEssentialAmount: number | null = null;
    customDiscretionaryName: string = '';
    customDiscretionaryAmount: number | null = null;

    constructor(
        private planningService: PlanningService,
        private router: Router
    ) { }

    ngOnInit() {
        this.predefinedCategories = this.planningService.getPredefinedCategories();

        // Initialize with predefined categories (amount 0)
        this.initializeCategories();
    }

    initializeCategories() {
        // Debt
        this.predefinedCategories.DEBT.forEach((cat: any) => {
            this.debtItems.push({
                categoryName: cat.name,
                plannedAmount: 0,
                type: 'EXPENSE',
                fixed: true,
                categoryGroup: 'DEBT'
            });
        });

        // Essential
        this.predefinedCategories.ESSENTIAL.forEach((cat: any) => {
            this.essentialItems.push({
                categoryName: cat.name,
                plannedAmount: 0,
                type: 'EXPENSE',
                fixed: true,
                categoryGroup: 'ESSENTIAL'
            });
        });

        // Discretionary
        this.predefinedCategories.DISCRETIONARY.forEach((cat: any) => {
            this.discretionaryItems.push({
                categoryName: cat.name,
                plannedAmount: 0,
                type: 'EXPENSE',
                fixed: false,
                categoryGroup: 'DISCRETIONARY'
            });
        });
    }

    // Navigation
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    // Add Custom Categories
    addCustomDebt() {
        if (this.customDebtName && this.customDebtAmount) {
            this.debtItems.push({
                categoryName: this.customDebtName,
                plannedAmount: this.customDebtAmount,
                type: 'EXPENSE',
                fixed: true,
                categoryGroup: 'DEBT'
            });
            this.customDebtName = '';
            this.customDebtAmount = null;
        }
    }

    addCustomEssential() {
        if (this.customEssentialName && this.customEssentialAmount) {
            this.essentialItems.push({
                categoryName: this.customEssentialName,
                plannedAmount: this.customEssentialAmount,
                type: 'EXPENSE',
                fixed: true,
                categoryGroup: 'ESSENTIAL'
            });
            this.customEssentialName = '';
            this.customEssentialAmount = null;
        }
    }

    addCustomDiscretionary() {
        if (this.customDiscretionaryName && this.customDiscretionaryAmount) {
            this.discretionaryItems.push({
                categoryName: this.customDiscretionaryName,
                plannedAmount: this.customDiscretionaryAmount,
                type: 'EXPENSE',
                fixed: false,
                categoryGroup: 'DISCRETIONARY'
            });
            this.customDiscretionaryName = '';
            this.customDiscretionaryAmount = null;
        }
    }

    // Calculations
    get totalDebt(): number {
        return this.debtItems.reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
    }

    get totalEssential(): number {
        return this.essentialItems.reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
    }

    get totalFixed(): number {
        return this.totalDebt + this.totalEssential;
    }

    get totalDiscretionary(): number {
        return this.discretionaryItems.reduce((sum, item) => sum + (item.plannedAmount || 0), 0);
    }

    get availableForDiscretionary(): number {
        return this.income - this.totalFixed;
    }

    get remainingBudget(): number {
        return this.availableForDiscretionary - this.totalDiscretionary;
    }

    get dailyBudget(): number {
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        return this.availableForDiscretionary > 0 ? this.availableForDiscretionary / daysInMonth : 0;
    }

    // Save Plan
    savePlan() {
        const now = new Date();
        // Create Income Item
        const incomeItem: PlanItem = {
            categoryName: 'Monthly Income',
            plannedAmount: this.income,
            type: 'INCOME',
            fixed: false,
            categoryGroup: undefined // Income doesn't need a group
        };

        const allItems = [
            incomeItem,
            ...this.debtItems.filter(i => i.plannedAmount > 0),
            ...this.essentialItems.filter(i => i.plannedAmount > 0),
            ...this.discretionaryItems.filter(i => i.plannedAmount > 0)
        ];

        const plan: MonthlyPlan = {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            totalIncome: this.income,
            items: allItems
        };

        this.planningService.savePlan(plan).subscribe({
            next: () => {
                alert('Plan saved successfully! 🚀');
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                console.error('Error saving plan:', err);
                alert('Failed to save plan. Please try again.');
            }
        });
    }
}
