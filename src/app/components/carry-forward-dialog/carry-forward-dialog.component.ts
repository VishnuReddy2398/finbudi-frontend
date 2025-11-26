import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyPlan } from '../../services/planning.service';

@Component({
    selector: 'app-carry-forward-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all scale-100">
        <div class="text-center mb-6">
          <span class="text-4xl mb-4 block">📅</span>
          <h2 class="text-2xl font-bold text-slate-800">New Month Started!</h2>
          <p class="text-slate-500 mt-2">Do you want to use last month's plan?</p>
        </div>

        <div class="bg-slate-50 rounded-xl p-4 mb-8 border border-slate-100">
          <h3 class="text-xs font-bold text-slate-500 uppercase mb-3">Last Month's Plan</h3>
          
          <div class="flex justify-between mb-2">
            <span class="text-slate-600">Income</span>
            <span class="font-bold text-slate-800">₹{{previousPlan.totalIncome | number}}</span>
          </div>
          
          <div class="flex justify-between mb-2">
            <span class="text-slate-600">Fixed Obligations</span>
            <span class="font-bold text-rose-600">₹{{fixedTotal | number}}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-slate-600">Discretionary</span>
            <span class="font-bold text-emerald-600">₹{{discretionaryTotal | number}}</span>
          </div>
        </div>

        <div class="space-y-3">
          <button (click)="onCarryForward()" class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <span>⚡</span> Carry Forward Plan
          </button>
          
          <button (click)="onModify()" class="w-full bg-white text-slate-600 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
            ✏️ Modify Plan
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `]
})
export class CarryForwardDialogComponent {
    @Input() previousPlan!: MonthlyPlan;
    @Output() carryForward = new EventEmitter<void>();
    @Output() modify = new EventEmitter<void>();

    get fixedTotal(): number {
        return this.previousPlan.items
            .filter(i => i.fixed)
            .reduce((sum, item) => sum + item.plannedAmount, 0);
    }

    get discretionaryTotal(): number {
        return this.previousPlan.items
            .filter(i => !i.fixed)
            .reduce((sum, item) => sum + item.plannedAmount, 0);
    }

    onCarryForward() {
        this.carryForward.emit();
    }

    onModify() {
        this.modify.emit();
    }
}
