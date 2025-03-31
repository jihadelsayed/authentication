import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { RuntimeConfigService } from "../../services/runtime-config.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  User: any;
  constructor(private http: HttpClient, private config: RuntimeConfigService) {}

  registerUser(user: any) {
    const body: any = {
      username: user.username,
      first_name: user.first_name,
      email: user.email,
      password1: user.password1,
      password2: user.password2,
    };
    return this.http.post(this.config.serverUrl + "auth/register/", body);
  }

  userAuthentication(email: string, password: string) {
    const body = {
      username: " ",
      email: email,
      password: password,
    };
    return this.http.post(this.config.serverUrl + "auth/login/", body);
  }
 

  //getUserClaims(){
  //return this.http.get(environment.SERVER_URL+'auth/login/',{ headers: new HttpHeaders({'Authorization': 'Token ' + localStorage.getItem('userToken')})});
  // }
}
