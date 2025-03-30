import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class SignUpComponent implements OnInit {
  countries = [
    { code: 'US', dialCode: '1', flag: '🇺🇸' },
    { code: 'AE', dialCode: '971', flag: '🇦🇪' },
    { code: 'SY', dialCode: '963', flag: '🇸🇾' },
    { code: 'GB', dialCode: '44', flag: '🇬🇧' },
    // ... add more if needed
  ];
  selectedCountry: string = 'US';

  
  user: any = {
    first_name: '',
    username: '',
    email: '',
    phone: null,
    password1: '',
    password2: '',
    smsConsent: false,
    account_type: ''
  };
  phoneTouched: boolean = false;

  host: string | null = null;
  port: string | null = null;
  pathname: string | null = null;
  language: string | null = null;
  showReferral: boolean = false;
  useEmail: boolean = false;
  showPassword: boolean = false;
  loading: boolean = false;
  
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.resetForm();

    this.route.queryParams.subscribe((params: any) => {
      this.host = params['host'] ?? null;
      this.port = params['port'] ?? '443';
      this.pathname = params['pathname'] ?? '';
      this.language = params['language'] ?? 'en';
    });
  }

  resetForm(form?: NgForm) {
    if (form) form.reset();
  
    this.user = {
      first_name: '',
      username: '',
      email: '',
      phone: '',
      password1: '',
      password2: '',
      smsConsent: false,
      account_type: ''
    };
  
    this.useEmail = false;
    this.showPassword = false;
    this.loading = false;
  }
  step: number = 1;

  nextStep() {
    if (this.step < 3) this.step++;
  }

  prevStep() {
    if (this.step > 1) this.step--;
  }

  stepLoading: boolean = false;

  nextStepWithSpinner() {
    this.stepLoading = true;
    setTimeout(() => {
      this.step++;
      this.stepLoading = false;
    }, 400); // 400ms fake delay for spinner
  }
  
  prevStepWithSpinner() {
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }
  
  OnSubmit(form: NgForm) {
    if (this.user.password1 !== this.user.password2) {
      // Show a toast or inline error if needed
      console.error('Passwords do not match.');
      return;
    }
  
    if (!this.user.smsConsent || !this.user.account_type) {
      console.error('Missing required fields.');
      return;
    }
  
    this.loading = true;
  
    this.userService.registerUser(form.value).subscribe(
      (data: any) => {
        this.loading = false;
  
        if (data.Succeeded === true) {
          localStorage.setItem('UserInfo', JSON.stringify(data.user));
          localStorage.setItem('userToken', data.token);
  
          const redirectHost = this.host ?? 'neetechs.com';
          const redirectPort = this.port ?? '443';
          const redirectLang = (this.language ?? 'en').slice(0, 2);
          const redirectPath = this.pathname ?? '';
          const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;
  
          window.location.href = finalRedirect;
        } else {
          console.error('Registration failed:', data);
        }
      },
      (error) => {
        this.loading = false;
  
        let msg: any = 'Unknown error';
        if (error.status === 400) {
          if (error.error['email']) msg = error.error['email'];
          if (error.error['first_name']) msg = error.error['first_name'];
          if (error.error['password1']) msg = error.error['password1'];
          if (error.error['password2']) msg = error.error['password2'];
          if (error.error['non_field_errors']) msg = error.error['non_field_errors'];
        } else {
          msg = error.message;
        }
        console.error(msg);
      }
    );
  }
  isStep1Valid(): boolean {
    if (this.useEmail) {
      return !!this.user.email && this.isValidEmail(this.user.email);
    } else {
      return !!this.user.phone && this.isValidPhone(this.user.phone) && this.user.smsConsent;
    }
  }
  
  isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  // phone validation 
  isValidPhone(phone: string): boolean {
    try {
      const parsed = parsePhoneNumberFromString(phone, 'US');
      return parsed?.isValid() ?? false;
    } catch {
      return false;
    }
  }
  getFullPhoneNumber(): string {
    const country = this.countries.find(c => c.code === this.selectedCountry);
    if (!country || !this.user.phone) return '';
    return `+${country.dialCode}${this.user.phone.replace(/\D/g, '')}`;
  }
}
