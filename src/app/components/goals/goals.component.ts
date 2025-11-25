import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { BudgetService } from '../../services/budget.service';

interface Goal {
    id?: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    monthlyContribution: number;
    deadline: string;
    priority: number;
    status: string;
    templateId: string;
}

@Component({
    selector: 'app-goals',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './goals.component.html',
    styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
    goals: Goal[] = [];

    // Templates
    templates = [
        { id: 'emergency', name: 'Emergency Fund', icon: '🚨', target: 100000, monthly: 10000 },
        { id: 'wedding', name: 'Wedding Fund', icon: '💒', target: 500000, monthly: 15000 },
        { id: 'vacation', name: 'Dream Vacation', icon: '✈️', target: 150000, monthly: 5000 },
        { id: 'car', name: 'New Car', icon: '🚗', target: 800000, monthly: 20000 },
        { id: 'home', name: 'Home Down Payment', icon: '🏠', target: 2000000, monthly: 30000 },
        { id: 'education', name: 'Education Fund', icon: '🎓', target: 300000, monthly: 10000 }
    ];

    // Modals
    showAddGoal = false;
    showAddFunds = false;
    showSmartPlan = false;

    // Forms
    newGoal: Goal = this.getEmptyGoal();
    selectedGoal: Goal | null = null;
    fundsToAdd: number = 0;

    // Smart Plan
    totalSavings: number = 0;
    smartAllocation: any = {}; // Map of GoalID -> Amount

    availableFromPlanning = 0; // New field for budget balance

    // Make Object available in template
    Object = Object;

    constructor(
        private goalService: GoalService,
        private budgetService: BudgetService
    ) { }

    ngOnInit(): void {
        this.loadGoals();
        this.loadBudgetBalance();
    }

    getEmptyGoal(): Goal {
        return {
            name: '',
            targetAmount: 0,
            currentAmount: 0,
            monthlyContribution: 0,
            deadline: '',
            priority: 1,
            status: 'ACTIVE',
            templateId: ''
        };
    }

    loadGoals(): void {
        this.goalService.getGoals().subscribe({
            next: data => {
                this.goals = data;
            },
            error: err => console.error('Error loading goals:', err)
        });
    }

    loadBudgetBalance() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        this.budgetService.getPlan(month, year).subscribe({
            next: (plan) => {
                this.availableFromPlanning = plan.availableForGoals || 0;
            },
            error: (err) => {
                console.error('Error loading budget:', err);
                this.availableFromPlanning = 0;
            }
        });
    }

    // --- Create Goal ---
    openCreateGoal() {
        this.newGoal = this.getEmptyGoal();
        this.showAddGoal = true;
    }

    openTemplate(template: any) {
        this.newGoal = {
            ...this.getEmptyGoal(), // Start with a clean goal
            name: template.name,
            targetAmount: template.target,
            priority: template.priority,
            monthlyContribution: template.monthly,
            templateId: template.icon
        };
        this.showAddGoal = true;
    }

    createGoal() {
        const goalToSend = { ...this.newGoal };
        if (!goalToSend.deadline) {
            // @ts-ignore
            goalToSend.deadline = null;
        }
        this.goalService.createGoal(goalToSend).subscribe({
            next: () => {
                this.showAddGoal = false;
                this.loadGoals();
            }
        });
    }

    // --- Manual Add Funds ---
    openAddFunds(goal: any) {
        this.selectedGoal = goal;
        this.fundsToAdd = 0;
        this.showAddFunds = true;
    }

    submitFunds() {
        if (this.selectedGoal && this.fundsToAdd > 0) {
            this.goalService.addFunds(this.selectedGoal.id!, this.fundsToAdd).subscribe({
                next: () => {
                    this.showAddFunds = false;
                    this.loadGoals();
                    // TODO: Trigger confetti here!
                }
            });
        }
    }

    // --- Smart Plan ---
    calculateSmartPlan() {
        if (this.totalSavings > 0) {
            this.goalService.calculateAllocation(this.totalSavings).subscribe({
                next: (data) => {
                    this.smartAllocation = data;
                }
            });
        }
    }

    applySmartPlan() {
        if (this.smartAllocation && Object.keys(this.smartAllocation).length > 0) {
            this.goalService.applyAllocation(this.smartAllocation).subscribe({
                next: () => {
                    this.showSmartPlan = false;
                    this.loadGoals();
                    this.smartAllocation = {};
                    this.totalSavings = 0;
                }
            });
        }
    }

    getProgress(goal: any): number {
        if (!goal.targetAmount || goal.targetAmount === 0) return 0;
        return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
    }
    getGoalPriority(goalId: string): number {
        const id = parseInt(goalId);
        const goal = this.goals.find(g => g.id === id);
        return goal ? goal.priority : 3;
    }
}
