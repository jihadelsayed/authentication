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
  passwordMismatch: boolean = false;

  passwordStrength = {
    percent: 0,
    label: '',
  };
  strengthClass: string = '';
  user: any = {
    first_name: '',
    username: '',
    email: '',
    phone: null,
    password1: '',
    password2: '',
    smsConsent: false//,
    //account_type: ''
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
  // Watch password changes
      setInterval(() => {
        if (this.user?.password1 != null) {
          this.evaluatePasswordStrength(this.user.password1);
        }
      }, 200);
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
    smsConsent: false  // ,
      // account_type: ''
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
      if (this.step === 1 && !this.useEmail) {
        this.sendVerificationCode(); // Trigger phone verification
      } else {
        this.step++;
      }
  
      this.stepLoading = false;
    }, 400);
  }
  
  
  prevStepWithSpinner() {
    this.stepLoading = true;
    setTimeout(() => {
      this.step--;
      this.stepLoading = false;
    }, 400);
  }
  
  OnSubmit(form: NgForm) {
    this.passwordMismatch = this.user.password1 !== this.user.password2;

    if (this.passwordMismatch) {
      return;
    }
    if (this.passwordStrength.percent < 50) {
      console.error('Password too weak.');
      this.passwordStrength.label = 'Password too weak (must be at least Moderate)';
      this.strengthClass = 'weak';
      return;
    }
    // if (!this.user.smsConsent || !this.user.account_type) {
    //   console.error('Missing required fields.');
    //   return;
    // }
  
    this.loading = true;

 
    if (!this.user.smsConsent ) {
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

  phoneVerificationCode: string = '';
phoneVerificationError: string = '';
generatedCode: string = '';

sendVerificationCode() {
  this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString(); // simple 6-digit code

  const fullPhone = this.getFullPhoneNumber();

  // Replace with real SMS API call
  console.log(`Send SMS to ${fullPhone}: Your Neetechs code is ${this.generatedCode}`);

  this.step = 1.5; // move to verification step

//   POST /api/send-verification/
// {
//   phone: "+11234567890"
// }

}

verifyCode() {
  if (this.phoneVerificationCode === this.generatedCode) {
    this.step = 2;
    this.phoneVerificationError = '';
  } else {
    this.phoneVerificationError = 'Invalid verification code. Please try again.';
  }
}
evaluatePasswordStrength(password: string) {
  if (!password) {
    this.passwordStrength = { percent: 0, label: '' };
    this.strengthClass = '';
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = [
    { percent: 25, label: 'Weak', class: 'weak' },
    { percent: 50, label: 'Moderate', class: 'moderate' },
    { percent: 75, label: 'Strong', class: 'strong' },
    { percent: 100, label: 'Very Strong', class: 'very-strong' },
  ];

  const result = strengthMap[score - 1] || strengthMap[0];
  this.passwordStrength = { percent: result.percent, label: result.label };
  this.strengthClass = result.class;
}

}
