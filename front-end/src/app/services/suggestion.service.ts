import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Suggestion } from '../models/suggestion.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SuggestionService {
private apiUrl = `${environment.apiUrl}/suggestions`;

constructor(private http: HttpClient) {}

getSuggestions(): Observable<Suggestion[]> {
return this.http.get<Suggestion[]>(this.apiUrl);
}

createSuggestion(suggestion: Suggestion): Observable<Suggestion> {
return this.http.post<Suggestion>(this.apiUrl, suggestion);
}
}
