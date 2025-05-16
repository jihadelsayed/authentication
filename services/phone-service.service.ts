// phone.service.ts
import { Injectable } from "@angular/core";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { Observable } from "rxjs/internal/Observable";
import { DeviceIdService } from "./device-id.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { RuntimeConfigService } from "../../services/runtime-config.service";

@Injectable({ providedIn: "root" })
export class PhoneService {
  countries = [
    { code: "US", dialCode: "1", flag: "🇺🇸" },
    { code: "AE", dialCode: "971", flag: "🇦🇪" },
    { code: "SY", dialCode: "963", flag: "🇸🇾" },
    { code: "GB", dialCode: "44", flag: "🇬🇧" },
  ];

  phoneVerificationCode: string = "";
  phoneVerificationError: string = "";
  generatedCode: string = "";

  constructor(
    private http: HttpClient,
    private config: RuntimeConfigService,
    private deviceIdService: DeviceIdService
  ) {}

  isValidPhone(phone: string): boolean {
    try {
      const parsed = parsePhoneNumberFromString(phone, "US");
      return parsed?.isValid() ?? false;
    } catch {
      return false;
    }
  }

  getFullPhoneNumber(countryCode: string, phone: string): string {
    const country = this.countries.find((c) => c.code === countryCode);
    if (!country || !phone) return "";
    return `+${country.dialCode}${phone.replace(/\D/g, "")}`;
  }

  sendVerificationCode(
    selectedCountry: string,
    phone: string,
    onSuccess: () => void
  ): void {
    const fullPhone = this.getFullPhoneNumber(selectedCountry, phone);
    const url = this.config.serverUrl + "auth/otp/send/";

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Device-ID": this.deviceIdService.getOrGenerateDeviceId(),
    });

    this.http.post<any>(url, { phone: fullPhone }, { headers }).subscribe({
      next: () => onSuccess(),
      error: (err) => {
        console.error("OTP send failed:", err);
        this.phoneVerificationError =
          err?.error?.detail || "Failed to send verification code.";
      },
    });
  }

verifyCode(
  selectedCountry: string,
  phone: string,
  otp: string,
  onSuccess: (hasPassword: boolean) => void
): void {
  const fullPhone = this.getFullPhoneNumber(selectedCountry, phone);
  const url = this.config.serverUrl + "auth/otp/verify/";

  const headers = new HttpHeaders({
    "Content-Type": "application/json",
    "X-Device-ID": this.deviceIdService.getOrGenerateDeviceId(),
  });

  this.http.post<any>(url, { phone: fullPhone, otp }, { headers }).subscribe({
    next: (res) => {
      if (res.token) {
        localStorage.setItem("userToken", res.token);
        localStorage.setItem("UserInfo", JSON.stringify(res.user));
        onSuccess(res.has_password);
      } else {
        this.phoneVerificationError = res.detail || "Invalid OTP";
      }
    },
    error: (err) => {
      console.error("OTP verification failed:", err);
      this.phoneVerificationError =
        err?.error?.detail || "Verification failed.";
    },
  });
}

}
