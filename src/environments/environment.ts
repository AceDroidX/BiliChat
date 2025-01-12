// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  official: false,
  production: false,
  api_server: 'http://127.0.0.1:5000/api', // bilichat.js 提供了一个简易后端服务实现
  ytb_proxy: true,
  ytb_api_prefix: 'https://www.googleapis.com/youtube/v3',
  ytb_icon_prefix: 'https://yt3.ggpht.com',
  ytb_api_server: 'http://127.0.0.1:5000/ytbapi',
  ytb_chat_server: 'ws://127.0.0.1:5000/ytbchat',
  default_avatar: 'https://static.hdslb.com/images/member/noface.gif'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
