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
    name: string,
    documents: any[]
    user: User
}

export type User = {
  id: number,
  username: string,
  isStaff: boolean,
  isActive: boolean,
  isp?: string
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
  isStaff: boolean,
  ispId?: number
}