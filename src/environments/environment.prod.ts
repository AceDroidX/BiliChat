export const environment = {
  official: false,
  production: true,
  api_server: '/api', // 编译docker镜像时请修改此字段
  ytb_proxy: true,
  ytb_api_prefix: 'https://www.googleapis.com/youtube/v3',
  ytb_icon_prefix: 'https://yt3.ggpht.com',
  ytb_api_server: 'http://127.0.0.1:5000/ytbapi',
  ytb_chat_server: 'http://127.0.0.1:5000/ytbchat',
  default_avatar: 'https://static.hdslb.com/images/member/noface.gif'
};
