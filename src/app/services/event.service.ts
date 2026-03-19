import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, EventRequest, CalendarView } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly API_URL = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(view?: CalendarView): Observable<Event[]> {
    let params = new HttpParams();
    
    if (view) {
      params = params.set('start_date', view.start_date);
      params = params.set('end_date', view.end_date);
    }

    return this.http.get<Event[]>(this.API_URL, { params });
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/${id}`);
  }

  createEvent(event: EventRequest): Observable<Event> {
    return this.http.post<Event>(this.API_URL, event);
  }

  updateEvent(id: number, event: EventRequest): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/${id}`, event);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getEventsByDay(date: string): Observable<Event[]> {
    console.log('Appel API getEventsByDay pour:', date);
    return this.http.get<Event[]>(`${this.API_URL}/day/${date}`);
  }
}