import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ViewController, AlertController } from 'ionic-angular';
import { userd, UserDataProvider } from '../../providers/user-data/user-data';
import { Debugger } from '../../providers/user-data/debugger';
import { DrupalUserManagerProvider } from '../../providers/drupal-user-manager/drupal-user-manager';
import { SubusersManagerProvider } from '../../providers/subusers-manager/subusers-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { AlertProvider } from '../../providers/alert/alert';
import { SubscriptionDataProvider } from '../../providers/subscription-data/subscription-data';
import { SubscriptionManagerProvider } from '../../providers/subscription-manager/subscription-manager';
import { TutorialProvider } from '../../providers/tutorial/tutorial';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { WebsocketServiceProvider } from '../../providers/websocket-service/websocket-service';
import { WsMessengerProvider } from '../../providers/ws-messenger/ws-messenger';

/**
 * Generated class for the NuevousuarioModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nuevousuario-modal',
  templateUrl: 'nuevousuario-modal.html',
})
export class NuevousuarioModalPage {
  initialpage = true;
  newuser = false;
  newUser:userd;
  isnew:boolean;
  checkpass:string;
  newUserCode:string;
  codeuser=false;
  codeuserNP=false; //if tutorial user is gotten by code this disables password show

  selectedUsersOptions: number = 0;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public userData: UserDataProvider,
    public subsData: SubscriptionDataProvider,
    public subsManager: SubscriptionManagerProvider,
    public viewCtrl: ViewController,
    public userMan: DrupalUserManagerProvider,
    public subusersManager: SubusersManagerProvider,
    public loader: LoaderProvider,
    public alert: AlertProvider,
    public tutorial: TutorialProvider,
    public wsMessenger: WsMessengerProvider

  ) {
    console.log('GETTING userd', navParams.get('userd'));
    let aux_node = navParams.get('userd');
    if(aux_node){
      this.isnew = false;
      this.newUser = SubusersManagerProvider.getEmptyUserd();
      this.newUser = aux_node;
      this.initialpage = false;
      this.newuser = true;
    }else{
      this.isnew = true;
      this.resetNewUser();
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  resetNewUser(){
    this.newUser = SubusersManagerProvider.getEmptyUserd();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NuevousuarioModalPage');
  }

  selectOption( selected:number ){
    this.selectedUsersOptions = Number(selected);
  }

  checkSelectedOption(selected:number ){
    return Number(this.selectedUsersOptions) === Number(selected);
  }

  isSelectedOption(){
    return this.selectedUsersOptions !== 0;
  }

  userTutorialStart(){
    console.log('start tutorial');
    this.newuser=true; 
    this.initialpage=false;
    this.tutorial.tutorial_users_selected_option = this.selectedUsersOptions;
    if(this.tutorial.tutorial_users_selected_option === TutorialProvider.TUTORIAL_USER_BOTH){
      this.newUser.field_tipo_de_usuario.und = [3];
      this.tutorial.tutorial_user_created_step = TutorialProvider.TUTORIAL_USER_STEP_CAJA;
    }else{
      this.newUser.field_tipo_de_usuario.und = [4];
    }
  }

  nextUser(){ //despues de crear caja se crea recepcion, se reinician las variables para manipular el template.
    this.newuser = true;
    this.initialpage=false;
    this.tutorial.usuarioCreated = false;
    this.tutorial.tutorial_user_created_step = TutorialProvider.TUTORIAL_USER_STEP_RECEPCION;
    this.restart();
    this.newUser.field_tipo_de_usuario.und = [2];
 
  }

  endUsers(){
    this.tutorial.usuarioCreated = true;
    this.dismiss();
  }


  





  createUserd(){
   if(this.createUserValidation()){
    this.loader.presentLoader('Generando Usuario ... ');
    //agregar este doctor.
    this.newUser.field_doctores.und = new Array(); 
    this.newUser.field_doctores.und[this.userData.userData.uid] = this.userData.userData.uid;
    //crear codigo, verificar que sea unique = S
    this.newUser.field_codigo.und[0].value = "add"+this.userData.userData.uid;
    this.newUser.field_nombre.und[0].value = "Subusuario";
    this.newUser.field_apellidos.und[0].value = "Subusuario";
    this.newUser.status = ""+1;
    delete this.newUser.field_sub_id;
    this.userMan.generateNewUserd( this.newUser ).subscribe(
    async (val)=>{
      console.log('generated user now what',val);
      console.log('subsisgrouo',this.subsData.isGroup);
      if(!this.subsData.subscription.field_subusuarios) this.subsData.subscription.field_subusuarios = new Array();
      this.subsData.subscription.field_subusuarios.push(val['uid']);
      let obs = this.subsManager.updateUserSuscription().subscribe( (val)=>{console.log('updating subs',val);});
      console.log(obs);
      //await obs.toPromise();
      if(this.subsData.isGroup) this.wsMessenger.generateSubUserAddedMessage( val['uid'], this.newUser.field_nombre.und[0].value, this.subsData.subscription.field_doctores);
      else await this.subusersManager.cargarSubusuarios();
      this.loader.dismissLoader();
      if(this.tutorial.checkTutorialState())
      {
        this.tutorial.usuarioCreated = true;
        this.newuser=false;
      }else{
        this.close();
      }
    },
    response => {
        for (var key in response.error.form_errors) {
          this.alert.presentAlert(key, response.error.form_errors[key]);
        }
        this.loader.dismissLoader();
      }
  );
}
}

restart(){
  this.resetNewUser();
  this.checkpass = "";
  this.tutorial.usuarioCreated = false;
}

createUserValidation():boolean{
  let ret = true;
  if( !this.userData.checkUserPlanHolder() ){
    this.alert.presentAlert('Error','Solo el administrador de plan puede crear subcuentas');
    ret = false;
  }
  if( this.userData.checkSusSubaccountsFull() ){
    this.alert.presentAlert('Error','Se llego al limite de subcuentas');
    ret = false;
  }
  if(!(this.newUser.pass.localeCompare(this.checkpass) === 0)){
    this.alert.presentAlert("Error", "las contraseñas no coinciden");
    ret = false;
  }
  if(!(this.newUser.mail.localeCompare(this.newUser.field_useremail.und[0].email) === 0)){
    this.alert.presentAlert("Error", "Los correos no coinciden");
    ret = false;
  }
  if(this.newUser.field_tipo_de_usuario.und[0] === 0 ){
    this.alert.presentAlert("Error", "Selecciona un tipo de usuario");
    ret = false;
  }
  return ret;
}

async getUserByCode(){
  if(this.getUserCodeValidation()){
  this.loader.presentLoader('Buscando usuario ...');
  let res = await this.userMan.requestUsers(new Array(),this.newUserCode).toPromise();
  if(res && res.length > 0){
    console.log('user found',res[0]);
    await this.addUserFromCode(res[0]);
    await this.subusersManager.cargarSubusuarios();
    this.loader.dismissLoader();
    if(this.tutorial.checkTutorialState())
    {
      this.newUser = res[0];
      this.codeuserNP=true;
      this.tutorial.usuarioCreated = true;
    }else{
      this.alert.presentAlert("Hecho",`Se le ha asignado el usuario ${res[0]['name']}`);
      this.close();
    }
  }else{
    this.alert.presentAlert("Nada", "No se encontró ningún usuario usando este código");
    this.loader.dismissLoader();
  }




 

/*
  this.userMan.requestUsers(new Array(),this.newUserCode).subscribe(
    (val)=>{ 
      console.log(val);
     
      let aux_results = Object.keys(val).map(function (key) { return val[key]; });
      if(aux_results.length == 0){
        dis.presentAlert("Nada", "No se encontró ningún usuario usando este código");
        loader.dismiss();
        return false;
      } 
      aux_results.forEach(function(element) {
        let aux_user = dis.userData.getEmptyUserd();
        aux_user.uid = element.uid;
        aux_user.name = element.name;
        aux_user.field_alias.und[0].value = element.field_alias;
        aux_user.field_nombre.und[0].value = element.field_nombre;
        aux_user.field_apellidos.und[0].value = element.field_apellidos;
        aux_user.field_useremail.und[0].email = element.field_useremail.email;
        aux_user.mail = element.mail;
        aux_user.status = "1";
        aux_user.field_doctores.und = new Array();
        let aux_docs = Object.keys(element.field_doctores).map(function (key) { return element.field_doctores[key]; });
        aux_docs.forEach(function(element){
          aux_user.field_doctores.und.push(element.uid);
        });
        aux_user.field_tipo_de_usuario.und = new Array();
        let aux_tipos = Object.keys(element.field_tipo_de_usuario).map(function (key) { return element.field_tipo_de_usuario[key]; });
        aux_tipos.forEach(function(element){
          aux_user.field_tipo_de_usuario.und.push(element);
        });
        //agregar doctor
        aux_user.field_doctores.und.push(dis.userData.userData.uid);
       //guardar usuario
       console.log("guardando usuario",aux_user);
       //agregando doctor al usuario
          dis.userMan.updateUserd( aux_user).subscribe(
            (val)=>{
              console.log("usuarioUpdated");
              dis.presentToast("Usuario Agregado");
              loader.dismiss();
              dis.close();
            },
            response => {
              console.log("POST call in error", response);
              console.log("show error");
              for (var key in response.error.form_errors) {
                dis.presentAlert(key, response.error.form_errors[key]);
              }
              loader.dismiss();
            }
          );

     });
    },
     response => {
       console.log("POST call in error", response);
     }
    );*/
  }
}

gobackuser(){
  console.log('gobackuser',this.isnew);
  if(this.isnew){
    this.newuser=false; this.codeuser=false; this.initialpage=true;
  }else{
    console.log('okei no es new');
    this.dismiss();
  }
}

getUserCodeValidation():boolean{
  let ret = true;
  if((!this.newUserCode) || (this.newUserCode === "all") ){
    ret = false;
  }
  return ret;
}

async addUserFromCode( user_data ){
  let aux_user = SubusersManagerProvider.getEmptyUserd();
        aux_user.uid = user_data.uid;
        aux_user.name = user_data.name;
        aux_user.field_alias.und[0].value = user_data.field_alias;
        aux_user.field_nombre.und[0].value = user_data.field_nombre;
        aux_user.field_apellidos.und[0].value = user_data.field_apellidos;
        aux_user.field_useremail.und[0].email = user_data.field_useremail.email;
        aux_user.mail = user_data.mail;
        aux_user.status = "1";
        aux_user.field_doctores.und = new Array();
        aux_user.field_tipo_de_usuario.und = new Array();
        for(let element of user_data.field_doctores){ aux_user.field_doctores.und.push(element.uid); }
        delete aux_user.field_tipo_de_usuario;
        delete aux_user.field_sub_id;
        //for(let element of user_data.field_tipo_de_usuario){ aux_user.field_tipo_de_usuario.und.push(element.uid); }for(let element of user_data.field_tipo_de_usuario){ aux_user.field_tipo_de_usuario.und.push(element.uid); }
        aux_user.field_doctores.und.push(Number(this.userData.userData.uid));
        console.log('user2save',aux_user);
        console.log('user2save fdocs',aux_user.field_doctores.und);
        //let res = await this.userMan.updateUserd(aux_user).toPromise(); 
        this.userMan.updateUserd( aux_user).subscribe(
          (val)=>{
            console.log("usuarioUpdated");
            if(!this.subsData.subscription.field_subusuarios) this.subsData.subscription.field_subusuarios = new Array();
            this.subsData.subscription.field_subusuarios.push(val['uid']);
            let obs = this.subsManager.updateUserSuscription().subscribe( (val)=>{console.log('updating subs',val);});
          },
          response => {
            console.log("POST call in error", response);
           
          }
        );
          /*this.userMan.updateUserd( aux_user).subscribe(
            (val)=>{
              console.log("usuarioUpdated");
              this.presentToast("Usuario Agregado");
              loader.dismiss();
              dis.close();
            },
            response => {
              console.log("POST call in error", response);
              console.log("show error");
              for (var key in response.error.form_errors) {
                dis.presentAlert(key, response.error.form_errors[key]);
              }
              loader.dismiss();
            }
          );*/
}

/*
updating user with this {"uid":"155","name":"cinthyaR","pass":"","mail":"adsd@www.com","status":"1","roles":[0],"field_tipo_de_usuario":{"und":["2"]},"field_useremail":{"und":[{"email":"adsd@www.com"}]},"field_nombre":{"und":[{"value":"Subusuario"}]},"field_apellidos":{"und":[{"value":"Subusuario"}]},"field_especialidad":{"und":[{"value":""}]},"field_alias":{"und":[{"value":null}]},"field_calle":{"und":[{"value":""}]},"field_no_ext":{"und":[{"value":""}]},"field_no_int":{"und":[{"value":""}]},"field_codigo_postal":{"und":[{"value":""}]},"field_ciudad":{"und":[{"value":""}]},"field_colonia":{"und":[{"value":""}]},"field_pais":{"und":[{"value":""}]},"field_municipio":{"und":[{"value":""}]},"field_estado_ubicacion":{"und":[{"value":""}]},"field_plan_date":{"und":[{"value":{"date":""}}]},"field_forma_pago":{"und":[{"value":""}]},"tutorial_state":{"und":[{"value":0}]},"field_codigo":"kQUiKJ1sXviGYzRi8oNxHp94o","field_doctores":{"und":["150","76"]},"field_planholder":{"und":[{"value":true}]},"field_stripe_customer_id":{"und":[{"value":""}]},"field_src_json_info":{"und":[{"value":""}]}}*/

updateUserd(){
  if(this.updateUserValidation()){
  this.loader.presentLoader('Guardando usuario ...');
  this.newUser.mail = this.newUser.field_useremail.und[0].email;
  this.newUser.status = ""+1;
  delete this.newUser.field_sub_id;
  //this.newUser.field_doctores = {'und':[76]};
  console.log('doctores',this.newUser.field_doctores);
  
  console.log('guardando usuario', this.newUser);
  this.userMan.updateUserd( this.newUser ).subscribe(
    async (val)=>{
      await this.subusersManager.cargarSubusuarios();
      this.loader.dismissLoader();
      this.close();
    },
    response => {
      for (var key in response.error.form_errors) {
        this.alert.presentAlert(key, response.error.form_errors[key]);
      }
      this.loader.dismissLoader();
    }
  );
}
}

updateUserValidation():boolean{
  let ret = true;
  if(this.newUser.pass || this.checkpass){
    if(!(this.newUser.pass === this.checkpass)){
      this.alert.presentAlert("Error", "las contraseñas no coinciden");
      ret = false;
    }
    
  }
  /*if(this.newUser.field_tipo_de_usuario.und[0] === 0 ){
    this.alert.presentAlert("Error", "Selecciona un tipo de usuario");
    ret = false;
  }*/
  return ret;
}

/*presentToast(msg) {
  let toast = this.toastCtrl.create({
    message: msg,
    duration: 6000,
    position: 'top'
  });
  toast.present();
}*/

close( iscreated:boolean = false){
  this.viewCtrl.dismiss();
}



/*presentAlert(key,Msg) {
  let alert = this.alertCtrl.create({
    title: key,
    subTitle: Msg,
    buttons: ['Dismiss']
  });
  alert.present();
}*/


randomCode(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

}
