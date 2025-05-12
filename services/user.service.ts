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
    name: user.name || user.name,
    password: user.password1,
  };

  if (user.email) {
    body.email = user.email;
  }

  if (user.phone) {
    body.phone = user.phone;
  }
  console.log(body)
  return this.http.post(this.config.serverUrl + "auth/register/", body);
}
userAuthentication(payload: { identifier: string; password: string }) {
    return this.http.post(this.config.serverUrl + "auth/login/", payload);
  }
 

  //getUserClaims(){
  //return this.http.get(environment.SERVER_URL+'auth/login/',{ headers: new HttpHeaders({'Authorization': 'Token ' + localStorage.getItem('userToken')})});
  // }
}
