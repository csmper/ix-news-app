export interface NewsSource {
	_: string;
	$: {
		url: string;
	};
}

export interface NewsItem {
	title: string;
	link: string;
	pubDate: string;
	description: string;
	source: NewsSource[];
}

export interface NewsResponse {
	rss: {
		channel: {
			item: NewsItem[];
		}[];
	}
}