import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators, FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';


import { environment } from '../../../../../environments/environment';
import { LoginService } from '../../../core';
import {
  trigger,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'foodfly-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  animations: [
    trigger('accordion', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({ height: 0 }),
        animate(500, style({ height: '*' }))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({ height: 0 }))
      ])
    ])
  ]
})

export class CheckoutComponent implements OnInit {
  apiUrl = `${environment.apiUrl}`;
  userData;
  checkoutForm: FormGroup;

  cart;
  searchInfo;

  userAddress1;
  userAddress2;
  userCellphone;


  constructor(
    private http: HttpClient, private route: ActivatedRoute, private router: Router,
    private loginService: LoginService, private fb: FormBuilder) {
    // user
   }

  ngOnInit() {
    this.createForm();
    console.log(this.checkoutForm);

    this.cart = JSON.parse(sessionStorage.getItem('sessionStorage-cart'));
    this.searchInfo = JSON.parse(sessionStorage.getItem('sessionStorage-searchInfo'));
    this.userAddress1 = this.searchInfo.address;

    // 카트 세션 { restaurantName: "퀴즈노스 강남구청역점", restaurantPk: 20970, menus: Array(1), account: 9900 }
    console.log('카트 세션', this.cart);
    // 위치 인포 세션 { address: "서울특별시 강남구 논현로123길 35-1", lat: 37.5108295, lag: 127.02928809999999 }
    console.log('위치 인포 세션', this.searchInfo);

    const headers = new HttpHeaders()
      .set('Authorization', `Token ${this.loginService.getToken()}`);

    // this.http.get(`${this.apiUrl}/restaurants/${pk}`)
    //   .subscribe(data => {

    this.http.get(`${this.apiUrl}/members/profile/`, { headers })
      .subscribe(data => {
        console.log('[user]', data);
        this.userData = data;
        this.userCellphone = this.userData.phoneNumber.split('-').join('');
        console.log('phone number:', this.userCellphone);
        this.createForm();
      });
  }

  createForm() {
    this.checkoutForm = this.fb.group({
      address1: [{ value: this.userAddress1, disabled: true }, Validators.required],
      address2: ['', Validators.required],
      // cellphone: ['', [Validators.required, Validators.pattern('[0-9]{1,20}')]],
      cellphone: [this.userCellphone, [Validators.required, Validators.pattern('[0-9]{11}')]],
      orderRequest: [''],
      agree2: [false, Validators.requiredTrue],
      agree3: [false, Validators.requiredTrue],
      agree4: [false, Validators.requiredTrue],
      agree1: [false, Validators.requiredTrue],
    payment: ['card'],
    });
  }

  get address1() {
    return this.checkoutForm.get('address1');
  }
  get address2() {
    return this.checkoutForm.get('address2');
  }

  get cellphone() {
    return this.checkoutForm.get('cellphone');
  }

  get orderRequest() {
    return this.checkoutForm.get('orderRequest');
  }

  get agree1() {
    return this.checkoutForm.get('agree1');
  }
  get agree2() {
    return this.checkoutForm.get('agree2');
  }
  get agree3() {
    return this.checkoutForm.get('agree3');
  }
  get agree4() {
    return this.checkoutForm.get('agree4');
  }

  get payment() {
    return this.checkoutForm.get('payment');
  }

  onSubmit() {
    console.log(this.checkoutForm);
    // this.checkoutForm.reset();
    if (this.checkoutForm.status === 'VALID') {
      this.makePostToSassion();
      this.router.navigate([`restaurant/paymentcompleted`]);
    }
  }

  makePostToSassion() {
    const menus = this.cart.menus.map((item) => {
      return { menu: item.pk, quantity: item.amount };
    });

    let cellphone = this.checkoutForm.value.cellphone;
    cellphone = `+82 ${cellphone.slice(0, 3)}-${cellphone.slice(3, 7)}-${cellphone.slice(7)}`;

    const postData = {
      restaurant: this.cart.restaurantPk,
      menus: menus,
      address1: this.checkoutForm.value.address1,
      address2: this.checkoutForm.value.address2,
      phoneNumber: cellphone
    };
    sessionStorage.setItem('sessionStorage-orderPost', JSON.stringify(postData));
  }
}
