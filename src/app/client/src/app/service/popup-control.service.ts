import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PopupControlService {

  private popupSource = new BehaviorSubject(true);
  public checkPopupStatus = this.popupSource.asObservable();

  constructor() { }

  changePopupStatus(value: boolean) {
    this.popupSource.next(value);
  }

  acceptTnc() {
    // ... logic to handle TNC acceptance
    localStorage.setItem('tncAccepted', 'true');
    // Close the modal
  }

}
