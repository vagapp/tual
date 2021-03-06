import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, LoadingController, ModalController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UserDataProvider } from '../providers/user-data/user-data';
import { CordovaAvailableProvider } from '../providers/cordova-available/cordova-available';
import { WebsocketServiceProvider } from '../providers/websocket-service/websocket-service';
import { CitasManagerProvider } from '../providers/citas-manager/citas-manager';
import { PlanesDataProvider } from '../providers/planes-data/planes-data';
import { OnesignalManagerProvider } from '../providers/onesignal-manager/onesignal-manager';
import { DoctoresManagerProvider } from '../providers/doctores-manager/doctores-manager';
import { WsMessengerProvider } from '../providers/ws-messenger/ws-messenger';
import { ServiciosManagerProvider } from '../providers/servicios-manager/servicios-manager';
import { SubscriptionManagerProvider } from '../providers/subscription-manager/subscription-manager';
import { PermissionsProvider } from '../providers/permissions/permissions';
import { TutorialProvider } from '../providers/tutorial/tutorial';
import { SubusersManagerProvider } from '../providers/subusers-manager/subusers-manager';
import { UpdaterProvider } from '../providers/updater/updater';
import { ReportPresentatorProvider } from '../providers/report-presentator/report-presentator';
import { LoaderProvider } from '../providers/loader/loader';
import { NetworkCheckerProvider } from '../providers/network-checker/network-checker';
import { StorageProvider } from '../providers/storage/storage';
import { Keyboard } from '@ionic-native/keyboard';
import { PwaProvider } from '../providers/pwa/pwa';





//import { Debugger } from '../providers/user-data/debugger';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = "LoginPage";
  Home: any = 'HomePage';
  token: string;
  startdate:number;
  loaddate:number;


  

  pages: Array<{title: string, component: any}>;

  constructor(
    public platform: Platform, 
    public statusBar: StatusBar, 
    public splashScreen: SplashScreen,
    public userData: UserDataProvider,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public ica: CordovaAvailableProvider,
    public wsp: WebsocketServiceProvider,
    public citasManager: CitasManagerProvider,
    public planes: PlanesDataProvider,
    public OneMan: OnesignalManagerProvider,
    public docMan: DoctoresManagerProvider,
    public wsMessenger: WsMessengerProvider,
    public serviciosManager: ServiciosManagerProvider,
    public subscriptionManager: SubscriptionManagerProvider,
    public subUserMan: SubusersManagerProvider,
    public perm: PermissionsProvider,
    public tutorial: TutorialProvider,
    public updater: UpdaterProvider,
    public reportPresentator: ReportPresentatorProvider,
    public loader: LoaderProvider,
    public networkcheck: NetworkCheckerProvider,
    public storage: StorageProvider,  
    public keyboard: Keyboard,
    public pwa: PwaProvider,
  ) {
    
    this.rootPage = 'LoginPage';
    this.startdate = new Date().getTime();
    this.initializeApp();
    this.pages = [
      { title: 'Home', component: "HomePage" },
      { title: 'Citas', component: "CitasPage" },
      { title: 'Servicios', component: "ServiciosPage" },
      { title: 'Usuarios', component: "UsuariosPage" },
      { title: 'Reportes', component: "ReportesgenPage" },
      { title: 'Login', component: "LoginPage" }
    ];
  }
  get showPWA():Boolean{ return this.pwa.showInstall; }
  DownloadPromt(){ this.pwa.show(); }

  initializeApp(){
    
    this.splashScreen.hide();
    this.rootPage = 'LoginPage';
    this.platform.ready().then(() => {

      console.log('gonna add event listener');
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt start');
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        this.pwa.pwaevent = e;
        this.pwa.showInstall = true;
        // Update UI notify the user they can install the PWA
        console.log('beforeinstallprompt',e);
      });
      this.statusBar.overlaysWebView(false);
      this.keyboard.disableScroll(false);
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#C1272D');
      this.OneMan.init();
      if(this.ica.isCordovaAvailable){  this.splashScreen.hide();  }
      let loading = this.loadingCtrl.create({content: 'Bienvenido'});
      loading.present();
      this.initLoad().then(()=>{
        if(this.userData.userData.uid !== 0){
          this.rootPage = 'HomePage';
          if(this.perm.checkUserPermission([UserDataProvider.TIPO_DOCTOR]) && !this.perm.checkUserSuscription([UserDataProvider.PLAN_ANY])){
            if(this.ica.isIos){
              this.ica.directToWebApp();
            }else{
            this.rootPage = 'MiplanPage';
            }
            }
        }
        loading.dismiss();
        this.loaddate = new Date().getTime();
        this.wsMessenger.generateMessage(
          [76],
          'loadedReport',
          `${this.userData.userData.uid}`,
          this.loaddate - this.startdate,
          true,
        );
      });
    });
  }

  //loads token and planes syncronous
  async initLoad(){
  console.log('trying to access storage');
 await this.storage.get('usr').then( res => this.userData.sessionData.usr = res );
 await this.storage.get('pss').then( res => this.userData.sessionData.pss = res );
    let token_data = await this.userData.requestToken().toPromise(); //obtener token de drupal
    if( token_data ){ this.userData.sessionData.token = token_data['token'];} //si se obtiene el token se asigna a userdata
    let planes_data = await this.planes.requestPlanes().toPromise(); //obtener lista de planes disponibles
    if( planes_data ) this.planes.setPlanes(planes_data); //si se obtiene la informacion setearla
    let connec_Data = await this.userData.checkConnect().toPromise(); //obtener connect data. este es un evento del endpoint de drupal que da informacion de la sesion de drupal actual
    if(connec_Data && connec_Data['user']['uid'] != 0){ //si se esta conectado
      //if logged in set session and userdata
      this.userData.setSessionData(connec_Data); //setear data de connect
      await this.userData.loginSetData(connec_Data['user']['uid']); //esto no recuerdo bien que hacia
      console.log('into 0');
      await this.updater.updateSuscription();
      console.log('into a');
      await this.updater.updateDocList();
      console.log('into b');
      //await this.citasManager.requestCitas().toPromise();
      await this.updater.updateCitas();
      //this.docMan.evaluateCitas();
      await this.updater.updateServicios();
      //this.serviciosManager.loadServicios();
      console.log(this.citasManager.citasData.citas);
      console.log('docs end initload',JSON.stringify(this.docMan.docData.doctoresIDs));
      //this.wsMessenger.testCitaSend();
   }
}

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  async logout(){
    await this.userData.logout();
    this.nav.setRoot("LoginPage");
  }
  

  
  openLogin(){
    this.nav.setRoot("LoginPage");
  }
  openHomePage(){this.nav.setRoot(this.Home);}
  openGrupoPage(){this.nav.setRoot("GroupPage");}
  openCitasPage(){this.nav.setRoot("CitasPage");}
  openServiciosPage(){this.nav.setRoot("ServiciosPage");}
  openUsuariosPage(){this.nav.setRoot("UsuariosPage");}
  openReportesPage(){this.nav.setRoot("ReportesgenPage");}
  openFacturacionPage(){this.nav.setRoot("FacturacionPage");}
  openterminos(){this.nav.setRoot('TerminosycondicionesPage');}
  openAviso(){this.nav.setRoot('AvisoprivacidadPage');}
  openFaq(){this.nav.setRoot('FaqPage');}
  openMiplan(){
    if( this.ica.isIos){
      this.ica.directToWebApp();
    }
    else
    this.nav.setRoot("MiplanPage");
  }

  openReporteAdeudos(){
    console.log('openReportNoModal',this.reportPresentator.docuid, this.reportPresentator.type);
    /*this.loader.presentLoader('Cargando ...');
    this.reportPresentator.setReport().then(()=>{
      this.loader.dismissLoader();
      this.reportPresentator.type = ReportPresentatorProvider.REPORT_ADEUDO;
      this.reportPresentator.loadReportNM().then(()=>{
      });
    });*/
    this.reportPresentator.type = ReportPresentatorProvider.REPORT_ADEUDO;
    this.reportPresentator.loadReportNM().then(()=>{
    });
  
  }

  openRegister(){
    //console.log("open Register");
    let Modal = this.modalCtrl.create("RegisterModalPage", undefined, { cssClass: "bigModal" });
    Modal.present({});
  }
  
  
  
  
  


}



//if(this.perm.checkUserPermission([UserDataProvider.TIPO_DOCTOR])){ //si es doctor se carga la suscripcion
  /**
   * ACLARACION DE LOS SUBUSUARIOS:
   *  los subusuarios no se "cargan" hasta que se abre la pagina de usuarios, sin embargo estos subusuarios estan listados en la suscripcion, asi que se tiene el numero de agregados en ese lugar para administrar el plan sin tener que cargar los subusuarios.
   */
/*let sus = await this.subscriptionManager.searchSus('kCsR0Z1ZrSCidi7s4m2jeV064');
this.subscriptionManager.susAssign(sus);*/
//await this.subscriptionManager.loadSubscription();
//await this.subUserMan.requestGroupUsers();
//this.subscriptionManager.subsData.subscription.removeUserFromSubs(189);
/*}else{ 
  //si son subusuarios buscar suscripciones a las que esten agregados
  console.log('looking for subscriptions where this sub user is added');
  await this.subscriptionManager.loadGroupSubuserSubs(); //se cargan subscripciones a las que estan agregados.
  this.docMan.loadGroupDoctors(); //se cargan los doctores de las suscripciones a las que estan agregados.
}*/

  /*let subusuerArray = new Array();
  subusuerArray.push(119);*/

  /*let docsArray = new Array();
  docsArray.push({uid:76,name:'do1'});
  docsArray.push({uid:189,name:'do2do'});
  //docsArray.push({uid:1202,name:'do3dx'});
  */
  /*
await this.docMan.initDoctoresUids();
await this.subscriptionManager.loadDoctorsSubscriptions();
console.log('subscription initload is', this.subscriptionManager.subsData.subscription);
console.log('kewe');
console.log('docs before filter active',JSON.stringify(this.docMan.docData.doctoresIDs));
this.docMan.filterActiveDoctors();
console.log('docs after filter active',JSON.stringify(this.docMan.docData.doctoresIDs));*/