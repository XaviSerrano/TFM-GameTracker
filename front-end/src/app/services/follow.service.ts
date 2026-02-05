import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FollowService {
private apiUrl = `${environment.apiUrl}/follow`;

constructor(private http: HttpClient) {}

followUser(targetUserId: number): Observable<any> {
return this.http.post(`${this.apiUrl}/${targetUserId}`, {});
}

unfollowUser(targetUserId: number): Observable<any> {
return this.http.delete(`${this.apiUrl}/${targetUserId}`);
}

isFollowing(targetUserId: number): Observable<{ following: boolean }> {
return this.http.get<{ following: boolean }>(`${this.apiUrl}/is-following/${targetUserId}`);
}

getFollowers(userId: number): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/followers/${userId}`);
}

getFollowing(userId: number): Observable<any[]> {
return this.http.get<any[]>(`${this.apiUrl}/following/${userId}`);
}
}
