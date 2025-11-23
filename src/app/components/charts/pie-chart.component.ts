import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center w-full h-full">
      <div class="relative w-full h-full">
        <svg viewBox="-1 -1 2 2" style="transform: rotate(-90deg)" class="w-full h-full">
          <path *ngFor="let slice of slices" [attr.d]="slice.path" [attr.fill]="slice.color" 
            class="transition-all duration-300 hover:opacity-90 cursor-pointer">
            <title>{{slice.label}}: ₹{{slice.value | number}} ({{slice.percent | number:'1.0-1'}}%)</title>
          </path>
        </svg>
        <!-- Center Hole for Donut Chart -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="w-1/2 h-1/2 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <ng-container *ngIf="showTotal">
                <span class="text-[10px] text-gray-500 font-medium leading-none">Total</span>
                <span class="text-xs font-bold text-gray-800 leading-tight">₹{{total | number}}</span>
            </ng-container>
          </div>
        </div>
      </div>
      
      <!-- Legend -->
      <div *ngIf="showLegend" class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm w-full">
        <div *ngFor="let item of data" class="flex items-center">
          <span class="w-3 h-3 rounded-full mr-2" [style.backgroundColor]="item.color"></span>
          <span class="text-gray-600 truncate flex-1" [title]="item.label">{{item.label}}</span>
          <span class="font-semibold text-gray-800">{{item.value | number}}</span>
        </div>
      </div>
    </div>
  `
})
export class PieChartComponent implements OnChanges {
  @Input() data: ChartData[] = [];
  @Input() showLegend: boolean = true;
  @Input() showTotal: boolean = true;

  slices: any[] = [];
  total: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.calculateSlices();
    }
  }

  calculateSlices() {
    this.total = this.data.reduce((sum, item) => sum + item.value, 0);

    if (this.total === 0) {
      this.slices = [{ path: this.getSlicePath(0, 1), color: '#e5e7eb', label: 'No Data', value: 0, percent: 0 }];
      return;
    }

    let cumulativePercent = 0;
    this.slices = this.data.map(item => {
      const percent = item.value / this.total;
      const start = cumulativePercent;
      cumulativePercent += percent;
      const end = cumulativePercent;

      return {
        path: this.getSlicePath(start, end),
        color: item.color,
        label: item.label,
        value: item.value,
        percent: percent * 100
      };
    });
  }

  getSlicePath(startPercent: number, endPercent: number): string {
    const startX = Math.cos(2 * Math.PI * startPercent);
    const startY = Math.sin(2 * Math.PI * startPercent);
    const endX = Math.cos(2 * Math.PI * endPercent);
    const endY = Math.sin(2 * Math.PI * endPercent);

    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  }
}
