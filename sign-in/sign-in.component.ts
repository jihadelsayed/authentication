import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import {
  FormControl,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { UserService } from "../services/user.service";
import { CookieService } from "ngx-cookie-service";
import parsePhoneNumberFromString from "libphonenumber-js";
import { PhoneService } from "../services/phone-service.service";
import { PasswordService } from "../services/password-service.service";

@Component({
  selector: "app-sign-in",
  standalone: true,
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.scss"],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // ✅ <-- Add this
    RouterModule,
  ],
  providers: [CookieService],
})
export class SignInComponent implements OnInit {
  loginUser: any = {
    email: "",
    phone: "",
    password: "",
  };

  loginStep: number = 1;
  loginUseEmail: boolean = false;
  loginLoading: boolean = false;
  loginError: string = "";
  showPassword: boolean = false;
  phoneTouched: boolean = false;
  selectedCountry: string = "US";
  language: string = "en";
  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private cookie: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public phoneService: PhoneService,
    public passwordService: PasswordService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.host = params["host"] ?? null;
      this.port = params["port"] ?? "443";
      this.pathname = params["pathname"] ?? "";
      this.language = params["language"] ?? "en";
    });
  }

  nextLoginStep(): void {
    if (this.isLoginStep1Valid()) {
      this.loginStep = 2;
    }
  }

  isLoginStep1Valid(): boolean {
    if (this.loginUseEmail) {
      return !!this.loginUser.email && this.isValidEmail(this.loginUser.email);
    } else {
      const fullPhone = this.phoneService.getFullPhoneNumber(
        this.selectedCountry,
        this.loginUser.phone
      );

      return (
        !!this.loginUser.phone && this.phoneService.isValidPhone(fullPhone)
      );
    }
  }

  onLoginSubmit(form: NgForm): void {
    if (!form.valid) return;

    const loginIdentifier = this.loginUseEmail
      ? this.loginUser.email
      : this.phoneService.getFullPhoneNumber(
          this.selectedCountry,
          this.loginUser.phone
        );

    this.loginLoading = true;
    this.userService
  .userAuthentication({
    identifier: loginIdentifier,
    password: this.loginUser.password
  })

      .subscribe(
        (data: any) => {
          localStorage.setItem("userToken", data.token);
          localStorage.setItem("UserInfo", JSON.stringify(data.user));
          this.cookie.set("userToken", data.token);
          this.cookie.set("UserInfo", JSON.stringify(data.user));

          const redirectHost = this.host ?? "neetechs.com";
          const redirectPort = this.port ?? "443";
          const redirectLang = (this.language ?? "en").slice(0, 2);
          const redirectPath = this.pathname ?? "";
          const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;

          window.location.href = finalRedirect;
          this.loginLoading = false;
        },
        (error) => {
          this.loginLoading = false;
          let msg: string = "Login failed";
          if (error.status === 400) {
            if (error.error["non_field_errors"])
              msg = error.error["non_field_errors"];
            if (error.error["email"]) msg = error.error["email"];
            if (error.error["password"]) msg = error.error["password"];
          } else {
            msg = error.message;
          }
          this.loginError = msg;
        }
      );
  }

  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  isValidPhone(phone: string): boolean {
    return this.phoneService.isValidPhone(phone);
  }
  getFullPhoneNumber(): string {
    return this.phoneService.getFullPhoneNumber(
      this.selectedCountry,
      this.loginUser.phone
    );
  }
}
