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

  it('should fetch news when tab is clicked', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    
    // initial load
    const req1 = httpTestingController.expectOne('/api/news?newsType=Top+Stories');
    req1.flush({ rss: { channel: [{ item: [] }] } });

    // click technology tab
    app.getNews(app.newsType.TECHNOLOGY);
    fixture.detectChanges();

    const req2 = httpTestingController.expectOne('/api/news?newsType=Technology');
    expect(req2.request.method).toBe('GET');
    req2.flush({ rss: { channel: [{ item: [] }] } });
    
    expect(app.activeTab).toBe(app.newsType.TECHNOLOGY);
  });
});
