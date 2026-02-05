import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../services/auth.service';
// import { AuthService } from '../../../../auth/auth.service'; // Cambiar
import { UserService } from '../../../../services/user.service';
import { AlertService } from '../../../../services/alert.service';
import { ProfileSyncService } from '../../../../services/profile-sync.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  displayName = '';
  bio = '';
  profileImageUrl = '../../../../../assets/images/icons/profile.svg';
  selectedImageFile: File | null = null;
  loading = true;

  originalDisplayName = '';
  originalBio = '';
  originalImage = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private alertService: AlertService,
    private profileSync: ProfileSyncService
  ) {}
  
  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) return;
    
      this.userService.getProfile().subscribe(profile => {
        this.displayName = profile.displayName || '';
        this.bio = profile.bio || '';
        this.profileImageUrl = profile.profileImage
          ? profile.profileImage
          : '../../../../../assets/images/icons/profile.svg';
      
        this.originalDisplayName = this.displayName;
        this.originalBio = this.bio;
        this.originalImage = this.profileImageUrl;
        this.loading = false;
      });
    });
  }

  saveProfile() {
    const user = this.authService.getUser();
    if (!user) return;

    const formData = new FormData();
    formData.append('displayName', this.displayName);
    formData.append('bio', this.bio);
    formData.append('username', user.username);
    formData.append('email', user.email);

    if (this.selectedImageFile) {
      formData.append('profileImage', this.selectedImageFile);
    }

    this.userService.updateProfileFormData(formData).subscribe({
      next: updatedUser => {
        const imageUrl = updatedUser.profileImage || 'assets/images/icons/profile.svg';
        this.profileImageUrl = imageUrl;

        this.authService.updateCurrentUser({
          username: updatedUser.username,
          email: updatedUser.email,
          displayName: updatedUser.displayName,
          profileImage: imageUrl
        });

        this.profileSync.notifyProfileUpdate(updatedUser);

        this.originalDisplayName = updatedUser.displayName;
        this.originalBio = updatedUser.bio;
        this.originalImage = imageUrl;
        this.selectedImageFile = null;

        this.alertService.show('PROFILE_UPDATED_SUCCESSFULLY');
      },
      error: err => console.log('Error updating profile', err)
    });
  }
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedImageFile = file;

    const reader = new FileReader();
    reader.onload = () => (this.profileImageUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  hasChanges(): boolean {
    return (
      this.displayName !== this.originalDisplayName ||
      this.bio !== this.originalBio ||
      this.profileImageUrl !== this.originalImage
    );
  }
}
