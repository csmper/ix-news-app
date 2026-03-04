import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App implements OnInit {
	protected readonly title = signal('ix-news-app');
	private readonly http = inject(HttpClient);
	news = signal<NewsItem[]>([]);

	ngOnInit() {
		this.getNews();
	}

	getNews() {
		this.http.get<NewsResponse>('/api/news').subscribe((data) => {
			this.news.set(data.rss.channel[0].item);
		});
	}
}

interface NewsItem {
	title: string;
	link: string;
	pubDate: string;
	description: string;
}

interface NewsResponse {
	rss : {
		channel: {
			item: NewsItem[];
		}[];
	}
}
