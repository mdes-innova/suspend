export type Category = {
    name: string,
    createdAt: string
}

export type Document = {
  id: number, 
  kindId?: number,
  kindName?: string,
  orderId: number,
  orderNo?: string,
  orderList?: string,
  orderDate?: string,
  orderFilename?: string,
  orderredNo?: string,
  orderredDate?: string,
  orderblackNo?: string,
  orderblackDate?: string,
  ispNo?: string,
  ispDate?: string,
  active?: boolean,
  groupName?: string,
  groupId?: number
}

export type Group = {
    id: number,
    createdAt: string,
    modifiedAt: string,
    name: string,
    documents: Document[],
    user: User,
    title: string,
    documentNo: string,
    documentDate?: string,
    speed?: number,
    secret?: number
}

export type User = {
  id: number,
  username: string,
  isStaff: boolean,
  isActive: boolean,
  isp?: Isp 
};

export type File = {
  id: number,
  name: string,
  red: string,
  black: string,
  date: string
}

export type Kind = {
  kindId: number,
  name: string
}

export type Isp = {
  id: number,
  name: string,
  ispId: number
}

export type UserRegister = {
  username: string,
  password: string,
  email?: string,
  isStaff: boolean,
  ispId?: number
}

export type IspFile = {
  id: number,
  user: User,
  file: Blob,
  createdAt: string
}

export type Mail = {
  id: number,
  subject: string,
  datetime?: string,
  receiver: User,
  sender: User,
  group?: Group,
  groupFiles?: GroupFile[],
  createdAt: string,
  confirmed?: boolean,
  confirmedHash?: string,
  documentNo: string,
  documentDate?: string,
  speed?: number,
  secret?: number

}

export type GroupFile = {
  id?: number,
  isp?: Isp,
  group?: Group,
  file?: Blob,
  originalFilename?: string
}