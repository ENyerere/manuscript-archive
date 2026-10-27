// 个人基本信息数据
import avatar128 from '@/assets/avatar-128.webp'
import avatar256 from '@/assets/avatar-256.webp'

export interface Profile {
  name: string
  role: string
  /** 1x / 2x 两档头像,经 import 引入,构建时自动带上 base 与内容哈希 */
  avatar: { src: string; srcSet: string }
  about: string
}

export const profile: Profile = {
  name: '小峄热心市民',
  role: 'Student',
  avatar: { src: avatar128, srcSet: `${avatar128} 1x, ${avatar256} 2x` },
  about: '一名普通大学生,喜欢前端开发与软件测试,偶尔写写代码,常常写写文字。这里是我的手稿档案:记录学习,也记录生活。',
}
