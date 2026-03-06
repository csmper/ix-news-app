import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';


interface NewsSource {
	_: string;
	$: {
		url: string;
	};
}

interface NewsItem {
	title: string;
	link: string;
	pubDate: string;
	description: string;
	source: NewsSource[];
}

interface NewsResponse {
	rss : {
		channel: {
			item: NewsItem[];
		}[];
	}
}

enum NewsType {
	TOP_NEWS = 'Top News',
	TECHNOLOGY = 'Technology',
	SPORTS = 'Sports'
}


@Component({
	selector: 'app-root',
	templateUrl: './app.html',
	styleUrl: './app.scss',
	imports: [DatePipe]
})
export class App implements OnInit {
	protected readonly title = signal('ix-news-app');
	private readonly http = inject(HttpClient);
	news = signal<NewsItem[]>([]);
	newsType = NewsType;
	activeTab = NewsType.TOP_NEWS;
NewsType: any;

	ngOnInit() {
		this.getNews();
	}

	getNews() {
		this.http.get<NewsResponse>('/api/news').subscribe((data) => {
			this.news.set(data.rss.channel[0].item);
		});
	}
}

