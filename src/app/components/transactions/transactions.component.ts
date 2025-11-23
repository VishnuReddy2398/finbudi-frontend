import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService, Transaction, Category } from '../../services/finance';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
    transactions: Transaction[] = [];
    categories: Category[] = [];

    // Search and filter
    searchTerm = '';
    selectedCategory = '';
    selectedType = '';
    sortBy = 'date';
    sortOrder = 'desc';

    private searchSubject = new Subject<string>();

    // Edit/Delete state
    editingTransaction: Transaction | null = null;
    deletingTransaction: Transaction | null = null;
    showEditModal = false;
    showDeleteModal = false;

    // Form for editing
    editForm: Transaction = this.getEmptyTransaction();

    // Date validation
    maxDate: string = new Date().toISOString().split('T')[0];
    minDate: string = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    constructor(private financeService: FinanceService) { }

    ngOnInit() {
        this.loadTransactions();
        this.loadCategories();

        // Setup search debounce
        this.searchSubject.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(() => {
            this.loadTransactions();
        });
    }

    loadTransactions() {
        const params: any = {};
        if (this.searchTerm) params.search = this.searchTerm;
        if (this.selectedCategory) params.category = this.selectedCategory;
        if (this.selectedType) params.type = this.selectedType;
        if (this.sortBy) params.sortBy = this.sortBy;
        if (this.sortOrder) params.sortOrder = this.sortOrder;

        this.financeService.getTransactions(params).subscribe({
            next: (data) => this.transactions = data,
            error: (err) => console.error('Error loading transactions:', err)
        });
    }

    loadCategories() {
        this.financeService.getCategories().subscribe({
            next: (data) => this.categories = data,
            error: (err) => console.error('Error loading categories:', err)
        });
    }

    onSearchChange() {
        this.searchSubject.next(this.searchTerm);
    }

    onFilterChange() {
        this.loadTransactions();
    }

    onSortChange(field: string) {
        if (this.sortBy === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortBy = field;
            this.sortOrder = 'desc';
        }
        this.loadTransactions();
    }

    clearFilters() {
        this.searchTerm = '';
        this.selectedCategory = '';
        this.selectedType = '';
        this.loadTransactions();
    }

    openEditModal(transaction: Transaction) {
        this.editingTransaction = transaction;
        this.editForm = { ...transaction };
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.editingTransaction = null;
        this.editForm = this.getEmptyTransaction();
    }

    saveEdit() {
        if (!this.editingTransaction?.id) return;

        this.financeService.updateTransaction(this.editingTransaction.id, this.editForm).subscribe({
            next: () => {
                this.loadTransactions();
                this.closeEditModal();
            },
            error: (err) => {
                console.error('Error updating transaction:', err);
                alert('Failed to update transaction');
            }
        });
    }

    openDeleteModal(transaction: Transaction) {
        this.deletingTransaction = transaction;
        this.showDeleteModal = true;
    }

    closeDeleteModal() {
        this.showDeleteModal = false;
        this.deletingTransaction = null;
    }

    confirmDelete() {
        if (!this.deletingTransaction?.id) return;

        this.financeService.deleteTransaction(this.deletingTransaction.id).subscribe({
            next: () => {
                this.loadTransactions();
                this.closeDeleteModal();
            },
            error: (err) => {
                console.error('Error deleting transaction:', err);
                alert('Failed to delete transaction');
            }
        });
    }

    private getEmptyTransaction(): Transaction {
        return {
            amount: 0,
            type: 'EXPENSE',
            date: new Date().toISOString().split('T')[0],
            description: ''
        };
    }
}
