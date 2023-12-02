export type AccountModel = {
  nickname: string
  username: string
  avatar_url: string
  sex: 'MALE' | 'FEMALE' | 'OTHER'
  desc: string
  is_staff: boolean
}
