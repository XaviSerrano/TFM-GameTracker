import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomList } from '../models/custom-list.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CustomListService {
private apiUrl = `${environment.apiUrl}/custom-lists`;

constructor(private http: HttpClient) {}

createList(data: { title: string; description?: string }): Observable<CustomList> {
return this.http.post<CustomList>(this.apiUrl, data);
}

getMyLists(): Observable<CustomList[]> {
return this.http.get<CustomList[]>(this.apiUrl);
}

deleteList(listId: number): Observable<void> {
return this.http.delete<void>(`${this.apiUrl}/${listId}`);
}

toggleGameInList(listId: number, game: any): Observable<any> {
return this.http.post(`${this.apiUrl}/${listId}/games/toggle`, game);
}

getListById(id: string | number): Observable<CustomList> {
return this.http.get<CustomList>(`${this.apiUrl}/${id}`);
}

updateList(listId: number, data: { title: string; description?: string }): Observable<CustomList> {
return this.http.patch<CustomList>(`${this.apiUrl}/${listId}`, data);
}
}
