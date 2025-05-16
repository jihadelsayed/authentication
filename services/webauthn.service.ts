import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WebAuthnService {
  constructor(private http: HttpClient) {}

  beginRegistration(userId: string) {
    return this.http.post('/auth/webauthn/begin-registration/', {
      user_id: userId,
    });
  }

  finishRegistration(attestationResponse: any) {
    return this.http.post('/auth/webauthn/finish-registration/', attestationResponse);
  }

  beginLogin(userId: string) {
    return this.http.post('/auth/webauthn/begin-login/', {
      user_id: userId,
    });
  }

  finishLogin(assertionResponse: any) {
    return this.http.post('/auth/webauthn/finish-login/', assertionResponse);
  }

  async register(userId: string) {
    const options: any = await this.beginRegistration(userId).toPromise();
    const credential = await startRegistration(options);
    await this.finishRegistration(credential).toPromise();
  }

  async login(userId: string) {
    const options: any = await this.beginLogin(userId).toPromise();
    const assertion = await startAuthentication(options);
    const result: any = await this.finishLogin(assertion).toPromise();
    return result;
  }
}
