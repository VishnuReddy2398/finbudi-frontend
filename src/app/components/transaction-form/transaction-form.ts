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
    categoryName: '',
    categoryId: undefined,
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
    this.financeService.getCategories().subscribe(data => {
      this.categories = data;
      // Sort alphabetically
      this.categories.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  onSubmit() {
    // If creating a new category, just set the name. 
    // The backend's saveTransaction logic handles "find or create" safely.
    if (this.isNewCategory && this.newCategoryName) {
      this.transaction.categoryName = this.newCategoryName;
      this.transaction.categoryId = undefined;
    } else if (this.transaction.categoryName) {
      // Find ID if existing category selected
      const selected = this.categories.find(c => c.name === this.transaction.categoryName);
      if (selected && selected.id) {
        this.transaction.categoryId = selected.id;
      }
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
