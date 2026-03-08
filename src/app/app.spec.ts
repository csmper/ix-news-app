import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('App', () => {
	let httpTestingController: HttpTestingController;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [App],
			providers: [
				provideHttpClient(),
				provideHttpClientTesting()
			]
		}).compileComponents();

		httpTestingController = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		httpTestingController.verify();
	});

	it('should create the app', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		expect(app).toBeTruthy();

		// Catch the initial HTTP request triggered by ngOnInit
		fixture.detectChanges();
		const req = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		req.flush({ rss: { channel: [{ item: [] }] } });
	});

	it('should render news after fetching', async () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges(); // Triggers ngOnInit

		const req = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		expect(req.request.method).toBe('GET');
		req.flush({
			rss: {
				channel: [{
					item: [{
						title: ['Test News Title'],
						link: ['http://test.com'],
						pubDate: ['Mon, 01 Jan 2024 00:00:00 GMT'],
						description: ['Test description'],
						source: []
					}]
				}]
			}
		});

		fixture.detectChanges();
		await fixture.whenStable();

		const compiled = fixture.nativeElement as HTMLElement;
		// The spinner should be hidden and the card should be rendered
		expect(app.showSpinner()).toBe(false);
		expect(compiled.querySelector('.card-title')?.textContent).toContain('Test News Title');
	});

	it('should fetch news when tab is clicked in the DOM', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// initial load
		const req1 = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		req1.flush({ rss: { channel: [{ item: [] }] } });

		// get all buttons and find the technology tab
		const compiled = fixture.nativeElement as HTMLElement;
		const buttons = compiled.querySelectorAll('button');
		const techButton = Array.from(buttons).find(btn => btn.textContent?.includes(app.newsType.TECHNOLOGY));

		// ensure the button exists and click it
		expect(techButton).toBeTruthy();
		techButton?.click();
		fixture.detectChanges();

		// clicking should trigger a new http request for Technology news
		const req2 = httpTestingController.expectOne('/api/news?newsType=Technology');
		expect(req2.request.method).toBe('GET');
		req2.flush({ rss: { channel: [{ item: [] }] } });

		// state should be updated
		expect(app.activeTab).toBe(app.newsType.TECHNOLOGY);
	});

	it('should call getNews with TOP_NEWS when TOP_NEWS button is clicked', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// clear initial request from ngOnInit
		const initialReq = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		initialReq.flush({ rss: { channel: [{ item: [] }] } });

		// Click a different button first to change state
		const compiled = fixture.nativeElement as HTMLElement;
		const buttons = compiled.querySelectorAll('button');
		const techButton = Array.from(buttons).find(btn => btn.textContent?.includes(app.newsType.TECHNOLOGY));
		techButton?.click();
		fixture.detectChanges();

		// clear the tech request
		const techReq = httpTestingController.expectOne('/api/news?newsType=Technology');
		techReq.flush({ rss: { channel: [{ item: [] }] } });

		// Now click the TOP_NEWS button to trigger the specific click handler
		const topNewsButton = Array.from(buttons).find(btn => btn.textContent?.includes(app.newsType.TOP_NEWS));
		expect(topNewsButton).toBeTruthy();
		topNewsButton?.click();
		fixture.detectChanges();

		// verify the HTTP request is made when TOP_NEWS is clicked
		const req = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		expect(req.request.method).toBe('GET');
		req.flush({ rss: { channel: [{ item: [] }] } });

		// verify the active tab is updated to TOP_NEWS
		expect(app.activeTab).toBe(app.newsType.TOP_NEWS);
	});

	it('should return all news types from newsTypes getter', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// clear initial request
		const req = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		req.flush({ rss: { channel: [{ item: [] }] } });

		// verify newsTypes getter returns all enum values
		expect(app.newsTypes).toBeDefined();
		expect(app.newsTypes.length).toBe(4);
		expect(app.newsTypes).toContain(app.newsType.TOP_NEWS);
		expect(app.newsTypes).toContain(app.newsType.TECHNOLOGY);
		expect(app.newsTypes).toContain(app.newsType.BUSINESS);
		expect(app.newsTypes).toContain(app.newsType.SPORTS);
	});

	it('should render a button for each news type', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// clear initial request
		const req = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		req.flush({ rss: { channel: [{ item: [] }] } });

		const compiled = fixture.nativeElement as HTMLElement;
		const buttons = compiled.querySelectorAll('button');

		// should have 4 buttons, one for each news type
		expect(buttons.length).toBe(4);

		// verify each button corresponds to a news type
		Array.from(buttons).forEach((button, index) => {
			expect(button.textContent?.trim()).toBe(app.newsTypes[index]);
		});
	});

	it('should handle error in getNews and display error message', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// clear initial request
		const initialReq = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		initialReq.flush({ rss: { channel: [{ item: [] }] } });

		// make a new request
		app.getNews(app.newsType.TECHNOLOGY);
		fixture.detectChanges();

		// simulate a network error
		const req = httpTestingController.expectOne('/api/news?newsType=Technology');
		req.error(new ErrorEvent('Network error'));
		fixture.detectChanges();

		// verify error state
		expect(app.showSpinner()).toBe(false);
		expect(app.errorMessage()).toBe('Failed to fetch news. Please try again later.');
	});

	it('should clear error message when fetching new news', () => {
		const fixture = TestBed.createComponent(App);
		const app = fixture.componentInstance;
		fixture.detectChanges();

		// clear initial request
		const initialReq = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
		initialReq.flush({ rss: { channel: [{ item: [] }] } });

		// make a request and trigger an error
		app.getNews(app.newsType.TECHNOLOGY);
		fixture.detectChanges();

		const errorReq = httpTestingController.expectOne('/api/news?newsType=Technology');
		errorReq.error(new ErrorEvent('Network error'));
		fixture.detectChanges();

		// verify error is set
		expect(app.errorMessage()).toBe('Failed to fetch news. Please try again later.');

		// make another request
		app.getNews(app.newsType.BUSINESS);
		fixture.detectChanges();

		// verify error message is cleared
		expect(app.errorMessage()).toBe('');

		// complete the request
		const successReq = httpTestingController.expectOne('/api/news?newsType=Business');
		successReq.flush({ rss: { channel: [{ item: [] }] } });
	});
});
