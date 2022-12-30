import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sign-out',
  templateUrl: './sign-out.component.html',
  styleUrls: ['./sign-out.component.scss']
})
export class SignOutComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    localStorage.removeItem('userToken');
    //this.router.navigate(['/login']);
    location.reload();
  }

}
