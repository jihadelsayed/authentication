import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceIdService {
  private key = 'device_id';

  getOrGenerateDeviceId(): string {
    let id = localStorage.getItem(this.key);
    if (!id) {
      id = crypto.randomUUID(); // ✅ Use native secure UUID
      localStorage.setItem(this.key, id);
    }
    return id;
  }
}
