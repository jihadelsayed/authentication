# Angular authentication and authorization component:
## Files
* sign in component
* sign up component
* Services

## Configration:
1. add UserService to providers and add FormsMoudle to imports in the app.moudle.ts file.
```
import { FormsModule }   from '@angular/forms'; //<----------make sure you have added this.
import { UserService } from './authentication/services/user.service'; //<----------make sure you have 
import { HttpClientModule } from '@angular/common/http'; //<----------make sure you have 



@NgModule({
  imports: [
             BrowserModule,
             FormsModule      //<----------make sure you have added this.
           ],
    providers: [
      UserService,NotAuthGuard,AuthGuard, //<----------make sure you have added this.
      HttpClientModule, //<----------make sure you have added this.
    ], 

})
```
2. install toastr to have some animation in your authentications page:
 ``` npm i ngx-toastr --save ```

3. add server url to environment.ts
```
export const environment = {
  production: false,
  SERVER_URL: "https://my_backend_webstie_url.com/", //<----------make sure you have added this.
};
```
4. add the component to app-routing.module.ts
```
import { NotAuthGuard } from './authentication/services/not-auth.guard';
import { AuthGuard } from './authentication/services/auth.guard';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';

const routes: Routes = [
  // authentication component
  { path:'signUp',component: SignUpComponent,canActivate:[NotAuthGuard] },
  { path:'signIn',component: SignInComponent,canActivate:[NotAuthGuard] },

  // switch from NotAuthGuard to AuthGuard to make the user login before accessing the page
  //  { path:'home',component: AppComponent,canActivate:[AuthGuard] },

];
```

5. now you can accesses the signup and signin by adding /sinup and /signin to the url
