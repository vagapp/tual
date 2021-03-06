import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import {  UserDataProvider } from '../../providers/user-data/user-data';
import { DrupalUserManagerProvider } from '../../providers/drupal-user-manager/drupal-user-manager';
import { LoaderProvider } from '../../providers/loader/loader';
import { AlertProvider } from '../../providers/alert/alert';
import { SubusersDataProvider } from '../../providers/subusers-data/subusers-data';
import { SubusersManagerProvider } from '../../providers/subusers-manager/subusers-manager';
import { PermissionsProvider } from '../../providers/permissions/permissions';
import { SubscriptionDataProvider } from '../../providers/subscription-data/subscription-data';
import { WsMessengerProvider } from '../../providers/ws-messenger/ws-messenger';


/**
 * Generated class for the UsuariosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-usuarios',
  templateUrl: 'usuarios.html',
})
export class UsuariosPage {
  //usersd:userd[];
  get subusersLimit():number{
   return this.subsData.getSubAccountsTotal();
  }
  get subUsersLeft(){
    return this.subsData.getSubAccountsLeft();
  }

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public modalCtrl: ModalController, 
    public userData:UserDataProvider,
    public viewCtrl: ViewController,
    public userMan: DrupalUserManagerProvider,
    public loader: LoaderProvider,
    public alert: AlertProvider,
    public subsData: SubscriptionDataProvider,
    public subuserData: SubusersDataProvider,
    public subusersManager: SubusersManagerProvider,
    public permissions: PermissionsProvider,
    public WS:WsMessengerProvider
  ) {
    //this.usersd = new Array();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UsuariosPage');
    console.log('getting subusers limit',this.subsData.getSubAccountsLeft());
    this.cargarUsuarios();
  }

  /*
    cargar usuarios carga los usuarios de la subscripcion y los usuarios que tienes agregados.
  **/
 async cargarUsuarios(){
 this.loader.presentLoader('Cargando Usuarios ...');
 await this.subusersManager.cargarSubusuarios();
 //await this.subusersManager.cargarSubusuariosSubs();
 console.log('subscription subusers loaded end',this.subuserData.subscriptionSubUsers);
 this.loader.dismissLoader();
  /*this.usersd = new Array();
  let doctors_array =  new Array();
  doctors_array.push(this.userData.userData.uid);
  let ids = null;
  //if(this.userData.checkUserPlanHolder() && this.userData.subscription.field_subusuarios){
    //si es planholder no busca sus usuarios si no todos los usuarios de esta subscripcion
    //ids = this.userData.subscription.field_subusuarios;
    //Debugger.log(['subusers ids to load',ids]);
    //doctors_array = null;
  //}
  this.userMan.requestUsers(doctors_array, null, ids).subscribe(
    (val)=>{ 
      let aux_results = Object.keys(val).map(function (key) { return val[key]; });
      aux_results.forEach((element) => {
        Debugger.log(['received userd',element]);
        let aux_user = this.userData.getEmptyUserd();
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
          console.log("entrodeucing",element);
          aux_user.field_doctores.und.push(element.uid);
        });
        console.log(element.field_tipo_de_usuario);
        aux_user.field_tipo_de_usuario.und = new Array();
        let aux_tipos = Object.keys(element.field_tipo_de_usuario).map(function (key) { return element.field_tipo_de_usuario[key]; });
        aux_tipos.forEach(function(element){
          aux_user.field_tipo_de_usuario.und.push(element);
        });
        console.log( aux_user.field_tipo_de_usuario);
        this.usersd.push(aux_user);
     });
     console.log(this.usersd);
     loading.dismiss();
    },
     response => {
       console.log("POST call in error", response);
       loading.dismiss();
     }
    );*/
}

  openNuevousuario(){
    console.log('subs restantes',this.subsData.getSubAccountsLeft());
    if(this.subsData.getSubAccountsLeft() > 0  ){ 
    let Modal = this.modalCtrl.create("NuevousuarioModalPage", undefined, { cssClass: "smallModal nuevousuarioModal" });
    Modal.onDidDismiss(data => {
      if(data !== null){
        if(data.changed === true){
          this.cargarUsuarios();
        }
      }
    });
    Modal.present({});
  }else{
  
    this.alert.setStrings('IR A MI PLAN','después');
    this.alert.chooseAlert(
    '',
    'Ya agotaste los usuarios incluidos en tu suscripción mensual, agrega todos los usuarios adicionales que necesites ingresando aquí mi plan',
    ()=>{ this.alert.resetStrings(); this.navCtrl.setRoot("MiplanPage"); },
    ()=>{ this.alert.resetStrings(); }
    )
  }
  }

  editUsuario( userd ){
    let Modal = this.modalCtrl.create("NuevousuarioModalPage", { 'userd': userd }, { cssClass: "smallModal nuevousuarioModal" });
    Modal.present({});
  }

  
  deleteUsuario( userd , fromSub:boolean = false){
    this.alert.chooseAlert(
      '',
      '¿Está seguro de que desea eliminar este usuario de la subscripción?',
      ()=>{ /*this.removeSubUserFromSubs(userd);*/this.completeSubUserRemove( userd );  },
      ()=>{}
    );
  }

  removeUsuariopop( userd , fromSub:boolean = false){
    this.alert.chooseAlert(
      '',
      '¿Está seguro de que desea remover? El usuario no se borrará, sólo dejará de administrar sus citas',
      ()=>{  /*this.removeUsuario( userd );*/ /*this.removeSubUserFromSubs(userd);*/ this.completeSubUserRemove( userd ); },
      ()=>{}
    );
  }

  agregarusuariopop( userd ){
  
    this.alert.chooseAlert(
      '',
      '¿Está seguro de que desea asignarse a este usuario? El usuario administrara sus citas',
      ()=>{  this.addUsuario( userd ); },
      ()=>{}
    );
    
  }


  async removeUsuario( userd ){
    this.loader.presentLoader("removiendo usuario . . .");
    await this.subusersManager.removeSubuser(userd);
    await this.subusersManager.cargarSubusuarios();
   
    this.loader.dismissLoader(); 
  }

  async addUsuario( userd ){
    this.loader.presentLoader('Agregando usuario ...');
    await this.subusersManager.addSubuser(userd);
    await this.subusersManager.cargarSubusuarios();
    this.loader.dismissLoader();
   
  }




  async removeSubUserFromSubs( userd ){
    this.loader.presentLoader('Eliminando usuario ...');
    //await this.subusersManager.removeSubuser(userd);
    await this.subusersManager.removeUserFromSubscription(userd);
    await this.subusersManager.cargarSubusuarios();
  
    this.loader.dismissLoader();
    /*let loader = this.loadingCtrl.create({
      content: "removiendo usuario . . ."
    });
    loader.present();
    if(this.userData.checkUserPlanHolder()){
      this.userData.subscription.removeSubUserFromSubs(userd);
      this.userData.updateSus(this.userData.subscription).subscribe(
        (val)=>{
          loader.dismiss();
          this.cargarUsuarios();
        }
      );
    }*/
  }

  async completeSubUserAdd( ){
    
  }

  async completeSubUserRemove( userd ){ //ya hice este metodo despues de tantos cambios maldicion
   
    this.loader.presentLoader('Removiendo usuario ...');
    //await this.subusersManager.removeSubuser(userd);
    await this.subusersManager.removeUserFromSubscription( userd );
   
    await this.subusersManager.removeSubuser(userd);
   
    await this.subusersManager.cargarSubusuarios();
   
    this.WS.generateSuboutofgroup(this.subsData.subscription.field_doctores.concat(userd.uid),userd.uid);
      
    this.loader.dismissLoader();
  }


  





  

}
