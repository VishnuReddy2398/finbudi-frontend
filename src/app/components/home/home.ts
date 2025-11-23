import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  username?: string;
  currentQuoteIndex = 0;

  quotes = [
    { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
    { text: "Do not save what is left after spending, but spend what is left after saving.", author: "Warren Buffett" },
    { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
    { text: "It's not how much money you make, but how much money you keep.", author: "Robert Kiyosaki" },
    { text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author: "Dave Ramsey" }
  ];

  constructor(private storage: StorageService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.storage.isLoggedIn();

    if (this.isLoggedIn) {
      const user = this.storage.getUser();
      this.username = user.username;
    }

    // Rotate quotes every 5 seconds
    setInterval(() => {
      this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
    }, 5000);
  }

  get currentQuote() {
    return this.quotes[this.currentQuoteIndex];
  }
}
