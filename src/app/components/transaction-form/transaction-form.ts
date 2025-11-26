import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanceService, Transaction, Category } from '../../services/finance';
import { PlanningService } from '../../services/planning.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css'
})
export class TransactionFormComponent implements OnInit {
  transaction: Transaction = {
    amount: 0,
    type: 'EXPENSE',
    category: { name: '' },
    date: new Date().toISOString().split('T')[0],
    description: ''
  };

  categories: Category[] = [];
  newCategoryName = '';
  isNewCategory = false;

  // Date validation - last 15 days only
  maxDate: string = new Date().toISOString().split('T')[0];
  minDate: string = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  constructor(
    private financeService: FinanceService,
    private router: Router,
    private planningService: PlanningService
  ) { }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    // Get predefined categories from PlanningService
    const predefined = this.planningService.getPredefinedCategories();
    const allPredefined = [
      ...predefined.DEBT,
      ...predefined.ESSENTIAL,
      ...predefined.DISCRETIONARY
    ].map(c => ({ name: c.name }));

    this.financeService.getCategories().subscribe(data => {
      // Create a Set of existing names for easy lookup (case-insensitive)
      const existingNames = new Set(data.map(c => c.name.toLowerCase()));

      // Filter out predefined categories that already exist in the DB response
      const uniquePredefined = allPredefined.filter(c => !existingNames.has(c.name.toLowerCase()));

      // Combine existing DB categories with unique predefined ones
      this.categories = [...data, ...uniquePredefined];

      // Sort alphabetically
      this.categories.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  onSubmit() {
    // If creating a new category, just set the name. 
    // The backend's saveTransaction logic handles "find or create" safely.
    if (this.isNewCategory && this.newCategoryName) {
      this.transaction.category = { name: this.newCategoryName };
    }

    this.saveTransaction();
  }

  private saveTransaction() {
    this.financeService.addTransaction(this.transaction).subscribe({
      next: () => {
        alert('Transaction saved successfully!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Error saving transaction:', err);
        alert('Failed to save transaction. Please try again.');
      }
    });
  }

  compareCategories(c1: Category, c2: Category): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }
}
