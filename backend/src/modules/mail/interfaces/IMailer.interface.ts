export interface IMailer {
  sendWelcome(userEmail: string, username: string): Promise<void>;
  /*sendNotification(
    userEmail: string,
    data: Record<string, string>,
  ): Promise<void>;*/
  sendForgotPassword(
    userEmail: string,
    username: string,
    uuid: string,
  ): Promise<void>;
  //sendCheckOfAction(userEmail: string, actionName: string): Promise<void>;
  sendRegister(
    userEmail: string,
    username: string,
    uuid: string,
  ): Promise<void>;
}
