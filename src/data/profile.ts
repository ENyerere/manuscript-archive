// 个人基本信息数据
export interface Profile {
  name: string
  role: string
  avatar: string
  about: string
}

export const profile: Profile = {
  name: '小峄热心市民',
  role: 'Student',
  avatar: '/img/头像.JPG',
  about: '一名普通大学生,喜欢前端开发与软件测试,偶尔写写代码,常常写写文字。这里是我的手稿档案:记录学习,也记录生活。',
}
