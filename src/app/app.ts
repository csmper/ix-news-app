import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NewsItem, NewsResponse } from './app.model';
import { NewsType } from './app.enum';

@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss',
	imports: [DatePipe]
})
export class App implements OnInit {
	private readonly http = inject(HttpClient);
	news = signal<NewsItem[]>([]);
	newsType = NewsType;
	activeTab = NewsType.TOP_NEWS;
	showSpinner = signal(true);
	errorMessage = signal('');

	get newsTypes(): NewsType[] {
		return Object.values(NewsType);
	}

	ngOnInit() {
		this.getNews(NewsType.TOP_NEWS);
	}

	getNews(newsType: NewsType) {
		this.showSpinner.set(true);
		this.errorMessage.set('');
		this.news.set([]);
		this.activeTab = newsType;
		const params = new URLSearchParams({ newsType: this.activeTab });
		this.http.get<NewsResponse>(`/api/news?${params}`).subscribe({
			next: (data) => {
				this.showSpinner.set(false);
				this.news.set(data.rss.channel[0].item);
			},
			error: (error) => {
				this.showSpinner.set(false);
				this.errorMessage.set('Failed to fetch news. Please try again later.');
				console.error('Error fetching news:', error);
			}
		});
	}
}
