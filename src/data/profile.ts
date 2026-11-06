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
  about: '计科在读大学生，平常的爱好是将一些没用的东西上传到微软的服务器以增加其负担，偶尔会写点废话发到这个网站',
}
