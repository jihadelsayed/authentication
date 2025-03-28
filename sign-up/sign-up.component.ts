import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, NgForm } from '@angular/forms';
import {FormControl, Validators} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
//import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    
    RouterModule, // Required for ActivatedRoute, Router
  ],

})
export class SignUpComponent implements OnInit {

  serviceForm = new FormGroup({
    boleanControl : new FormControl('', Validators.required),
    //nameControl : new FormControl('', Validators.required),
    //emailControl : new FormControl('', Validators.required),
    //passwordControl : new FormControl('', Validators.required),
  });

  hide = true;
  user : any | undefined;

  email = new FormControl('', [Validators.required, Validators.email]);

    getErrorMessage() {
      if (this.email.hasError('required')) {
        return 'E-post är obligatioriskt';
      }

      return this.email.hasError('email') ? 'Not a valid email' : '';
    }
  constructor(private userService: UserService, //private toaster : ToastrService,
  private router : Router
    //,private _snackBar: MatSnackBar
    ) { }

    host: string | null = null;
    port: string | null = null;
    pathname: string | null = null;
    language: string | null = null;
    
    ngOnInit(): void {
      this.resetForm();
    
      this.route.queryParams.subscribe((params: any) => {
        this.host = params['host'] ?? null;
        this.port = params['port'] ?? '443';
        this.pathname = params['pathname'] ?? '';
        this.language = params['language'] ?? 'en';
      });
    
    this.resetForm();
  }
  resetForm(form? : NgForm)
   {
     if(form!=null)
      form.reset();
      this.user = {
        first_name:"",
        username: "",
        email: "",
        password1: "",
        password2: "",

     }
   }

   OnSubmit(form : NgForm){
    
      this.userService.registerUser(form.value).subscribe((data:any) =>{
        if (data.Succeeded = true)
        {
          // this._snackBar.open(
          //   "User registeration successful"
          // , "Ok",
          // {
          //   duration: 5000,
          //   verticalPosition: 'bottom',
          //   panelClass: 'warning',
          // });

          // console.log(data)
          // this.resetForm(form);
          // // this.toaster.success('User registeration successful')

          // localStorage.setItem('UserInfo', JSON.stringify(data.user));
          // localStorage.setItem('userToken',data.token);
          // this.router.navigate(['complete']).then(() => {
          //   location.reload();
          //   //window.location.reload();
          // });

          // this.router.navigate(['/complete']);
          localStorage.setItem('UserInfo', JSON.stringify(data.user));
          localStorage.setItem('userToken', data.token);
  
          const redirectHost = this.host ?? 'neetechs.com';
          const redirectPort = this.port ?? '443';
          const redirectLang = (this.language ?? 'en').slice(0, 2);
          const redirectPath = this.pathname ?? '';
  
          const finalRedirect = `https://${redirectHost}:${redirectPort}/#/${redirectLang}/${redirectPath}`;
  
          window.location.href = finalRedirect;
        }
        else
        {
          // this._snackBar.open(
          //   data.error[0]
          // , "Ok",
          // {

          //   duration: 5000,
          //   verticalPosition: 'bottom',
          //   panelClass: 'warning',
          // });
          // this.toaster.error()
        }
        },error => {
          let msg:any = "unknown error"
          if(error.status===400){
            if(error.error['email']){
              msg = error.error['email']
            }
            if(error.error['first_name']){
              msg = error.error['first_name']
            }
            if(error.error['password1']){
              msg = error.error['password1']
            }
            if(error.error['password2']){
              msg = error.error['password2']
            }
            if(error.error['non_field_errors']){
              msg = error.error['non_field_errors']
            }
        }else{
          msg = error.message
        }
        // this._snackBar.open(
        //   msg
        // , "Ok",
        // {
        //   duration: 5000,
        //   verticalPosition: 'bottom',
        //   panelClass: 'warning',
        // });
      }
    );
  }
}
