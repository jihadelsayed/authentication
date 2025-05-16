import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-social-redirect',
  template: '<p>Redirecting...</p>',
})
export class SocialRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const user = JSON.parse(atob(params['user'] || 'e30='));

      if (token) {
        localStorage.setItem('userToken', token);
        localStorage.setItem('UserInfo', JSON.stringify(user));
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
