import { observable } from "mobx";

class AppStore {

  @observable public setupDialogOpened = true;
  @observable public userName = "Mark";
  @observable public pageUrl = "https://www.dx.com";
  
  @observable public agentName = "Smith";
  @observable public agentAvatarUrl = "https://secure.gravatar.com/avatar/68b4ced53058ee78731b20ae62b86874?s=64";


  @observable public panelExpanded = true;
  @observable public mrtc_connected = false;

  @observable public currentMessage = "";
  @observable public uiMessages = observable([]) as any;
  @observable public showWidget = false;
  @observable communicationValues= observable(['chat', 'screen', 'call']) as any;
  
  public connectMrtc: (() => Promise<void>) | undefined;
  @observable public errorConnectingServer: any;
}

export default new AppStore();
