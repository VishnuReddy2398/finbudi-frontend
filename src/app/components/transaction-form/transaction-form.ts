import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FinanceService, Transaction, Category } from '../../services/finance';

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

  constructor(private financeService: FinanceService, private router: Router) { }

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.financeService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  onSubmit() {
    // If creating a new category, first save the category
    if (this.isNewCategory && this.newCategoryName) {
      const newCategory: Category = { name: this.newCategoryName };
      this.financeService.addCategory(newCategory).subscribe({
        next: (savedCategory) => {
          this.transaction.category = savedCategory;
          this.saveTransaction();
        },
        error: (err) => {
          console.error('Error creating category:', err);
          alert('Failed to create category. Please try again.');
        }
      });
    } else {
      this.saveTransaction();
    }
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
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
}
